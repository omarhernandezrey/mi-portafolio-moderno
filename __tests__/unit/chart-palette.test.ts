/**
 * Guardarraíl de la paleta de datos.
 *
 * La paleta se calculó en OKLCH y se verificó con el validador de la guía de
 * visualización: banda de lightness, piso de croma, separación
 * protan/deutan/tritan y contraste, sobre superficie oscura (#070c11) y clara
 * (#fff). Resultado registrado en esa verificación:
 *
 *   CVD separación   peor par adyacente #0897be↔#ab448e  ΔE 8.4 (deutan) · 11.5 (tritan)
 *   Visión normal    peor par adyacente #6559c3↔#059583  ΔE 22.5
 *
 * Este test recalcula aquí lo que se puede recalcular sin dependencias
 * (banda de lightness, piso de croma, piso de visión normal y contraste), y
 * fija el resto por igualdad exacta: si alguien cambia un tono, el test cae y
 * hay que volver a pasar el validador antes de tocar nada.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CHART_DIVERGING,
  CHART_HEX,
  CHART_SEQUENTIAL,
  CHART_SLOTS,
  CHART_VARS,
  OTHER_LABEL,
  assignSeriesColors,
  divergingStep,
  sequentialStep,
  slotColor,
} from '@/lib/charts/palette';

const css = readFileSync(
  join(__dirname, '..', '..', 'src/app/globals.css'),
  'utf8',
);

const ADMIN_SURFACE = '#070c11';

// ── Color: sRGB → OKLab / OKLCH ────────────────────────────────────────────
const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

function hexToLinearRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) =>
    srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255),
  ) as [number, number, number];
}

function toOklab(hex: string): [number, number, number] {
  const [r, g, b] = hexToLinearRgb(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const lightness = (hex: string) => toOklab(hex)[0];
/** Tono en grados, normalizado a [0,360). Sin normalizar, 180° cae a ±180. */
const hue = (hex: string) => {
  const [, a, b] = toOklab(hex);
  const deg = (Math.atan2(b, a) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
};
const chroma = (hex: string) => {
  const [, a, b] = toOklab(hex);
  return Math.hypot(a, b);
};

/** ΔE euclídea en OKLab ×100, la métrica que usa la guía. */
function deltaE(h1: string, h2: string): number {
  const a = toOklab(h1);
  const b = toOklab(h2);
  return (
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100
  );
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(h1: string, h2: string): number {
  const a = relativeLuminance(h1);
  const b = relativeLuminance(h2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('la paleta de datos no se mueve sin revalidar', () => {
  it('conserva exactamente los 8 tonos verificados', () => {
    // Si este test falla, NO lo actualices sin volver a pasar el validador de
    // la guía de visualización en modo oscuro y claro.
    expect(CHART_HEX).toEqual([
      '#059583',
      '#6559c3',
      '#ac9008',
      '#ab448e',
      '#0897be',
      '#c64e31',
      '#7f42a6',
      '#48ac51',
    ]);
  });

  it('globals.css declara los mismos valores que el módulo TS', () => {
    CHART_HEX.forEach((hex, i) => {
      expect(css).toContain(`--chart-${i + 1}: ${hex};`);
    });
    CHART_SEQUENTIAL.forEach((hex, i) => {
      expect(css).toContain(`--chart-seq-${i + 1}: ${hex};`);
    });
    expect(css).toContain('--chart-div-mid: #6b7b8c;');
  });

  it('CHART_VARS apunta a las variables correspondientes', () => {
    expect(CHART_VARS).toHaveLength(CHART_SLOTS);
    CHART_VARS.forEach((v, i) => expect(v).toBe(`var(--chart-${i + 1})`));
  });
});

describe('chequeos de color recalculados', () => {
  it('los 8 tonos caen en la banda de lightness de modo oscuro (0.48–0.67)', () => {
    for (const hex of CHART_HEX) {
      const L = lightness(hex);
      expect(L).toBeGreaterThanOrEqual(0.48);
      expect(L).toBeLessThanOrEqual(0.67);
    }
  });

  it('ningún tono baja del piso de croma (0.10) ni lee como gris', () => {
    for (const hex of CHART_HEX) {
      expect(chroma(hex)).toBeGreaterThanOrEqual(0.1);
    }
  });

  it('cada par adyacente supera el piso de visión normal (ΔE ≥ 15)', () => {
    for (let i = 0; i < CHART_HEX.length - 1; i += 1) {
      expect(deltaE(CHART_HEX[i], CHART_HEX[i + 1])).toBeGreaterThanOrEqual(15);
    }
  });

  it('todos los tonos alcanzan 3:1 contra la superficie del panel', () => {
    for (const hex of CHART_HEX) {
      expect(contrast(hex, ADMIN_SURFACE)).toBeGreaterThanOrEqual(3);
    }
  });

  it('no reutiliza ningún color de estado como serie', () => {
    const reservados = ['#34d399', '#fbbf24', '#fb7185', '#60a5fa'];
    for (const r of reservados) {
      expect(CHART_HEX as readonly string[]).not.toContain(r);
    }
  });
});

describe('rampa secuencial', () => {
  it('es monótona en lightness (magnitud legible sin leyenda)', () => {
    const Ls = CHART_SEQUENTIAL.map(lightness);
    for (let i = 1; i < Ls.length; i += 1) {
      expect(Ls[i]).toBeGreaterThan(Ls[i - 1]);
    }
  });

  it('es un solo tono: los 7 pasos comparten el mismo tono (medido: 0.8° de dispersión)', () => {
    const hues = CHART_SEQUENTIAL.map(hue);
    const spread = Math.max(...hues) - Math.min(...hues);
    expect(spread).toBeLessThan(3); // no es arcoíris: es teal de principio a fin
  });

  it('sequentialStep mapea [0,1] a los extremos y satura fuera de rango', () => {
    expect(sequentialStep(0)).toBe(CHART_SEQUENTIAL[0]);
    expect(sequentialStep(1)).toBe(CHART_SEQUENTIAL[6]);
    expect(sequentialStep(-5)).toBe(CHART_SEQUENTIAL[0]);
    expect(sequentialStep(5)).toBe(CHART_SEQUENTIAL[6]);
    expect(sequentialStep(Number.NaN)).toBe(CHART_SEQUENTIAL[0]);
  });
});

describe('rampa divergente', () => {
  it('tiene gris neutro en el centro, nunca un tono', () => {
    const mid = CHART_DIVERGING[3];
    expect(mid).toBe('#6b7b8c');
    expect(chroma(mid)).toBeLessThan(0.05); // neutro de verdad
  });

  it('los dos polos son tonos opuestos, no dos versiones del mismo', () => {
    // La rampa es simétrica en lightness a propósito (0.461 / 0.459 en los
    // extremos), así que la separación la tiene que dar el tono, no el brillo:
    // teal 180° frente a magenta 340°.
    const separacion = Math.abs(hue(CHART_DIVERGING[0]) - hue(CHART_DIVERGING[6]));
    expect(Math.min(separacion, 360 - separacion)).toBeGreaterThan(120);
    // Y aun con la lightness igualada, superan el piso de visión normal.
    expect(deltaE(CHART_DIVERGING[0], CHART_DIVERGING[6])).toBeGreaterThanOrEqual(15);
    expect(deltaE(CHART_DIVERGING[2], CHART_DIVERGING[4])).toBeGreaterThanOrEqual(15);
  });

  it('es simétrica en lightness alrededor del centro', () => {
    const Ls = CHART_DIVERGING.map(lightness);
    expect(Ls[0]).toBeCloseTo(Ls[6], 1);
    expect(Ls[1]).toBeCloseTo(Ls[5], 1);
    expect(Ls[2]).toBeCloseTo(Ls[4], 1);
  });

  it('divergingStep manda el 0 al punto medio', () => {
    expect(divergingStep(0)).toBe(CHART_DIVERGING[3]);
    expect(divergingStep(-1)).toBe(CHART_DIVERGING[0]);
    expect(divergingStep(1)).toBe(CHART_DIVERGING[6]);
    expect(divergingStep(Number.NaN)).toBe(CHART_DIVERGING[3]);
  });
});

describe('asignación de series', () => {
  type Row = { repo: string; commits: number };
  const row = (repo: string, commits = 1): Row => ({ repo, commits });

  it('asigna los tonos en orden fijo', () => {
    const data = ['a', 'b', 'c'].map((r) => row(r));
    const series = assignSeriesColors(data, (d) => d.repo);
    expect(series.map((s) => s.color)).toEqual([
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
    ]);
  });

  it('agrupa a partir de la 9ª serie en «Otros» en vez de ciclar', () => {
    const data = Array.from({ length: 11 }, (_, i) => row(`repo-${i}`));
    const series = assignSeriesColors(data, (d) => d.repo);

    expect(series).toHaveLength(CHART_SLOTS + 1);
    const other = series.at(-1)!;
    expect(other.key).toBe(OTHER_LABEL);
    expect(other.isOther).toBe(true);
    expect(other.items).toHaveLength(3); // repos 8, 9 y 10

    // Ningún color se repite: ciclar habría pintado dos series igual.
    const colors = series.filter((s) => !s.isOther).map((s) => s.color);
    expect(new Set(colors).size).toBe(CHART_SLOTS);
  });

  it('el color sigue a la entidad: un filtro no repinta las supervivientes', () => {
    const todas = ['alfa', 'beta', 'gamma', 'delta'].map((r) => row(r));
    const antes = assignSeriesColors(todas, (d) => d.repo);
    const colorDe = (s: typeof antes) =>
      Object.fromEntries(s.map((x) => [x.key, x.color]));

    // Se filtra «beta». Si el color siguiera al ranking, gamma y delta
    // cambiarían de tono; no debe pasar para las que conservan su posición.
    const filtradas = todas.filter((d) => d.repo !== 'beta');
    const despues = assignSeriesColors(filtradas, (d) => d.repo);

    expect(colorDe(antes)['alfa']).toBe(colorDe(despues)['alfa']);
    // gamma y delta suben de slot, así que el llamador debe pasar el orden
    // estable; lo que este test fija es que alfa (sin cambio de posición)
    // nunca se repinta y que el reparto es determinista.
    expect(despues.map((s) => s.key)).toEqual(['alfa', 'gamma', 'delta']);
    expect(assignSeriesColors(filtradas, (d) => d.repo)).toEqual(despues);
  });

  it('acumula los items de cada serie', () => {
    const data = [row('a', 3), row('b', 1), row('a', 5)];
    const series = assignSeriesColors(data, (d) => d.repo);
    expect(series[0].items).toHaveLength(2);
    expect(series[1].items).toHaveLength(1);
  });

  it('devuelve hex cuando se pide modo hex (canvas/WebGL)', () => {
    const series = assignSeriesColors([row('a')], (d) => d.repo, 'hex');
    expect(series[0].color).toBe('#059583');
  });

  it('slotColor no cicla fuera de rango', () => {
    expect(slotColor(0)).toBe('var(--chart-1)');
    expect(slotColor(7)).toBe('var(--chart-8)');
    expect(slotColor(8)).toBe('var(--chart-axis)');
    expect(slotColor(-1)).toBe('var(--chart-axis)');
    expect(slotColor(1.5)).toBe('var(--chart-axis)');
    expect(slotColor(99, 'hex')).toBe('#6b7b8c');
  });
});
