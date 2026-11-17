import { supabaseServer } from '@/lib/supabaseServer';
import type { AuditActor } from './audit';

export type ContentVersionAction = 'create' | 'update' | 'delete' | 'restore';

export interface ContentVersionEntry {
  action: ContentVersionAction;
  /** Misma taxonomía que `resourceType` de `writeAuditLog` (p. ej. "portfolio_project"). */
  resourceType: string;
  resourceId: string;
  /** Foto completa de la fila ANTES de esta operación. `null` en un alta. */
  before: Record<string, unknown> | null;
  /** Foto completa de la fila DESPUÉS. `null` en un borrado. */
  after: Record<string, unknown> | null;
}

/**
 * Escribe una versión en `content_versions` (T-18). Nunca lanza: un fallo
 * aquí no debe romper la mutación principal, igual que `writeAuditLog`.
 *
 * Reorden (solo cambia `position`) deliberadamente NO pasa por aquí: no es
 * contenido que valga la pena poder restaurar fila por fila, y ya queda su
 * propio registro en `admin_audit_logs`.
 */
export async function writeContentVersion(actor: AuditActor, entry: ContentVersionEntry): Promise<void> {
  try {
    const { error } = await supabaseServer.from('content_versions').insert({
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      action: entry.action,
      before: entry.before,
      after: entry.after,
      actor_id: actor.userId,
      actor_email: actor.email,
    });

    if (error) {
      console.error('[content-versions] insert failed:', error.message);
    }
  } catch (err) {
    console.error('[content-versions] unexpected error:', err);
  }
}

/** Tabla real y columna de conflicto de cada tipo de recurso versionable. */
export const RECURSOS_VERSIONABLES: Record<string, { tabla: string; columnaId: string }> = {
  portfolio_project: { tabla: 'portfolio_projects', columnaId: 'id' },
  portfolio_skill: { tabla: 'portfolio_skills', columnaId: 'id' },
  portfolio_education_category: { tabla: 'portfolio_education_categories', columnaId: 'id' },
  portfolio_education_item: { tabla: 'portfolio_education_items', columnaId: 'id' },
  portfolio_badge: { tabla: 'portfolio_badges', columnaId: 'id' },
  portfolio_service: { tabla: 'portfolio_services', columnaId: 'id' },
  portfolio_technology: { tabla: 'portfolio_technologies', columnaId: 'id' },
  portfolio_timeline: { tabla: 'portfolio_timeline', columnaId: 'id' },
  portfolio_profile: { tabla: 'portfolio_profile', columnaId: 'section' },
};
