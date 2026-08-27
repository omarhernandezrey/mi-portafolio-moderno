import { supabaseServer } from '@/lib/supabaseServer';
import type { AdminRole } from './roles';

export type AuditAction =
  | 'lead.create'
  | 'lead.status_update'
  | 'lead.industry_update'
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
  | 'feed_comment.delete';

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
