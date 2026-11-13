/**
 * Guardarraíl del sistema de diseño.
 *
 * Dos invariantes que no se pueden romper:
 *  1. Los tokens estructurales (radio, elevación, glow, movimiento) existen y
 *     se exponen a Tailwind, así que ningún componente nuevo necesita valores
 *     arbitrarios tipo `rounded-[32px]`.
 *  2. Las 10 paletas conmutables siguen definiendo sus variables de color. La
 *     paleta del portafolio es intocable: si una desaparece, el PaletteToggle
 *     deja el sitio sin color y este test tiene que fallar antes del deploy.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const css = readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8');

// eslint-disable-next-line @typescript-eslint/no-require-imports -- config CommonJS
const tailwind = require(join(ROOT, 'tailwind.config.js'));
const extend = tailwind.theme.extend;

describe('tokens estructurales en globals.css', () => {
  const vars = [
    '--radius-field',
    '--radius-chip',
    '--radius-card',
    '--radius-panel',
    '--radius-canvas',
    '--elev-1',
    '--elev-2',
    '--elev-3',
    '--elev-4',
    '--glow-sm',
    '--glow-md',
    '--glow-lg',
    '--dur-fast',
    '--dur-base',
    '--dur-slow',
    '--ease-out-expo',
    '--ease-in-out-soft',
  ];

  it.each(vars)('define %s', (name) => {
    expect(css).toContain(`${name}:`);
  });

  it('no introduce color en los tokens estructurales', () => {
    // El bloque de tokens estructurales va de su cabecera a la del admin.
    const start = css.indexOf('TOKENS ESTRUCTURALES');
    const end = css.indexOf('ADMIN SUITE', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const block = css.slice(start, end);
    // Permitido: rgb(0 0 0 / x%) para sombras. Prohibido: cualquier hex.
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});

describe('las 10 paletas siguen completas', () => {
  const coreVars = [
    '--background-color',
    '--secondary-background-color',
    '--text-color',
    '--muted-color',
    '--primary-color',
    '--accent-color',
    '--card-bg-color',
  ];

  // palette1 es :root; palette2..palette10 son clases en <html>.
  const selectors = [
    ':root',
    ...Array.from({ length: 9 }, (_, i) => `.palette${i + 2}`),
  ];

  it.each(selectors)('%s declara los colores núcleo', (selector) => {
    const start = css.indexOf(`${selector} {`);
    expect(start).toBeGreaterThan(-1);

    const block = css.slice(start, css.indexOf('}', start));
    for (const v of coreVars) {
      expect(block).toContain(`${v}:`);
    }
  });
});

describe('tailwind expone los tokens', () => {
  it('borderRadius nombrado apunta a variables CSS', () => {
    expect(Object.keys(extend.borderRadius).sort()).toEqual([
      'canvas',
      'card',
      'chip',
      'field',
      'panel',
    ]);
    for (const value of Object.values(extend.borderRadius)) {
      expect(value).toMatch(/^var\(--radius-/);
    }
  });

  it('la escala de elevación e1..e4 apunta a variables CSS', () => {
    for (const key of ['e1', 'e2', 'e3', 'e4'] as const) {
      expect(extend.boxShadow[key]).toBe(`var(--elev-${key.slice(1)})`);
    }
  });

  it('la escala tipográfica cubre los roles del dashboard', () => {
    expect(Object.keys(extend.fontSize).sort()).toEqual([
      'kicker',
      'label',
      'metric',
      'metric-sm',
      'section',
    ]);
    // Las métricas escalan con el viewport para no desbordar a 375px.
    expect(extend.fontSize.metric[0]).toContain('clamp(');
    expect(extend.fontSize['metric-sm'][0]).toContain('clamp(');
  });

  it('duraciones, easings y glow apuntan a variables CSS', () => {
    for (const value of Object.values(extend.transitionDuration)) {
      expect(value).toMatch(/^var\(--dur-/);
    }
    for (const value of Object.values(extend.transitionTimingFunction)) {
      expect(value).toMatch(/^var\(--ease-/);
    }
    for (const value of Object.values(extend.blur)) {
      expect(value).toMatch(/^var\(--glow-/);
    }
  });

  it('los colores siguen siendo punteros a variables, nunca hex', () => {
    for (const value of Object.values(extend.colors)) {
      expect(typeof value).toBe('string');
      expect(value as string).toContain('var(--');
      expect(value as string).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });
});
