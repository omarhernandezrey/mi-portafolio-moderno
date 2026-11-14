/**
 * La paleta del portafolio es intocable.
 *
 * Restricción del propietario (PLAN_MAESTRO_DASHBOARD.md §2 y DESIGN.md, «La
 * Regla de la Paleta Intocable»): los valores de las diez paletas conmutables
 * y los del panel no se modifican, no se «mejoran» y no se sustituyen.
 *
 * design-tokens.test.ts comprueba que las variables EXISTEN; este test fija sus
 * VALORES. Si falla, alguien cambió un color: se revierte el cambio, no el
 * test. Solo Omar puede autorizar actualizar estos valores.
 *
 * Fijados leyendo src/app/globals.css el 2026-11-14.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(
  join(__dirname, '..', '..', 'src/app/globals.css'),
  'utf8',
);

function bloque(selector: string): string {
  const inicio = css.indexOf(`${selector} {`);
  if (inicio === -1) throw new Error(`No se encontró ${selector} en globals.css`);
  return css.slice(inicio, css.indexOf('}', inicio));
}

function valor(cuerpo: string, variable: string): string | undefined {
  const m = cuerpo.match(new RegExp(`${variable}:\\s*([^;]+);`));
  return m?.[1].trim();
}

const PALETAS: Record<string, Record<string, string>> = {
  ":root": {
    "--background-color": "#0d131a",
    "--secondary-background-color": "#1c2731",
    "--text-color": "#e5e7eb",
    "--muted-color": "#b8bfca",
    "--primary-color": "#00cba9",
    "--accent-color": "#00a086",
    "--card-bg-color": "#1c2731"
  },
  ".palette2": {
    "--background-color": "#1c1c2e",
    "--secondary-background-color": "#28283c",
    "--text-color": "#f4f4f9",
    "--muted-color": "#d1d1e0",
    "--primary-color": "#ff6f61",
    "--accent-color": "#f39c12",
    "--card-bg-color": "#28283c"
  },
  ".palette3": {
    "--background-color": "#171615",
    "--secondary-background-color": "#262421",
    "--text-color": "#fff9e9",
    "--muted-color": "#d3ba8a",
    "--primary-color": "#ffd65a",
    "--accent-color": "#c5961f",
    "--card-bg-color": "#262421"
  },
  ".palette4": {
    "--background-color": "#f9fcfb",
    "--secondary-background-color": "#fff",
    "--text-color": "#2d2d2d",
    "--muted-color": "#7a7a7a",
    "--primary-color": "#00cba9",
    "--accent-color": "#00a086",
    "--card-bg-color": "#fff"
  },
  ".palette5": {
    "--background-color": "#141414",
    "--secondary-background-color": "#1f1f1f",
    "--text-color": "#eeeeee",
    "--muted-color": "#a0a0a0",
    "--primary-color": "#ed3434",
    "--accent-color": "#fa5c5c",
    "--card-bg-color": "#1f1f1f"
  },
  ".palette6": {
    "--background-color": "#0a0a1a",
    "--secondary-background-color": "#151530",
    "--text-color": "#e0e0ff",
    "--muted-color": "#a0a0ff",
    "--primary-color": "#f0f",
    "--accent-color": "#0ff",
    "--card-bg-color": "#151530"
  },
  ".palette7": {
    "--background-color": "#0a1a0f",
    "--secondary-background-color": "#132a1a",
    "--text-color": "#e0f0e6",
    "--muted-color": "#a3c9b5",
    "--primary-color": "#4caf50",
    "--accent-color": "#8bc34a",
    "--card-bg-color": "#132a1a"
  },
  ".palette8": {
    "--background-color": "#1a0a14",
    "--secondary-background-color": "#2a1320",
    "--text-color": "#ffd6e7",
    "--muted-color": "#ffa8c8",
    "--primary-color": "#ff6b6b",
    "--accent-color": "#ffb347",
    "--card-bg-color": "#2a1320"
  },
  ".palette9": {
    "--background-color": "#0a0a1f",
    "--secondary-background-color": "#15152b",
    "--text-color": "#e0eaff",
    "--muted-color": "#a8b8d0",
    "--primary-color": "#00b4d8",
    "--accent-color": "#0077b6",
    "--card-bg-color": "#15152b"
  },
  ".palette10": {
    "--background-color": "#0f0a1a",
    "--secondary-background-color": "#1a132a",
    "--text-color": "#e6d6ff",
    "--muted-color": "#b39ddb",
    "--primary-color": "#9c27b0",
    "--accent-color": "#673ab7",
    "--card-bg-color": "#1a132a"
  }
};

const PANEL: Record<string, string> = {
  "--background-color": "#070c11",
  "--secondary-background-color": "#0b131a",
  "--card-bg-color": "#0f1922",
  "--white-color": "#f8fafc",
  "--text-color": "#dbe6f0",
  "--muted-color": "#8ea0b5",
  "--primary-color": "#2dd4bf",
  "--accent-color": "#7dd3fc",
  "--inner-circle-bg-color": "#2dd4bf",
  "--inner-circle-text-color": "#06201c",
  "--admin-bg": "#070c11",
  "--admin-surface": "#0b131a",
  "--admin-raised": "#101c26",
  "--admin-line": "#1e2c38",
  "--admin-ink": "#f1f6fa",
  "--admin-muted": "#8ea0b5",
  "--admin-success": "#34d399",
  "--admin-warning": "#fbbf24",
  "--admin-danger": "#fb7185",
  "--admin-info": "#60a5fa"
};

describe('las diez paletas conservan sus valores exactos', () => {
  it.each(Object.keys(PALETAS))('%s', (selector) => {
    const cuerpo = bloque(selector);
    for (const [variable, esperado] of Object.entries(PALETAS[selector])) {
      expect({ variable, valor: valor(cuerpo, variable) }).toEqual({
        variable,
        valor: esperado,
      });
    }
  });
});

describe('el tema aislado del panel conserva sus valores exactos', () => {
  it('.admin-shell', () => {
    const cuerpo = bloque('.admin-shell');
    for (const [variable, esperado] of Object.entries(PANEL)) {
      expect({ variable, valor: valor(cuerpo, variable) }).toEqual({
        variable,
        valor: esperado,
      });
    }
  });
});
