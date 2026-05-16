"use client";

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, FileText, CreditCard, Rocket, Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import Link from 'next/link';
import { useNotyf } from '@/components/ui/NotyfProvider';

interface OnboardingPageProps {
  params: Promise<{ token: string }>;
}

interface OnboardingLead {
  id: string;
  name: string;
  email: string;
  service_requested: string;
  budget: string;
  timeline: string;
  onboarding_step: number;
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  const { token } = use(params);
  const [step, setStep] = useState(1);
  const [lead, setLead] = useState<OnboardingLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notyf = useNotyf();
  
  // Step 1: Brief data
  const [brief, setBrief] = useState({
    objectives: '',
    targetAudience: '',
    references: '',
    functionalities: ''
  });

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/onboarding/verify?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLead(data.lead);
        setStep(data.lead.onboarding_step || 1);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [token]);

  const handleBriefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, brief }),
      });
      if (!res.ok) throw new Error('Error al guardar el brief');
      notyf.success('Brief guardado correctamente');
      setStep(2);
    } catch (err: unknown) {
      notyf.error(err instanceof Error ? err.message : 'Error al guardar el brief');
    } finally {
      setLoading(false);
    }
  };

  const handleContractSign = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Error al firmar el contrato');
      notyf.success('Contrato firmado correctamente');
      setStep(3);
    } catch (err: unknown) {
      notyf.error(err instanceof Error ? err.message : 'Error al firmar el contrato');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Error al procesar el pago');
      notyf.success('Pago procesado correctamente');
      setStep(4);
    } catch (err: unknown) {
      notyf.error(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--primary-color)]" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">¡Ups! Algo salió mal</h1>
        <p className="text-[var(--muted-color)] mb-8">{error}</p>
        <Link href="/" className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-full">Volver al inicio</Link>
      </div>
    );
  }

  if (!lead) return null;

  const steps = [
    { n: 1, label: 'Briefing', icon: <FileText size={20} /> },
    { n: 2, label: 'Contrato', icon: <CheckCircle size={20} /> },
    { n: 3, label: 'Pago', icon: <CreditCard size={20} /> },
    { n: 4, label: 'Kickoff', icon: <Rocket size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--primary-color)]/10 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[var(--primary-color)] -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= s.n 
                    ? 'bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/30' 
                    : 'bg-[var(--secondary-background-color)] text-[var(--muted-color)]'
                }`}
              >
                {step > s.n ? <CheckCircle size={20} /> : s.icon}
              </div>
              <span className={`text-xs font-bold ${step >= s.n ? 'text-[var(--primary-color)]' : 'text-[var(--muted-color)]'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 bg-[var(--secondary-background-color)]/50 p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-xl"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black mb-2">Paso 1: El Brief</h2>
                <p className="text-[var(--muted-color)]">Cuéntame más detalles sobre tu proyecto para empezar con el pie derecho.</p>
              </div>

              <form onSubmit={handleBriefSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Objetivos principales</label>
                  <textarea 
                    className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--primary-color)] outline-none min-h-[100px]"
                    placeholder="¿Qué quieres lograr con este proyecto?"
                    required
                    value={brief.objectives}
                    onChange={(e) => setBrief({...brief, objectives: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Público objetivo</label>
                  <textarea 
                    className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                    placeholder="¿A quién va dirigido?"
                    required
                    value={brief.targetAudience}
                    onChange={(e) => setBrief({...brief, targetAudience: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Referencias visuales</label>
                  <input 
                    type="text"
                    className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                    placeholder="Links a sitios que te gusten"
                    value={brief.references}
                    onChange={(e) => setBrief({...brief, references: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Funcionalidades clave</label>
                  <textarea 
                    className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                    placeholder="Listado de requerimientos técnicos..."
                    required
                    value={brief.functionalities}
                    onChange={(e) => setBrief({...brief, functionalities: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--primary-color)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Siguiente <ArrowRight size={20} /></>}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 bg-[var(--secondary-background-color)]/50 p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-xl text-center"
            >
              <h2 className="text-3xl font-black mb-2">Paso 2: Contrato</h2>
              <p className="text-[var(--muted-color)] mb-8">Revisa los términos del servicio. Este documento garantiza nuestra seriedad y profesionalismo.</p>
              
              <div className="aspect-[4/5] bg-white rounded-2xl border border-gray-200 overflow-hidden relative group">
                {/* Mockup de PDF */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-gray-400">
                  <FileText size={80} className="mb-4 opacity-20" />
                  <p className="text-sm">El contrato se generará con tus datos: <strong>{lead.name}</strong></p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} /> Anterior
                </button>
                <button
                  onClick={handleContractSign}
                  disabled={loading}
                  className="flex-[2] py-4 bg-[var(--primary-color)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Firmar digitalmente <CheckCircle size={20} /></>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 bg-[var(--secondary-background-color)]/50 p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-xl text-center"
            >
              <h2 className="text-3xl font-black mb-2">Paso 3: Anticipo</h2>
              <p className="text-[var(--muted-color)] mb-8">Para reservar el cupo y dar inicio al desarrollo, se requiere un anticipo del 50% ({lead.budget ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) / 2 : '---'} USD).</p>
              
              <div className="p-8 border-2 border-dashed border-[var(--primary-color)]/30 rounded-[2rem] bg-[var(--primary-color)]/5 mb-8">
                <div className="text-4xl font-black text-[var(--primary-color)] mb-2">
                  ${lead.budget ? (parseFloat(lead.budget.replace(/[^0-9.]/g, '')) / 2).toFixed(2) : '---'} <span className="text-sm font-normal">USD</span>
                </div>
                <p className="text-sm text-[var(--muted-color)] uppercase tracking-widest font-bold">Pago Seguro vía PayPal / Stripe</p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-[var(--text-color)] text-[var(--background-color)] rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Pagar Anticipo <CreditCard size={20} /></>}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 bg-gradient-to-br from-green-500/10 to-[var(--primary-color)]/10 p-12 rounded-[3rem] border border-green-500/20 shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                <Rocket size={48} />
              </div>
              <h2 className="text-4xl font-black mb-4">¡Todo listo, {lead.name}!</h2>
              <p className="text-xl text-[var(--muted-color)] mb-8">
                Ya recibí el pago y el contrato firmado. Oficialmente hemos iniciado tu proyecto de <strong>{lead.service_requested}</strong>.
              </p>
              
              <div className="grid gap-4 text-left mb-12">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <CheckCircle className="text-green-500" size={24} />
                  <span>Contrato enviado a <strong>{lead.email}</strong></span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <CheckCircle className="text-green-500" size={24} />
                  <span>Slack del proyecto creado</span>
                </div>
              </div>

              <a
                href="https://t.me/omar_hernandez" // Link a canal de Telegram o Slack
                className="inline-flex items-center gap-3 bg-[var(--primary-color)] text-white px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-[var(--primary-color)]/20"
              >
                Unirme al Canal del Proyecto
                <ArrowRight size={24} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
