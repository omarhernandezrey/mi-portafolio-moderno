"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Archive, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface LeadActionsProps {
  leadId: string;
  currentStatus: string;
}

export default function LeadActions({ leadId, currentStatus }: LeadActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  async function updateStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al actualizar estado');
      }

      const data = await res.json();
      
      // Mostrar toast de éxito según el estado
      const statusMessages: Record<string, string> = {
        'contacted': '✅ Lead marcado como contactado',
        'lost': '⚠️ Lead marcado como perdido',
        'archived': '📁 Lead archivado correctamente'
      };
      
      showToast(statusMessages[status] || '✅ Estado actualizado', 'success');
      router.refresh();
    } catch (error) {
      console.error('Error updating lead status:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar estado';
      showToast(`❌ ${message}`, 'error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {currentStatus !== 'contacted' && currentStatus !== 'paid' && (
        <button 
          onClick={() => updateStatus('contacted')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-primary hover:bg-primary/10 border-primary/20 disabled:opacity-50"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'contacted' ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          </span>
          {loading === 'contacted' ? 'Procesando...' : 'Confirmar Contacto'}
        </button>
      )}
      
      {currentStatus !== 'lost' && currentStatus !== 'paid' && (
        <button 
          onClick={() => updateStatus('lost')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-red-400 hover:bg-red-500/10 border-red-500/20 disabled:opacity-50"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'lost' ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
          </span>
          {loading === 'lost' ? 'Procesando...' : 'Marcar como Perdido'}
        </button>
      )}

      {currentStatus !== 'archived' && (
        <button 
          onClick={() => updateStatus('archived')}
          disabled={loading !== null}
          className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act text-text-muted hover:bg-white/5 border-white/10 disabled:opacity-50"
        >
          <span className="group-hover/act:scale-110 transition-transform">
            {loading === 'archived' ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
          </span>
          {loading === 'archived' ? 'Procesando...' : 'Archivar Lead'}
        </button>
      )}
    </div>
  );
}
