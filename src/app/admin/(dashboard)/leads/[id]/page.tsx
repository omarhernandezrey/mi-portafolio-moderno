import IndustrySelector from '@/components/admin/IndustrySelector';
import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  BadgeDollarSign,
  Shield,
  Zap,
  Target,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getLeadDetail(id: string) {
  const { data: lead, error: leadErr } = await supabaseServer
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadErr || !lead) return null;

  // Obtener mensajes si hay conversación vinculada
  let messages: ChatMessage[] = [];
  if (lead.conversation_id) {
    const { data: msgs } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('conversation_id', lead.conversation_id)
      .order('created_at', { ascending: true });
    messages = (msgs as ChatMessage[]) || [];
  }

  return { lead, messages };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLeadDetail(id);

  if (!data) notFound();

  const { lead, messages } = data;

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card-bg/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/leads" 
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-1">
              CRM Intelligence
            </div>
            <h1 className="text-2xl font-black text-white-custom tracking-tight flex items-center gap-3 italic">
              {lead.name || 'Entidad no identificada'}
              <StatusBadge status={lead.status} />
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom transition-all">
            Archivar Lead
          </button>
          <Link 
            href={`/proposal/${lead.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-background text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <FileText size={16} />
            Generar Propuesta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Data Intelligence */}
        <div className="lg:col-span-4 space-y-8">
          {/* Identity Card */}
          <section className="bg-card-bg rounded-[40px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <User size={120} className="-rotate-12" />
            </div>
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
              <Target size={14} />
              Perfil del Cliente
            </h3>

            <div className="space-y-6 relative z-10">
              <InfoItem icon={<Mail size={18} />} label="Canal de Contacto" value={lead.email} isLink href={`mailto:${lead.email}`} />
              <InfoItem icon={<Phone size={18} />} label="Línea Directa" value={lead.phone || 'Pendiente'} isLink={!!lead.phone} href={`tel:${lead.phone}`} />
              <InfoItem icon={<Building2 size={18} />} label="Organización" value={lead.company || 'Privada / N/A'} />
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<BadgeDollarSign size={18} />} label="Inversión" value={lead.budget || 'Bajo consulta'} />
                <InfoItem icon={<Clock size={18} />} label="Plazo" value={lead.timeline || 'Flexible'} />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="p-6 rounded-[24px] bg-background/50 border border-white/5 group-hover:border-primary/10 transition-colors">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40 italic">Servicio Prioritario</h4>
                <p className="text-sm font-bold text-white-custom">{lead.service_requested || 'Consultoría General de Software'}</p>
              </div>
            </div>
          </section>

          {/* AI Insights & Actions */}
          <section className="bg-background rounded-[40px] border border-white/5 p-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
              <Zap size={14} />
              AI Insights & Operaciones
            </h3>

            <div className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted/60 ml-2">Asignar Industria</h4>
                <IndustrySelector leadId={lead.id} currentIndustry={(lead as { industry?: string }).industry} />
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted/60 ml-2 italic">Control de Pipeline</h4>
                <div className="grid grid-cols-1 gap-3">
                  <ActionButton icon={<CheckCircle2 size={18} />} label="Confirmar Contacto" color="text-primary hover:bg-primary/10 border-primary/20" />
                  <ActionButton icon={<XCircle size={18} />} label="Marcar como Perdido" color="text-red-400 hover:bg-red-500/10 border-red-500/20" />
                </div>
              </div>

              {lead.notes && (
                <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Resumen de la IA</h4>
                  <p className="text-xs text-text-muted leading-relaxed font-medium italic opacity-80">
                    &ldquo;{lead.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Interaction Intelligence */}
        <div className="lg:col-span-8">
          <div className="bg-card-bg rounded-[48px] border border-white/5 h-full min-h-[800px] flex flex-col shadow-2xl overflow-hidden backdrop-blur-sm relative">
            {/* Terminal Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-background/30 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <h3 className="font-bold flex items-center gap-2 text-sm italic tracking-tight">
                  <MessageSquare size={18} className="text-primary" />
                  Transcripción de Seguridad
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">Encrypted Session</span>
                <Shield size={12} className="text-primary opacity-40" />
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide">
              {messages.length > 0 ? messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/30 italic">
                      {msg.role === 'user' ? (lead.name || 'Visitante') : 'Bot Omar v3.1'}
                    </span>
                    <span className="text-[8px] text-text-muted/20">•</span>
                    <span className="text-[9px] text-text-muted/30 font-medium">
                      {new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`max-w-[75%] rounded-[28px] px-6 py-4 text-sm font-medium leading-relaxed transition-all shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background rounded-tr-none shadow-primary/10' 
                      : 'bg-background border border-white/10 text-white-custom rounded-tl-none shadow-black/20 hover:border-white/20'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted/10 py-40">
                  <MessageSquare size={100} strokeWidth={0.5} className="mb-8" />
                  <p className="text-lg font-black uppercase tracking-[0.5em] italic">No Logs Found</p>
                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="p-6 border-t border-white/5 bg-background/20 backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">
                <span>Capture Timestamp: {new Date(lead.created_at).toLocaleString()}</span>
                <span>UUID: {lead.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, isLink, href }: { icon: React.ReactNode, label: string, value: string, isLink?: boolean, href?: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.01] transition-all group/item">
      <div className="mt-1 text-primary opacity-40 group-hover/item:opacity-100 transition-opacity">{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.15em] mb-1 italic">{label}</p>
        {isLink ? (
          <a href={href} className="text-sm font-bold text-white-custom hover:text-primary transition-colors flex items-center gap-1 group/link truncate">
            {value}
            <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-sm font-bold text-white-custom truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <button className={`flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all group/act ${color}`}>
      <span className="group-hover/act:scale-110 transition-transform">{icon}</span>
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string }> = {
    paid: { label: 'Completado', color: 'text-primary bg-primary/10 border-primary/20' },
    cold: { label: 'Sin Acción', color: 'text-text-muted bg-white/5 border-white/10 opacity-60' },
    new: { label: 'Pendiente', color: 'text-accent bg-accent/10 border-accent/20' },
    contacted: { label: 'En Curso', color: 'text-white-custom bg-white/10 border-white/20' },
  };

  const config = configs[status] || configs.new;

  return (
    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${config.color}`}>
      {config.label}
    </span>
  );
}
