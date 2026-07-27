"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Archive, Loader2 } from 'lucide-react';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFetch } from '@/lib/admin/client-fetch';

interface LeadActionsProps {
  leadId: string;
  currentStatus: string;
  /** Si false, se muestran los estados sin controles de escritura (rol viewer). */
  canEdit?: boolean;
}

export default function LeadActions({ leadId, currentStatus, canEdit = true }: LeadActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const toast = useAdminToast();

  async function updateStatus(status: string) {
    if (!leadId) {
      toast.error('ID de lead no válido');
      return;
    }

    setLoading(status);
    try {
      await adminFetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      const statusMessages: Record<string, string> = {
        contacted: 'Lead marcado como contactado',
        lost: 'Lead marcado como perdido',
        archived: 'Lead archivado correctamente',
      };

      toast.success(statusMessages[status] || 'Estado actualizado');
      router.refresh();
    } catch (error) {
      console.error('Error updating lead status:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar estado';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  }

  if (!leadId) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] text-red-400 text-xs">
        Error: No se pudo cargar el ID del lead
      </div>
    );
  }

  const normalizedStatus = currentStatus?.toLowerCase() || 'new';

  if (!canEdit) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-[20px] text-text-muted text-xs text-center">
        Tu rol no tiene permiso para cambiar el estado de este lead
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {normalizedStatus !== 'contacted' && normalizedStatus !== 'paid' && (
        <button
          onClick={() => updateStatus('contacted')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-primary hover:bg-primary/10 border-primary/20 disabled:opacity-50 active:scale-[0.98]"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'contacted' ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          </span>
          {loading === 'contacted' ? 'Procesando...' : 'Confirmar Contacto'}
        </button>
      )}

      {normalizedStatus !== 'lost' && normalizedStatus !== 'paid' && (
        <button
          onClick={() => updateStatus('lost')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-red-400 hover:bg-red-500/10 border-red-500/20 disabled:opacity-50 active:scale-[0.98]"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'lost' ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
          </span>
          {loading === 'lost' ? 'Procesando...' : 'Marcar como Perdido'}
        </button>
      )}

      {normalizedStatus !== 'archived' && (
        <button
          onClick={() => updateStatus('archived')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-text-muted hover:bg-white/5 border-white/10 disabled:opacity-50 active:scale-[0.98]"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'archived' ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
          </span>
          {loading === 'archived' ? 'Procesando...' : 'Archivar Lead'}
        </button>
      )}

      {normalizedStatus === 'archived' && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-[20px] text-text-muted text-xs text-center">
          Lead archivado - No hay acciones disponibles
        </div>
      )}
    </div>
  );
}
