/**
 * Vista previa de borradores (T-18).
 *
 * Deliberadamente FUERA de `repository.ts`: ese archivo tiene su propio
 * guardarraíl (`__tests__/unit/portfolio-repository.test.ts`) que exige que
 * la lectura de contenido público nunca use `service_role` — justo lo que
 * esto necesita para poder ver un borrador, porque la clave `anon` tiene RLS
 * que filtra `is_published = true` (migración de T-04). Aislarlo aquí deja
 * ese guardarraíl intacto en vez de debilitarlo con una excepción.
 *
 * Solo debe llamarse desde la ruta de vista previa (`/[locale]/page.tsx`
 * cuando `draftMode().isEnabled`), nunca desde una página pública sin pasar
 * antes por `requireAdmin('owner')` — eso lo garantiza
 * `/api/preview/enable/route.ts`, el único lugar que activa el modo
 * borrador.
 */
import { supabaseServer } from '@/lib/supabaseServer';
import { PROJECT_COLUMNS, type PortfolioProjectRow } from '@/lib/portfolio/types';
import { filaAProyecto } from '@/lib/portfolio/repository';
import type { Project } from '@/lib/projectsData';

/**
 * Proyectos publicados Y sin publicar. Nunca pasa por `unstable_cache`: una
 * vista previa tiene que reflejar el borrador tal cual está AHORA, no una
 * copia en caché que podría tardar en invalidarse.
 */
export async function leerProyectosConBorradores(): Promise<Project[]> {
  const { data, error } = await supabaseServer
    .from('portfolio_projects')
    .select(PROJECT_COLUMNS.join(','))
    .order('position', { ascending: true });

  if (error) {
    console.error(`[portfolio/preview] portfolio_projects: ${error.message}`);
    return [];
  }
  return ((data ?? []) as unknown as PortfolioProjectRow[]).map(filaAProyecto);
}
