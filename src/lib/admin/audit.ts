import { supabaseServer } from '@/lib/supabaseServer';
import type { AdminRole } from './roles';

export type AuditAction =
  | 'lead.create'
  | 'lead.status_update'
  | 'lead.industry_update'
  | 'lead.payment_confirm'
  | 'privacy.delete_request'
  | 'ticket.create'
  | 'ticket.update'
  | 'ticket.message'
  | 'invoice.generate'
  | 'timer.start'
  | 'timer.stop'
  | 'subscriber.update'
  | 'subscriber.delete'
  | 'webhook.create'
  | 'webhook.update'
  | 'webhook.delete'
  | 'webhook.test'
  | 'feed_post.create'
  | 'feed_post.update'
  | 'feed_post.delete'
  | 'feed_comment.update'
  | 'feed_comment.delete'
  | 'portfolio_project.create'
  | 'portfolio_project.update'
  | 'portfolio_project.delete'
  | 'portfolio_project.reorder'
  | 'portfolio_skill.create'
  | 'portfolio_skill.update'
  | 'portfolio_skill.delete'
  | 'portfolio_skill.reorder'
  | 'portfolio_education_category.create'
  | 'portfolio_education_category.update'
  | 'portfolio_education_category.delete'
  | 'portfolio_education_category.reorder'
  | 'portfolio_education_item.create'
  | 'portfolio_education_item.update'
  | 'portfolio_education_item.delete'
  | 'portfolio_education_item.reorder'
  | 'portfolio_badge.create'
  | 'portfolio_badge.update'
  | 'portfolio_badge.delete'
  | 'portfolio_badge.reorder'
  | 'portfolio_service.create'
  | 'portfolio_service.update'
  | 'portfolio_service.delete'
  | 'portfolio_service.reorder'
  | 'portfolio_technology.create'
  | 'portfolio_technology.update'
  | 'portfolio_technology.delete'
  | 'portfolio_technology.reorder'
  | 'portfolio_timeline.create'
  | 'portfolio_timeline.update'
  | 'portfolio_timeline.delete'
  | 'portfolio_timeline.reorder'
  | 'portfolio_profile_interests.update'
  // Restaurar una versión histórica sobrescribe una fila publicada del sitio
  // con una foto anterior: es la operación más destructiva del portafolio y
  // era la única mutación que no dejaba rastro en `/admin/audit` (solo una
  // fila en `content_versions`, que es otra tabla y otra pantalla).
  | 'portfolio_project.restore'
  | 'portfolio_skill.restore'
  | 'portfolio_education_category.restore'
  | 'portfolio_education_item.restore'
  | 'portfolio_badge.restore'
  | 'portfolio_service.restore'
  | 'portfolio_technology.restore'
  | 'portfolio_timeline.restore'
  | 'portfolio_profile.restore';

export type AuditActor = {
  userId: string;
  email: string;
  role: AdminRole;
};

export type AuditEntry = {
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Escribe un evento de auditoría. Nunca lanza: fallos se loguean y se ignoran
 * para no romper la mutación principal.
 */
export async function writeAuditLog(
  actor: AuditActor,
  entry: AuditEntry
): Promise<void> {
  try {
    const { error } = await supabaseServer.from('admin_audit_logs').insert({
      actor_id: actor.userId,
      actor_email: actor.email,
      actor_role: actor.role,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
    });

    if (error) {
      console.error('[audit] insert failed:', error.message);
    }
  } catch (err) {
    console.error('[audit] unexpected error:', err);
  }
}
