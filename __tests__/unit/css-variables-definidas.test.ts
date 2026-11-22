/**
 * Ninguna `var(--x)` sin definir.
 *
 * Cuatro variables se consumían en `Card.tsx`, `NewsletterForm.tsx`,
 * `EducationModal.tsx` y en dos reglas globales de `globals.css`, y no estaban
 * definidas en ninguna parte del proyecto. El fallo es silencioso por
 * construcción: una `var()` sin definir deja la declaración «inválida en
 * tiempo de valor calculado», el navegador la descarta y no hay error en
 * consola, ni aviso de build, ni test que caiga. El hover previsto
 * simplemente no ocurría, en las diez paletas, y así llevaba meses.
 *
 * Esta prueba es el guardarraíl: recorre el CSS y el código, y falla si
 * alguien vuelve a referenciar un token que no existe.
 */
import fs from 'fs';
import path from 'path';

const RAIZ = path.join(__dirname, '..', '..');
const CSS = path.join(RAIZ, 'src', 'app', 'globals.css');

/**
 * Variables que define el propio Tailwind o el navegador y que no viven en
 * `globals.css`. No son tokens del sistema de diseño.
 */
const EXTERNAS = /^--(tw-|font-|radix-|headlessui-)/;

function listarArchivos(dir: string, exts: string[]): string[] {
  const salida: string[] = [];
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      salida.push(...listarArchivos(p, exts));
    } else if (exts.some((e) => entrada.name.endsWith(e))) {
      salida.push(p);
    }
  }
  return salida;
}

/** Comentarios fuera: un `var(--x)` citado en una explicación no es un uso. */
function sinComentarios(texto: string): string {
  return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Nombres definidos en cualquier sitio: en una hoja (`--x:` dentro de un
 * bloque) o inline en un objeto de estilo de React (`'--x': valor`), que es
 * como `ScrollReveal` y `HeroSection` pasan sus variables de animación.
 */
function variablesDefinidas(): Set<string> {
  const definidas = new Set<string>();

  const hojas = [CSS, ...listarArchivos(path.join(RAIZ, 'src'), ['.css'])];
  for (const hoja of new Set(hojas)) {
    for (const m of sinComentarios(fs.readFileSync(hoja, 'utf8')).matchAll(
      /(--[a-zA-Z0-9-]+)\s*:/g,
    )) {
      definidas.add(m[1]);
    }
  }

  for (const archivo of listarArchivos(path.join(RAIZ, 'src'), ['.ts', '.tsx'])) {
    for (const m of sinComentarios(fs.readFileSync(archivo, 'utf8')).matchAll(
      /['"](--[a-zA-Z0-9-]+)['"]\s*:/g,
    )) {
      definidas.add(m[1]);
    }
  }

  return definidas;
}

/** Cada `var(--x)` del proyecto, con el archivo donde aparece. */
function variablesUsadas(): Map<string, Set<string>> {
  const usos = new Map<string, Set<string>>();
  const archivos = listarArchivos(path.join(RAIZ, 'src'), [
    '.ts',
    '.tsx',
    '.css',
  ]);
  for (const archivo of archivos) {
    const texto = sinComentarios(fs.readFileSync(archivo, 'utf8'));
    for (const m of texto.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
      const nombre = m[1];
      if (!usos.has(nombre)) usos.set(nombre, new Set());
      usos.get(nombre)!.add(path.relative(RAIZ, archivo));
    }
  }
  return usos;
}

describe('variables CSS', () => {
  const definidas = variablesDefinidas();
  const usadas = variablesUsadas();

  it('encuentra variables de verdad (la prueba no está vacía)', () => {
    // Guardia contra el fallo clásico de una prueba de ausencias: si los
    // recorridos devolvieran nada, todo pasaría sin medir nada.
    expect(definidas.size).toBeGreaterThan(50);
    expect(usadas.size).toBeGreaterThan(20);
    expect(definidas.has('--primary-color')).toBe(true);
  });

  it('toda var(--x) usada en el código está definida en alguna hoja', () => {
    const huerfanas: string[] = [];
    for (const [nombre, archivos] of usadas) {
      if (EXTERNAS.test(nombre)) continue;
      // Una `var()` con respaldo —`var(--x, algo)`— no rompe nada aunque `--x`
      // no exista, pero aquí no se usa ese patrón; si se empieza a usar,
      // conviene revisarlo a mano antes de aflojar esta prueba.
      if (!definidas.has(nombre)) {
        huerfanas.push(`${nombre}  ←  ${[...archivos].join(', ')}`);
      }
    }
    expect(huerfanas).toEqual([]);
  });

  it('las cuatro que estaban huérfanas siguen resueltas', () => {
    // Regresión explícita del defecto que originó esta prueba.
    expect(definidas.has('--primary-hover-color')).toBe(true);
    expect(definidas.has('--accent-hover-color')).toBe(true);
    // La quinta, encontrada por esta misma prueba: el mensaje de error del
    // newsletter la pedía y no existía.
    expect(definidas.has('--error-color')).toBe(true);
    // Estas dos se eliminaron: su regla global ahora escribe `transparent`
    // directo, porque darles un color habría pintado todo <a> y <button>.
    expect(usadas.has('--button-bg-color')).toBe(false);
    expect(usadas.has('--button-hover-color')).toBe(false);
  });

  it('los estados de hover se derivan de la paleta, no son hex fijos', () => {
    const css = fs.readFileSync(CSS, 'utf8');
    for (const v of ['--primary-hover-color', '--accent-hover-color']) {
      const m = css.match(new RegExp(`${v}\\s*:\\s*([^;]+);`));
      expect(m).not.toBeNull();
      const valor = m![1];
      // `color-mix` sobre la variable de la paleta: así las diez funcionan
      // sin que haya que definirlas una por una.
      expect(valor).toMatch(/color-mix/);
      expect(valor).toMatch(/var\(--(primary|accent)-color\)/);
    }
  });
});
