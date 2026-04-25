import IndustrySelector from '@/components/admin/IndustrySelector';
import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  BadgeDollarSign
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

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLeadDetail(id);

  if (!data) notFound();

  const { lead, messages } = data;

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)]">
      <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/leads" className="text-[var(--muted-color)] hover:text-[var(--primary-color)] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <span className="font-bold text-xl tracking-tight">Detalle del Lead</span>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                lead.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                lead.status === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                Estado: {lead.status}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{lead.name || 'Sin nombre'}</h2>
                  <p className="text-xs text-[var(--muted-color)] lowercase">{lead.type}</p>
                </div>
              </div>

              <div className="space-y-4">
                <InfoItem icon={<Mail size={16} />} label="Email" value={lead.email} isLink href={`mailto:${lead.email}`} />
                <InfoItem icon={<Phone size={16} />} label="Teléfono" value={lead.phone || 'No proporcionado'} isLink={!!lead.phone} href={`tel:${lead.phone}`} />
                <InfoItem icon={<Building2 size={16} />} label="Empresa" value={lead.company || 'N/A'} />
                <InfoItem icon={<BadgeDollarSign size={16} />} label="Presupuesto" value={lead.budget || 'No definido'} />
                <InfoItem icon={<Clock size={16} />} label="Plazo" value={lead.timeline || 'No definido'} />
                <InfoItem icon={<Calendar size={16} />} label="Capturado el" value={new Date(lead.created_at).toLocaleString()} />
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--primary-color)]/10">
                <h3 className="text-sm font-bold uppercase text-[var(--muted-color)] mb-4 tracking-widest">Servicio Solicitado</h3>
                <div className="p-4 rounded-xl bg-[var(--background-color)] border border-[var(--primary-color)]/20 text-[var(--primary-color)] font-medium">
                  {lead.service_requested || 'Consulta General'}
                </div>
              </div>

              {lead.notes && (
                <div className="mt-6 pt-6 border-t border-[var(--primary-color)]/10">
                  <h3 className="text-sm font-bold uppercase text-[var(--muted-color)] mb-2 tracking-widest">Notas del Bot</h3>
                  <p className="text-sm text-[var(--muted-color)] leading-relaxed italic">
                    &ldquo;{lead.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 p-6 shadow-xl space-y-6">
              <h3 className="font-bold">Acciones</h3>
              
              <IndustrySelector leadId={lead.id} currentIndustry={(lead as { industry?: string }).industry} />

              <div className="grid grid-cols-1 gap-3">
                <ActionButton icon={<CheckCircle2 size={18} />} label="Marcar Contactado" color="hover:bg-emerald-500/10 hover:text-emerald-400" />
                <ActionButton icon={<XCircle size={18} />} label="Marcar Perdido" color="hover:bg-red-500/10 hover:text-red-400" />
                <Link href={`/proposal/${lead.id}`} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[var(--primary-color)]/10 text-sm font-medium hover:bg-[var(--primary-color)]/10 text-[var(--primary-color)] transition-all">
                  <FileText size={18} />
                  Ver / Generar Propuesta
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Transcripción */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 h-full flex flex-col shadow-xl overflow-hidden">
              <div className="p-6 border-b border-[var(--primary-color)]/10 flex items-center justify-between bg-[var(--background-color)]/30">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare size={20} className="text-[var(--primary-color)]" />
                  Transcripción de la Conversación
                </h3>
                <span className="text-xs text-[var(--muted-color)]">{messages.length} mensajes</span>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-[var(--primary-color)]/20">
                {messages.length > 0 ? messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-[var(--primary-color)] text-[var(--inner-circle-text-color)] rounded-tr-none' 
                        : 'bg-[var(--background-color)] border border-[var(--primary-color)]/10 text-[var(--white-color)] rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-[var(--muted-color)] mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--muted-color)] opacity-50 py-20">
                    <MessageSquare size={48} className="mb-4" />
                    <p>No hay historial de chat disponible para este lead.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value, isLink, href }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-[var(--primary-color)] opacity-70">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase text-[var(--muted-color)] tracking-widest">{label}</p>
        {isLink ? (
          <a href={href} className="text-sm font-medium hover:text-[var(--primary-color)] transition-colors break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color }: ActionButtonProps) {
  return (
    <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[var(--primary-color)]/10 text-sm font-medium transition-all ${color}`}>
      {icon}
      {label}
    </button>
  );
}
