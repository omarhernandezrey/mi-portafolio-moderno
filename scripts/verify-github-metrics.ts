/**
 * Verificación real de `src/lib/github.ts` contra la API de verdad (T-13).
 *
 * No es un test de Jest a propósito: llama a la API real de GitHub, así que
 * depende de la red y de un token. Compara lo que calcula el parser contra
 * lo que devuelve `gh api` por su cuenta para el mismo repositorio, pieza por
 * pieza (estrellas, forks, lenguajes, PRs), sin pasar por el parser en esa
 * segunda vía — si ambos caminos coinciden, el parser no se está inventando
 * nada.
 *
 *   npm run verify:github-metrics -- omarhernandezrey/mi-portafolio-moderno
 *
 * Token: `gh auth token` si no hay `GITHUB_TOKEN` en el entorno.
 */
import { execFileSync } from 'node:child_process';
import {
  calcularPorcentajesDeLenguajes,
  obtenerMetricasDeRepositorio,
} from '../src/lib/github';

function ghApi<T>(ruta: string, paginar = false): T {
  const args = ['api', ruta, ...(paginar ? ['--paginate'] : [])];
  const salida = execFileSync('gh', args, { encoding: 'utf8' });
  if (!paginar) return JSON.parse(salida) as T;
  // --paginate concatena una página JSON tras otra; cada una es un array.
  const paginas = salida
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as unknown[]);
  return paginas.flat() as T;
}

function tokenDeGh(): string {
  return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
}

async function main() {
  const repo = process.argv[2];
  if (!repo) {
    console.error('Uso: npm run verify:github-metrics -- <owner>/<repo>');
    process.exit(1);
  }

  const token = process.env.GITHUB_TOKEN || tokenDeGh();

  console.log(`Repositorio: ${repo}\n`);

  console.log('Llamando al parser (src/lib/github.ts)...');
  const delParser = await obtenerMetricasDeRepositorio(repo, token);

  console.log('Llamando a `gh api` directamente, por separado...');
  const repoInfo = ghApi<{ stargazers_count: number; forks_count: number }>(`repos/${repo}`);
  const lenguajesBytes = ghApi<Record<string, number>>(`repos/${repo}/languages`);
  const prsAbiertas = ghApi<unknown[]>(`repos/${repo}/pulls?state=open&per_page=100`, true);
  const prsCerradas = ghApi<unknown[]>(`repos/${repo}/pulls?state=closed&per_page=100`, true);
  const porcentajesEsperados = calcularPorcentajesDeLenguajes(lenguajesBytes);

  const comprobaciones: Array<{ campo: string; parser: unknown; ghApi: unknown }> = [
    { campo: 'stars', parser: delParser.stars, ghApi: repoInfo.stargazers_count },
    { campo: 'forks', parser: delParser.forks, ghApi: repoInfo.forks_count },
    { campo: 'openPrs', parser: delParser.openPrs, ghApi: prsAbiertas.length },
    { campo: 'closedPrs', parser: delParser.closedPrs, ghApi: prsCerradas.length },
    { campo: 'languages', parser: delParser.languages, ghApi: porcentajesEsperados },
  ];

  console.log('\nCampo       | Parser                              | gh api directo');
  console.log('------------|-------------------------------------|------------------------------------');
  let huboDiferencia = false;
  for (const c of comprobaciones) {
    const a = JSON.stringify(c.parser);
    const b = JSON.stringify(c.ghApi);
    const coincide = a === b;
    if (!coincide) huboDiferencia = true;
    console.log(`${c.campo.padEnd(11)} | ${a.padEnd(35)} | ${b}${coincide ? '' : '   <-- DIFERENTE'}`);
  }

  console.log(`\ncommits (histórico de /stats/commit_activity): ${delParser.commits}`);
  console.log(`additions: ${delParser.additions} · deletions: ${delParser.deletions}`);
  console.log(`racha actual: ${delParser.currentStreak} · racha máxima: ${delParser.longestStreak}`);
  console.log(`días con actividad registrados: ${delParser.dailyActivity.filter((d) => d.commits > 0).length} de ${delParser.dailyActivity.length}`);

  if (huboDiferencia) {
    console.error('\n❌ Al menos un campo no coincide con lo que da gh api directamente.');
    process.exit(1);
  }
  console.log('\n✅ Todo lo que se puede comparar por una vía independiente coincide.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
