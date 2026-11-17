/**
 * Guardarraíl de T-26: los primitivos del panel hablan los tokens del sistema.
 *
 * La auditoría del 2026-11-17 encontró que el vocabulario «de plantilla»
 * (paleta cruda de Tailwind, sombras arbitrarias, halos de color, tamaños en
 * px sueltos) se había colado hasta en los primitivos — y de ahí se copiaba a
 * las páginas. T-26 lo erradicó; este test impide que vuelva a entrar por la
 * puerta de `admin/ui`, que es de donde las páginas heredan el estilo.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const UI_DIR = join(ROOT, 'src/components/admin/ui');

// Componentes sueltos de admin ya saneados en T-26: mismas reglas.
const EXTRA = [
  'src/components/admin/LeadActions.tsx',
  'src/components/admin/FeedPostRowActions.tsx',
  'src/components/admin/FeedCommentRowActions.tsx',
];

const archivos: Array<[string, string]> = [
  ...readdirSync(UI_DIR)
    .filter((n) => n.endsWith('.tsx'))
    .map((n): [string, string] => [`admin/ui/${n}`, readFileSync(join(UI_DIR, n), 'utf8')]),
  ...EXTRA.map((ruta): [string, string] => [ruta, readFileSync(join(ROOT, ruta), 'utf8')]),
];

const REGLAS: Array<[string, RegExp]> = [
  // El estado se pinta con admin-success/warning/danger/info, nunca con la
  // paleta cruda de Tailwind (no acompaña a las 10 paletas del sitio).
  [
    'paleta cruda de Tailwind',
    /(?:text|bg|border|ring|from|via|to)-(?:red|green|blue|amber|orange|purple|indigo|cyan|rose|emerald|yellow|lime|teal|sky|violet|fuchsia|pink)-\d{3}/,
  ],
  // Elevación por escala e1..e4; una sombra escrita a mano esquiva el sistema.
  ['sombra arbitraria', /shadow-\[/],
  // Los halos de color (shadow-custom-*) violan «la luz por detrás».
  ['halo de color', /shadow-custom-/],
  // Tamaños de letra por tokens (…, 2xs, 3xs, 4xs), nunca px sueltos.
  ['tamaño de letra literal', /text-\[\d+px\]/],
  // Radios por rol (field/chip/card/panel/canvas), no la escala genérica.
  ['radio genérico rounded-2xl/3xl', /rounded-(?:2xl|3xl)\b/],
  // La cursiva es de la marca («Admin Suite»), no de los primitivos.
  ['itálica en primitivos', /\bitalic\b/],
];

describe('primitivos de admin sin vocabulario de plantilla (T-26)', () => {
  it.each(archivos.map(([nombre]) => nombre))('%s', (nombre) => {
    const contenido = archivos.find(([n]) => n === nombre)![1];
    for (const [regla, patron] of REGLAS) {
      const match = contenido.match(patron);
      expect(
        match ? `${regla}: «${match[0]}»` : null
      ).toBeNull();
    }
  });

  it('StatCard usa la voz Metric del sistema con tabular-nums', () => {
    const statCard = archivos.find(([n]) => n.endsWith('StatCard.tsx'))![1];
    expect(statCard).toContain('text-metric-sm');
    expect(statCard).toContain('tabular-nums');
  });

  it('AdminCard y StatCard se elevan con la escala e3', () => {
    for (const sufijo of ['AdminCard.tsx', 'StatCard.tsx']) {
      expect(archivos.find(([n]) => n.endsWith(sufijo))![1]).toContain('shadow-e3');
    }
  });
});
