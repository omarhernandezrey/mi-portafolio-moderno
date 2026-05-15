"use client";

import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Zap, Layout, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/admin/ui/PageHeader';

interface TimerEntry {
  id: string;
  description: string;
  started_at: string;
  leads?: { name: string; company?: string };
}

interface LeadSummary {
  id: string;
  name: string;
  company?: string;
}

export default function TimerPage() {
  const [activeEntries, setActiveEntries] = useState<TimerEntry[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActive();
    fetchLeads();
  }, []);

  const fetchActive = async () => {
    try {
      const r = await fetch('/api/admin/timer');
      if (r.ok) {
        const data = await r.json();
        setActiveEntries(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeads = async () => {
    try {
      const r = await fetch('/api/admin/leads/list');
      if (r.ok) {
        const data = await r.json();
        setLeads(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async () => {
    if (!selectedLead) return;
    setIsLoading(true);
    try {
      await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', projectId: selectedLead, description })
      });
      setDescription('');
      fetchActive();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async (id: string) => {
    setIsLoading(true);
    try {
      await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', entryId: id })
      });
      fetchActive();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Performance Terminal"
        title="Timer"
        description="Seguimiento de productividad y gestión de billable hours."
        actions={
          <div className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-muted hidden sm:inline">Status: Operational</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 items-start">
        {/* Control Panel */}
        <section className="xl:col-span-5 bg-card-bg rounded-[24px] sm:rounded-[40px] border border-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 sm:mb-6 flex items-center gap-2">
              <Zap size={14} />
              Nueva Sesión
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-text-muted/60 tracking-widest ml-2 italic">Seleccionar Entidad</label>
                <div className="relative">
                  <select 
                    value={selectedLead}
                    onChange={(e) => setSelectedLead(e.target.value)}
                    className="w-full rounded-[20px] sm:rounded-[24px] border border-white/5 bg-background/50 px-4 sm:px-6 py-3 sm:py-4 text-sm text-white-custom outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner appearance-none italic"
                  >
                    <option value="">Buscar Cliente o Proyecto...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name} {l.company ? `— ${l.company}` : ''}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-text-muted/30 rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-text-muted/60 tracking-widest ml-2 italic">Objetivo de la Actividad</label>
                <input 
                  type="text" 
                  placeholder="Ej: Optimización de Performance React..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-white/5 bg-background/50 px-4 sm:px-6 py-3 sm:py-4 text-sm text-white-custom outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:text-text-muted/50"
                />
              </div>

              <button
                disabled={!selectedLead || isLoading}
                onClick={handleStart}
                className="group relative flex w-full items-center justify-center gap-3 rounded-[20px] sm:rounded-[24px] bg-primary px-6 sm:px-8 py-4 sm:py-5 text-xs font-black uppercase tracking-[0.2em] text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Play size={16} className="fill-current" />
                <span className="relative z-10">Activar Cronómetro</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[28px] bg-background/50 border border-white/5 border-dashed">
            <div className="flex items-center gap-3 text-text-muted/40 mb-3 uppercase font-black text-[9px] tracking-widest">
              <Activity size={12} />
              Tips de Productividad
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed font-medium italic opacity-60">
              &ldquo;El enfoque profundo de 90 minutos maximiza la calidad del código Next.js.&rdquo;
            </p>
          </div>
        </section>

        {/* Active Timers List */}
        <section className="xl:col-span-7 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-2 sm:px-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/50 flex items-center gap-2">
              <Layout size={14} />
              Operaciones en Curso
            </h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{activeEntries.length} Activas</span>
          </div>

          <AnimatePresence mode="popLayout">
            {activeEntries.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-background/20 rounded-[24px] sm:rounded-[40px] border border-white/5 border-dashed p-10 sm:p-20 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-text-muted/10">
                  <Clock size={36} strokeWidth={1} />
                </div>
                <div>
                  <p className="text-white-custom font-bold tracking-tight text-sm sm:text-base">Terminal en Reposo</p>
                  <p className="text-text-muted text-xs italic opacity-40 mt-1">Inicia una sesión para comenzar el rastreo.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {activeEntries.map(entry => (
                  <motion.div 
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-card-bg/60 border border-primary/20 p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-sm group"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center relative shrink-0">
                        <div className="absolute inset-0 bg-primary/20 rounded-[20px] sm:rounded-[24px] animate-ping opacity-20" />
                        <Activity className="text-primary" size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-white-custom text-base sm:text-lg tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="truncate">{entry.leads?.name || 'Procesando...'}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] sm:text-[9px] text-text-muted uppercase tracking-widest border border-white/10 shrink-0">
                            {entry.leads?.company || 'Freelance'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-muted font-medium italic mt-1 truncate">{entry.description || 'Tarea sin descripción técnica'}</p>
                        <div className="flex items-center gap-4 mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-primary/60">
                          <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            <Clock size={11} />
                            Inicio: {new Date(entry.started_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStop(entry.id)}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white-custom hover:scale-110 transition-all shadow-lg active:scale-95 shrink-0 self-end sm:self-auto"
                      title="Detener Operación"
                    >
                      <Square size={18} fill="currentColor" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
