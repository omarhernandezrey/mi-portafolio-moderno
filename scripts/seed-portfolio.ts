/**
 * Genera el SQL del seed del portafolio.
 *
 *   npm run seed:portfolio
 *
 * Escribe `supabase/seed/portfolio_seed.sql`, que se aplica igual que una
 * migración: pegándolo en el SQL Editor de Supabase o con el conector.
 *
 * El script es una cáscara fina: toda la lógica vive en
 * `src/lib/portfolio/seed/`, que es puro y está testeado. Aquí solo se
 * construyen las filas, se comprueban los conteos contra `CONTENIDO_ORIGINAL`
 * y se escribe el archivo.
 *
 * Si un conteo no cuadra, el script **falla** en vez de escribir un seed
 * incompleto: la garantía de «no se pierde nada» no es un comentario, es una
 * comprobación.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { conteosDelSeed, construirFilasDelSeed } from '../src/lib/portfolio/seed/build';
import { sqlDelSeed } from '../src/lib/portfolio/seed/sql';
import { CONTENIDO_ORIGINAL } from '../src/lib/portfolio/types';

const DESTINO = join(__dirname, '..', 'supabase', 'seed', 'portfolio_seed.sql');

function main(): void {
  const filas = construirFilasDelSeed();
  const conteos = conteosDelSeed(filas);

  const discrepancias = Object.entries(CONTENIDO_ORIGINAL)
    .filter(([clave, esperado]) => conteos[clave as keyof typeof conteos] !== esperado)
    .map(
      ([clave, esperado]) =>
        `  ${clave}: esperado ${esperado}, construido ${conteos[clave as keyof typeof conteos]}`,
    );

  if (discrepancias.length > 0) {
    console.error(
      'El seed no cuadra con CONTENIDO_ORIGINAL. No se escribe nada.\n' +
        discrepancias.join('\n') +
        '\n\nO se perdió contenido al transformar, o el contenido cambió y hay que\n' +
        'actualizar CONTENIDO_ORIGINAL a conciencia (ver src/lib/portfolio/types.ts).',
    );
    process.exit(1);
  }

  const sql = sqlDelSeed(filas);
  mkdirSync(dirname(DESTINO), { recursive: true });
  writeFileSync(DESTINO, sql, 'utf8');

  console.log('Seed generado en supabase/seed/portfolio_seed.sql');
  console.log(`  ${(sql.length / 1024).toFixed(1)} KiB`);
  for (const [clave, valor] of Object.entries(conteos)) {
    console.log(`  ${clave.padEnd(24)} ${valor}`);
  }
}

main();
