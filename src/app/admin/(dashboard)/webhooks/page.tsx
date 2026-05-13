import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Activity,
  Shield,
  Link as LinkIcon
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';

export const dynamic = 'force-dynamic';

async function getWebhooks() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

async function getLogs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('webhook_logs')
    .select('*, webhook:webhooks(url)')
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

export default async function AdminWebhooksPage() {
  const webhooks = await getWebhooks();
  const logs = await getLogs();

  return (
    <div className="space-y-10">
      <PageHeader
        overline="Integraciones"
        title="Webhooks"
        description="Envía eventos en tiempo real a tus herramientas externas"
        actions={
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
            <Plus size={18} />
            Configurar Webhook
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Listado de Webhooks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white-custom">Endpoints Registrados</h2>
            </div>
            
            <div className="divide-y divide-white/5">
              {webhooks.length > 0 ? webhooks.map((wh) => (
                <div key={wh.id} className="p-6 hover:bg-white/[0.02] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${wh.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <LinkIcon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-white-custom text-sm">{wh.url}</div>
                        <div className="text-xs text-text-muted/60 font-mono">ID: {wh.id}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {wh.events.map((event: string) => (
                      <span key={event} className="px-2 py-1 bg-background border border-white/10 rounded-md text-[10px] font-bold text-primary uppercase">
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-text-muted/60">
                      <Shield size={14} />
                      <span>Secreto configurado</span>
                    </div>
                    <div className={`flex items-center gap-1 ${wh.active ? 'text-emerald-400' : 'text-red-400'}`}>
                      {wh.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{wh.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-text-muted/40">
                  No has configurado ningún webhook todavía.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs de Actividad */}
        <div className="space-y-6">
          <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-white-custom">Últimos Envíos</h2>
            </div>
            <div className="divide-y divide-white/5">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-primary">{log.event_type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.response_status && log.response_status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.response_status || 'ERR'}
                    </span>
                  </div>
                  <div className="text-[11px] text-white-custom truncate mb-1" title={log.webhook?.url}>
                    {log.webhook?.url}
                  </div>
                  <div className="text-[10px] text-text-muted/60">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-xs text-text-muted/40">
                  Sin actividad reciente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
