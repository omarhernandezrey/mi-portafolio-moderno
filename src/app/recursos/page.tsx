import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recursos y Guías Gratuitas | Omar Hernández Rey',
  description: 'Guías gratuitas: cómo contratar un desarrollador, precios reales 2026, checklist de proyecto digital. Descarga sin costo.',
  alternates: {
    canonical: 'https://omarhernandezrey.com/recursos',
  },
};

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Loader2, Mail, Shield, BookOpen, Target, Sparkles, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import { track } from '@vercel/analytics';

const magnets = [
  {
    id: 'checklist',
    title: 'Audit Checklist: Technical Integrity',
    description: 'Protocolo de 15 puntos críticos para auditar la calidad y seguridad de un desarrollo antes de la fase de despliegue.',
    icon: <Shield size={32} />,
  },
  {
    id: 'guia-precios',
    title: 'Market Report: Software Investment 2026',
    description: 'Análisis detallado de los rangos de inversión en ingeniería de software para el mercado LATAM y Global.',
    icon: <BookOpen size={32} />,
  },
  {
    id: 'plantilla-brief',
    title: 'Executive Template: Project Briefing',
    description: 'Documento de alta fidelidad para la definición estratégica de objetivos, KPIs y alcance técnico de proyectos digitales.',
    icon: <Target size={32} />,
  }
];

export default function RecursosPage() {
  const [email, setEmail] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (magnetId: string) => {
    if (!email || !email.includes('@')) {
      setError('Por favor, ingresa un email corporativo válido');
      return;
    }

    setError(null);
    setLoadingId(magnetId);

    try {
      const res = await fetch('/api/leadmagnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnetId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setSuccessId(magnetId);
      track('lead_magnet_downloaded', { resource: magnetId });
      setTimeout(() => setSuccessId(null), 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Protocol error during processing');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      
      <main className="flex-1 max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-32 space-y-16 md:space-y-32">
        
        {/* Header Architecture */}
        <header className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic"
          >
            Digital Assets & Intelligence
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-white-custom tracking-tighter leading-[0.9] italic"
          >
            Recursos de <br />
            <span className="text-primary">Alta Fidelidad</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto opacity-70 leading-relaxed italic"
          >
            Herramientas ejecutivas y guías técnicas diseñadas para optimizar la toma de decisiones en el ecosistema digital moderno.
          </motion.p>
        </header>

        {/* Global Access Protocol */}
        <section className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-40">Identity Authentication</h2>
            <p className="text-xs text-text-muted/60 font-medium italic">Se requiere autorización vía email para liberar los activos.</p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[24px] blur-lg opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center bg-card-bg/40 rounded-[24px] p-2 border border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group-focus-within:border-primary/20 transition-all">
              <Mail className="ml-6 text-text-muted/40 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="email"
                placeholder="Introduzca su email de negocio..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 px-6 py-5 text-sm font-bold text-white-custom placeholder:text-text-muted/20 placeholder:italic"
              />
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* Assets Vault */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {magnets.map((magnet, idx) => (
            <motion.div
              key={magnet.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-card-bg rounded-[32px] md:rounded-[48px] border border-white/5 p-6 md:p-10 flex flex-col h-full shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              {/* Decorative Index */}
              <div className="absolute top-8 right-8 text-[40px] font-black text-white-custom opacity-[0.03] italic italic-black italic-outline group-hover:opacity-[0.08] transition-opacity">
                0{idx + 1}
              </div>

              <div className="mb-10 w-20 h-20 rounded-[32px] bg-background/50 border border-white/5 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                {magnet.icon}
              </div>

              <div className="space-y-4 flex-1">
                <h3 className="text-2xl font-black text-white-custom leading-tight tracking-tight italic group-hover:text-primary transition-colors">{magnet.title}</h3>
                <p className="text-sm text-text-muted font-medium leading-relaxed opacity-60 italic">
                  {magnet.description}
                </p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/5">
                <button
                  onClick={() => handleDownload(magnet.id)}
                  disabled={loadingId !== null || successId === magnet.id}
                  className={`relative w-full py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all shadow-xl active:scale-95 ${
                    successId === magnet.id
                      ? 'bg-primary text-background'
                      : 'bg-white/5 border border-white/10 text-white-custom hover:bg-primary hover:text-background hover:border-primary'
                  } disabled:opacity-30`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {loadingId === magnet.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : successId === magnet.id ? (
                      <>
                        <CheckCircle size={16} />
                        Access Granted
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="opacity-40" />
                        Download PDF
                      </>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Strategy CTA */}
        <section className="bg-background rounded-[32px] md:rounded-[60px] border border-white/5 p-8 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden text-center group hover:border-primary/20 transition-all duration-500">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
          
          <div className="max-w-2xl mx-auto space-y-12 relative z-10">
            <div className="mx-auto w-24 h-24 rounded-[36px] bg-primary text-background flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={48} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white-custom tracking-tighter italic">
                Arquitectura de Inversión
              </h2>
              <p className="text-lg text-text-muted font-medium italic opacity-70 leading-relaxed max-w-lg mx-auto">
                Consolide sus requerimientos técnicos y obtenga una auditoría financiera instantánea para su próximo despliegue.
              </p>
            </div>

            <Link 
              href="/calculadora" 
              className="group inline-flex items-center gap-4 bg-primary text-background px-12 py-6 rounded-[28px] font-black text-[12px] uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              Auditar Presupuesto
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Global Security / Info Bar */}
        <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-20 border-t border-white/5">
          <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.4em] text-text-muted italic">
            <Shield size={14} />
            Secure Asset Transmission
          </div>
          <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.4em] text-text-muted italic">
            <FileText size={14} />
            Document Index 2026.04
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
