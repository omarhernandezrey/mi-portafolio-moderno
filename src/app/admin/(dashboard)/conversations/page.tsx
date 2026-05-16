'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  User,
  ChevronRight,
  Search,
  Globe,
  Zap,
  Target,
  Mail,
  Calendar,
  Hash,
  Filter,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ConversationWithLead {
  id: string;
  session_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  intent: string | null;
  summary: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
  facts: Record<string, string> | null;
  messages: { count: number }[];
  lead_id: string | null;
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-text-muted/20">{icon}</div>
      <div>
        <p className="font-bold text-white-custom text-sm">{title}</p>
        <p className="text-text-muted text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}

const INTENT_LABELS: Record<string, string> = {
  client: 'Cliente',
  recruiter: 'Reclutador',
  curious: 'Curioso',
  contact_form: 'Formulario',
};

const INTENT_COLORS: Record<string, string> = {
  client: 'bg-primary/10 text-primary border-primary/20',
  recruiter: 'bg-accent/10 text-accent border-accent/20',
  contact_form: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  curious: 'bg-white/5 text-text-muted border-white/10',
};

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetch('/api/admin/conversations')
      .then(r => r.json())
      .then(data => {
        setConversations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return conversations.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.visitor_name?.toLowerCase().includes(q) ||
        c.visitor_email?.toLowerCase().includes(q) ||
        c.session_id?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q);
      const matchIntent = !intentFilter || c.intent === intentFilter;
      return matchSearch && matchIntent;
    });
  }, [conversations, search, intentFilter]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60 mb-2">Interaction Logs</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white-custom tracking-tight">Conversaciones</h1>
          <p className="text-text-muted text-sm font-medium mt-2">
            Historial completo de interacciones con el asistente inteligente
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-card-bg border border-white/5 rounded-xl px-4 py-2">
          <Hash size={12} className="text-primary" />
          <span className="font-bold">{filtered.length}</span>
          <span className="opacity-50">de {conversations.length} conversaciones</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre, email o session ID..."
            className="w-full pl-11 pr-10 py-3 sm:py-4 bg-card-bg border border-white/5 rounded-[16px] sm:rounded-[20px] text-white-custom outline-none focus:border-primary/30 transition-all shadow-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white-custom transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={intentFilter}
            onChange={e => { setIntentFilter(e.target.value); setPage(1); }}
            className="bg-card-bg border border-white/5 rounded-[16px] sm:rounded-[20px] px-4 sm:px-6 py-3 sm:py-4 text-xs font-bold text-text-muted outline-none focus:border-primary/30 transition-all shadow-xl appearance-none flex-1 sm:flex-none min-w-[140px]"
          >
            <option value="">Todos</option>
            <option value="client">Cliente</option>
            <option value="recruiter">Reclutador</option>
            <option value="contact_form">Formulario</option>
            <option value="curious">Curioso</option>
          </select>
          {intentFilter && (
            <button
              onClick={() => setIntentFilter('')}
              className="flex items-center gap-2 px-4 py-3 bg-card-bg border border-white/5 rounded-[16px] sm:rounded-[20px] text-xs font-bold text-text-muted hover:text-primary transition-all shadow-xl"
            >
              <Filter size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card-bg rounded-[24px] sm:rounded-[40px] border border-white/5 p-4 sm:p-8 animate-pulse h-56" />
          ))}
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {paginated.map((conv) => {
            const intentLabel = INTENT_LABELS[conv.intent || ''] || conv.intent || 'Explorando';
            const intentColor = INTENT_COLORS[conv.intent || ''] || 'bg-white/5 text-text-muted border-white/10';
            const msgCount = conv.messages?.[0]?.count || 0;

            return (
              <div
                key={conv.id}
                className="bg-card-bg rounded-[24px] sm:rounded-[40px] border border-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <MessageSquare size={100} className="-rotate-12" />
                </div>

                <div className="flex items-start justify-between mb-4 sm:mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500 shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white-custom group-hover:text-primary transition-colors truncate text-sm sm:text-base">
                        {conv.visitor_name || 'Anónimo'}
                      </h3>
                      {conv.visitor_email && (
                        <div className="flex items-center gap-1 text-[9px] text-text-muted/60 font-medium truncate">
                          <Mail size={9} />
                          {conv.visitor_email}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[9px] text-text-muted/40 font-black uppercase tracking-widest mt-0.5">
                        <Globe size={9} />
                        {conv.language || 'es'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-black text-white-custom/40 uppercase tracking-tighter">
                      {new Date(conv.updated_at).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/Bogota'
                      })}
                    </div>
                    <div className="text-[8px] text-text-muted/30 font-medium flex items-center gap-1 justify-end mt-0.5">
                      <Calendar size={8} />
                      {new Date(conv.updated_at).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'America/Bogota'
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4 sm:mb-6 relative z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${intentColor}`}>
                      {intentLabel}
                    </span>
                    <span className="text-[9px] text-text-muted/40 font-bold">•</span>
                    <span className="text-[9px] text-text-muted/50 font-bold">
                      {msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-[16px] bg-background/50 border border-white/5 italic">
                    <p className="text-xs text-text-muted leading-relaxed font-medium line-clamp-3">
                      {conv.summary || 'El visitante no proporcionó información suficiente para generar un resumen.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex -space-x-1.5">
                    {conv.facts && Object.keys(conv.facts).length > 0 && (
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

                  {conv.lead_id ? (
                    <Link
                      href={`/admin/leads/${conv.lead_id}`}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-all group/btn"
                    >
                      Ver Lead
                      <ChevronRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-[9px] font-bold text-text-muted/30 italic uppercase tracking-widest">
                      Sin lead
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card-bg rounded-[32px] border border-white/5 py-20">
          <EmptyState
            icon={<MessageSquare size={70} strokeWidth={1} />}
            title="Sin resultados"
            description={search || intentFilter ? 'No hay conversaciones que coincidan con los filtros.' : 'No hay conversaciones registradas todavía.'}
          />
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white-custom hover:bg-white/10 transition-all"
          >
            Cargar {Math.min(PAGE_SIZE, filtered.length - paginated.length)} más
          </button>
        </div>
      )}
    </div>
  );
}
