"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CALCULATOR_STEPS, calculateBudget } from '@/lib/calculator/pricing';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Check, Download, Info, Sparkles, Target, Wallet } from 'lucide-react';
import { track } from '@vercel/analytics';

export default function BudgetCalculator() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'es') as 'es' | 'en' | 'pt';

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '', company: '' });

  const currentStepData = CALCULATOR_STEPS[currentStep];
  const isLastStep = currentStep === CALCULATOR_STEPS.length - 1;
  const showLeadForm = currentStep === CALCULATOR_STEPS.length;
  
  const progress = (currentStep / CALCULATOR_STEPS.length) * 100;

  const currentBudget = useMemo(() => calculateBudget(selections), [selections]);

  const handleSelect = (optionId: string) => {
    const stepId = currentStepData.id;
    if (stepId === 'features') {
      const current = (selections[stepId] as string[]) || [];
      const updated = current.includes(optionId) 
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setSelections({ ...selections, [stepId]: updated });
    } else {
      setSelections({ ...selections, [stepId]: optionId });
    }
  };

  const nextStep = () => {
    if (currentStep < CALCULATOR_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selections,
          visitorInfo,
          budget: currentBudget,
          language: lang
        })
      });
      if (response.ok) {
        setIsSuccess(true);
        track('lead_created', { source: 'calculator' });
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-12">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-card-bg/40 p-10 rounded-[40px] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <Wallet size={160} className="rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
            <span className="w-8 h-px bg-primary/30" />
            Financial Estimator
          </div>
          <h1 className="text-4xl font-black text-white-custom tracking-tight italic leading-tight">
            {lang === 'es' ? 'Calculadora de Presupuesto' : lang === 'en' ? 'Budget Calculator' : 'Calculadora de Orçamento'}
          </h1>
          <p className="text-text-muted text-sm font-medium max-w-md opacity-70">
            {lang === 'es' ? 'Precisión algorítmica para determinar la inversión necesaria en tu próximo hito digital.' : lang === 'en' ? 'Algorithmic precision to determine the necessary investment for your next digital milestone.' : 'Precisão algorítmica para determinar o investimento necessário para o seu próximo marco digital.'}
          </p>
        </div>

        <div className="text-right relative z-10 bg-background/50 p-6 rounded-[32px] border border-white/5 shadow-inner min-w-[200px] group-hover:border-primary/20 transition-all">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
            {lang === 'es' ? 'Presupuesto Base' : lang === 'en' ? 'Estimated Base' : 'Orçamento Base'}
          </span>
          <div className="text-5xl font-black text-white-custom tracking-tighter mt-1 flex items-baseline justify-end gap-2">
            <span className="text-xl text-primary opacity-40">$</span>
            {currentBudget} 
            <span className="text-xs font-bold text-text-muted/40 tracking-widest uppercase">USD</span>
          </div>
        </div>
      </div>

      {/* Progress Architecture */}
      <div className="px-10">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.3)]"
          />
        </div>
        <div className="flex justify-between mt-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-30">Concepto</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-30">Ejecución</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-30">Finalización</span>
        </div>
      </div>

      <div className="relative min-h-[500px] overflow-hidden rounded-[48px] bg-card-bg p-10 md:p-16 shadow-2xl border border-white/5 backdrop-blur-md">
        <AnimatePresence mode="wait">
          {!showLeadForm ? (
            <motion.div
              key={currentStep}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 border border-primary/20 text-xl font-black text-primary italic shadow-inner">
                  0{currentStep + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white-custom tracking-tight leading-tight italic">
                    {currentStepData.title[lang]}
                  </h2>
                  <p className="text-text-muted text-xs font-medium opacity-50 mt-1 uppercase tracking-widest">Paso obligatorio de calificación</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.options.map((option) => {
                  const isSelected = Array.isArray(selections[currentStepData.id])
                    ? (selections[currentStepData.id] as string[]).includes(option.id)
                    : selections[currentStepData.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`group relative flex flex-col items-start gap-4 rounded-[32px] border-2 p-8 text-left transition-all duration-300 ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5' 
                          : 'border-white/5 bg-background/30 hover:border-white/20 hover:bg-background/50'
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        isSelected ? 'border-primary bg-primary text-background' : 'border-white/10 text-white-custom/20'
                      }`}>
                        {isSelected ? <Check size={18} strokeWidth={3} /> : <Target size={18} />}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-black text-white-custom tracking-tight italic group-hover:text-primary transition-colors">{option.label[lang]}</div>
                        {option.description && (
                          <div className="text-[11px] text-text-muted/60 font-medium leading-relaxed italic">{option.description[lang]}</div>
                        )}
                      </div>

                      {option.priceImpact > 0 && (
                        <div className="absolute top-8 right-8 font-black text-[10px] uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                          {option.impactType === 'multiplier' ? `+${(option.priceImpact - 1) * 100}%` : `+$${option.priceImpact}`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-10 border-t border-white/5">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-3 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-all hover:text-white-custom disabled:opacity-0"
                >
                  <ArrowLeft size={16} />
                  {lang === 'es' ? 'Anterior' : lang === 'en' ? 'Previous' : 'Anterior'}
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selections[currentStepData.id] || (Array.isArray(selections[currentStepData.id]) && (selections[currentStepData.id] as string[]).length === 0)}
                  className="group flex items-center gap-3 rounded-[24px] bg-primary px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-background shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale"
                >
                  {isLastStep ? (lang === 'es' ? 'Finalizar Auditoría' : 'Finalize Audit') : (lang === 'es' ? 'Próximo Paso' : 'Next Step')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-full flex-col items-center justify-center text-center space-y-10 py-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary text-background shadow-2xl shadow-primary/20">
                  <Sparkles size={48} />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white-custom tracking-tighter italic">
                  {lang === 'es' ? 'Estrategia Generada' : 'Strategy Generated'}
                </h2>
                <p className="max-w-md text-text-muted text-sm font-medium leading-relaxed italic opacity-70">
                  {lang === 'es' 
                    ? 'Hemos desplegado tu propuesta técnica personalizada en formato PDF directamente a tu bandeja de entrada corporativa.' 
                    : 'We have deployed your personalized technical proposal in PDF format directly to your corporate inbox.'}
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="rounded-[24px] border-2 border-primary text-primary px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-background shadow-xl"
              >
                {lang === 'es' ? 'Volver al Centro de Mando' : 'Back to Control Center'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-12 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                  Última Fase: Exportación
                </div>
                <h2 className="text-3xl font-black text-white-custom tracking-tight italic leading-tight">
                  {lang === 'es' ? 'Recibe tu Propuesta Formal' : 'Receive your Formal Proposal'}
                </h2>
                <p className="text-text-muted text-sm font-medium opacity-60">
                  {lang === 'es' ? 'Integraremos los datos de tu auditoría en un documento ejecutivo de alta fidelidad.' : 'We will integrate your audit data into a high-fidelity executive document.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.2em] ml-4">Nombre Corporativo</label>
                  <input
                    required
                    type="text"
                    value={visitorInfo.name}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, name: e.target.value })}
                    className="w-full rounded-[24px] border border-white/5 bg-background/50 px-6 py-4 text-sm text-white-custom outline-none focus:border-primary/30 shadow-inner"
                    placeholder="Omar Hernandez"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.2em] ml-4">Email de Negocio</label>
                  <input
                    required
                    type="email"
                    value={visitorInfo.email}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, email: e.target.value })}
                    className="w-full rounded-[24px] border border-white/5 bg-background/50 px-6 py-4 text-sm text-white-custom outline-none focus:border-primary/30 shadow-inner"
                    placeholder="ejemplo@negocio.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.2em] ml-4">Organización / Proyecto</label>
                  <input
                    type="text"
                    value={visitorInfo.company}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, company: e.target.value })}
                    className="w-full rounded-[24px] border border-white/5 bg-background/50 px-6 py-4 text-sm text-white-custom outline-none focus:border-primary/30 shadow-inner"
                    placeholder="Mi Startup S.A.S"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="group relative flex w-full items-center justify-center gap-3 rounded-[28px] bg-primary py-6 text-xs font-black uppercase tracking-[0.3em] text-background shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                      <>
                        <Download size={20} />
                        {lang === 'es' ? 'Procesar y Enviar Auditoría' : 'Process and Send Audit'}
                      </>
                    )}
                  </button>
                  <p className="text-center text-[8px] text-text-muted/30 uppercase font-black tracking-widest mt-6">Secure Cloud Processing Protocol Enabled</p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] flex items-start gap-4 max-w-2xl mx-auto italic">
        <Info className="text-primary shrink-0 mt-1" size={20} />
        <p className="text-[11px] text-text-muted font-medium leading-relaxed opacity-60">
          {lang === 'es' 
            ? 'Esta estimación se deriva de parámetros de mercado estándar para arquitectura de software moderna (Next.js 15+, Supabase, AI Agents). El valor final se consolidará tras una sesión de descubrimiento técnico directa.'
            : 'This estimate is derived from standard market parameters for modern software architecture (Next.js 15+, Supabase, AI Agents). The final value will be consolidated after a direct technical discovery session.'}
        </p>
      </div>
    </div>
  );
}
