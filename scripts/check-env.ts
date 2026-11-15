/**
 * Auditoría del entorno local: `npm run env:check`.
 *
 * Cruza los `.env*` de la máquina con lo que el código lee de verdad,
 * con `.env.example`, con el esquema de `src/config/env.ts` y con los workflows.
 * Imprime nombres y veredictos. Nunca un valor.
 *
 *   npm run env:check             informe legible
 *   npm run env:check -- --json   lo mismo, para leerlo con una herramienta
 *
 * Sale con 1 si falta una variable obligatoria o una clave de Supabase es incoherente.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  auditarEntorno,
  comprobarSupabase,
  nombresDelEsquema,
  nombresExpandidosEnShell,
  nombresLeidosPorElCodigo,
  parsearEnv,
  sinValores,
  usoEnWorkflows,
  type VariableConValor,
} from '../src/lib/env/audit';

const RAIZ = process.cwd();
const ARCHIVOS_LOCALES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
];
const IGNORAR = new Set(['node_modules', '.next', '.git', 'coverage', 'out', 'dist']);

function recorrer(directorio: string, extensiones: RegExp): string[] {
  if (!existsSync(directorio)) return [];
  return readdirSync(directorio).flatMap((nombre) => {
    if (IGNORAR.has(nombre)) return [];
    const ruta = join(directorio, nombre);
    if (statSync(ruta).isDirectory()) return recorrer(ruta, extensiones);
    return extensiones.test(nombre) ? [ruta] : [];
  });
}

const leer = (rutas: string[]) => rutas.map((ruta) => readFileSync(ruta, 'utf8')).join('\n');

const codigo = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const deRaiz = readdirSync(RAIZ)
  .filter((n) => codigo.test(n) && statSync(join(RAIZ, n)).isFile())
  .map((n) => join(RAIZ, n));
const textoCodigo = leer([...recorrer(join(RAIZ, 'src'), codigo), ...recorrer(join(RAIZ, 'scripts'), codigo), ...deRaiz]);
const textoShell = leer(recorrer(join(RAIZ, 'scripts'), /\.sh$/));
const textoWorkflows = leer(recorrer(join(RAIZ, '.github', 'workflows'), /\.ya?ml$/));

const locales: VariableConValor[] = ARCHIVOS_LOCALES.filter((a) => existsSync(join(RAIZ, a))).flatMap((a) =>
  parsearEnv(readFileSync(join(RAIZ, a), 'utf8'), a),
);
const archivosEncontrados = [...new Set(locales.map((v) => v.archivo))];

const rutaEjemplo = join(RAIZ, '.env.example');
const ejemplo = existsSync(rutaEjemplo)
  ? parsearEnv(readFileSync(rutaEjemplo, 'utf8'), '.env.example').map((v) => v.nombre)
  : [];
const rutaEsquema = join(RAIZ, 'src', 'config', 'env.ts');
const esquema = existsSync(rutaEsquema)
  ? nombresDelEsquema(readFileSync(rutaEsquema, 'utf8'))
  : { obligatorias: [], opcionales: [] };

const informe = auditarEntorno({
  locales: sinValores(locales),
  ejemplo,
  codigo: nombresLeidosPorElCodigo(textoCodigo),
  shell: nombresExpandidosEnShell(textoShell),
  obligatorias: esquema.obligatorias,
  ci: usoEnWorkflows(textoWorkflows),
});

// Next.js da prioridad a los archivos más específicos: el último de la lista gana.
const valores: Record<string, string> = {};
for (const v of locales) if (!v.vacia) valores[v.nombre] = v.valor;
const supabase = comprobarSupabase(valores);

const hayLocales = archivosEncontrados.length > 0;
const bloqueante =
  hayLocales && (informe.obligatoriasSinValor.length > 0 || supabase.some((c) => c.veredicto === 'fallo'));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ archivos: archivosEncontrados, informe, supabase, bloqueante }, null, 2));
} else {
  const seccion = (titulo: string, nombres: string[], siVacio = 'ninguna') =>
    console.log(`\n${titulo} (${nombres.length})\n  ${nombres.length ? nombres.join('\n  ') : siVacio}`);

  console.log('AUDITORÍA DEL ENTORNO: solo nombres, nunca valores');
  console.log(`Raíz: ${relative(process.cwd(), RAIZ) || '.'}`);
  console.log(`Archivos locales leídos: ${hayLocales ? archivosEncontrados.join(', ') : 'NINGUNO'}`);

  if (hayLocales) {
    seccion('Obligatorias sin valor · BLOQUEA', informe.obligatoriasSinValor);
    seccion('El código las lee y faltan en el entorno local', informe.faltanEnLocal);
    seccion('Están en el entorno local y nada las lee · candidatas a retirar', informe.sobranEnLocal);
    seccion('Presentes pero vacías', informe.vaciasEnLocal);
    seccion('Con texto de plantilla en vez de un valor real', informe.conMarcador);
    seccion('Repetidas dentro de un mismo archivo', informe.duplicadas);
    console.log(`\nCoherencia de Supabase (${supabase.length})`);
    for (const c of supabase) {
      const marca = c.veredicto === 'ok' ? 'OK   ' : c.veredicto === 'fallo' ? 'FALLO' : '—    ';
      console.log(`  ${marca} ${c.que}: ${c.detalle}`);
    }
    if (!supabase.length) console.log('  no hay variables de Supabase definidas');
  } else {
    console.log('\nNo hay ningún .env en esta máquina: solo se audita el repositorio.');
  }

  seccion('El código las lee y .env.example no las documenta', informe.sinDocumentar);
  seccion('.env.example las documenta y nada las lee', informe.documentadasSinUso);
  seccion('Los workflows las definen y nada las consume · revisar', informe.ciSinUso);
  console.log(bloqueante ? '\nRESULTADO: HAY BLOQUEOS' : '\nRESULTADO: sin bloqueos');
}

process.exit(bloqueante ? 1 : 0);
