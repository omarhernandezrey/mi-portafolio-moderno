import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  MessageSquare, 
  User, 
  ChevronRight, 
  Search, 
  Filter,
  Globe,
  Zap,
  Target
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getConversations() {
  const { data, error } = await supabaseServer
    .from('conversations')
    .select(`
      *,
      messages:messages(count)
    `)
    .order('updated_at', { ascending: false });

  if (error) console.error('Error fetching conversations:', error);
  return data || [];
}

export default async function AdminConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
            <span className="w-8 h-px bg-primary/30" />
            interaction logs
          </div>
          <h1 className="text-4xl font-black text-white-custom tracking-tight mb-2 italic">Conversaciones</h1>
          <p className="text-text-muted text-sm font-medium italic opacity-60">Historial completo de interacciones con el asistente inteligente.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por session ID o nombre de visitante..." 
            className="w-full pl-12 pr-4 py-4 bg-card-bg border border-white/5 rounded-[20px] text-white-custom outline-none focus:border-primary/30 transition-all shadow-xl"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-card-bg border border-white/5 rounded-[20px] px-6 py-4 text-xs font-bold text-text-muted outline-none focus:border-primary/30 transition-all shadow-xl appearance-none min-w-[160px]">
            <option>Todos los Idiomas</option>
            <option>Español</option>
            <option>Inglés</option>
            <option>Portugués</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-4 bg-card-bg border border-white/5 rounded-[20px] text-xs font-bold text-text-muted hover:text-white-custom transition-all shadow-xl">
            <Filter size={16} />
            Configuración de Vista
          </button>
        </div>
      </div>

      {/* Grid of Conversations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {conversations.length > 0 ? conversations.map((conv) => (
          <div key={conv.id} className="bg-card-bg rounded-[40px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            {/* Background Icon */}
            <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <MessageSquare size={120} className="-rotate-12" />
            </div>

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-background transition-all duration-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white-custom group-hover:text-primary transition-colors truncate max-w-[150px]">
                    {conv.visitor_name || 'Anónimo'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mt-0.5 opacity-50">
                    <Globe size={10} />
                    {conv.language || 'es'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-white-custom/40 uppercase tracking-tighter italic">
                  {new Date(conv.updated_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[8px] text-text-muted/30 font-medium">
                  {new Date(conv.updated_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                  conv.intent === 'client' ? 'bg-primary/10 text-primary border-primary/20' :
                  conv.intent === 'recruiter' ? 'bg-accent/10 text-accent border-accent/20' :
                  'bg-white/5 text-text-muted border-white/10'
                }`}>
                  {conv.intent || 'Explorando'}
                </span>
                <span className="text-[9px] text-text-muted/40 font-bold">•</span>
                <span className="text-[9px] text-text-muted/40 font-bold uppercase tracking-tighter italic">
                  {(conv.messages?.[0]?.count || 0)} Mensajes
                </span>
              </div>
              
              <div className="p-5 rounded-[24px] bg-background/50 border border-white/5 italic">
                <p className="text-xs text-text-muted leading-relaxed font-medium line-clamp-3">
                  {conv.summary || 'El visitante no ha proporcionado información suficiente para generar un resumen ejecutivo todavía.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex -space-x-2">
                {/* Visual indicator of "Facts" captured */}
                {Object.keys(conv.facts || {}).length > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary" title="Datos capturados">
                    <Zap size={10} />
                  </div>
                )}
                {conv.visitor_email && (
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white-custom" title="Email capturado">
                    <Target size={10} />
                  </div>
                )}
              </div>

              <Link 
                href={`/admin/leads/${conv.id}`} // Enlazamos al detalle de lead ya que muestra la conversación
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-all group/btn"
              >
                Auditar Chat
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 text-center">
            <div className="flex flex-col items-center gap-6 opacity-20">
              <MessageSquare size={80} strokeWidth={1} />
              <p className="text-xl font-black uppercase tracking-[0.3em] italic">No Logs Found</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-center pt-10">
        <button className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white-custom transition-all">
          Cargar Más Sesiones
        </button>
      </div>
    </div>
  );
}
