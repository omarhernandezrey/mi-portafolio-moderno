"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CALCULATOR_STEPS, calculateBudget } from '@/lib/calculator/pricing';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Check, Download } from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-color)]">
            {lang === 'es' ? 'Calculadora de Presupuesto' : lang === 'en' ? 'Budget Calculator' : 'Calculadora de Orçamento'}
          </h1>
          <p className="text-[var(--muted-color)]">
            {lang === 'es' ? 'Obtén un estimado real en 2 minutos.' : lang === 'en' ? 'Get a real estimate in 2 minutes.' : 'Obtenha uma estimativa real em 2 minutos.'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-color)]">
            {lang === 'es' ? 'Presupuesto Estimado' : lang === 'en' ? 'Estimated Budget' : 'Orçamento Estimado'}
          </span>
          <div className="text-4xl font-black text-[var(--primary-color)]">
            ${currentBudget} <span className="text-sm font-normal text-[var(--muted-color)]">USD</span>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px] overflow-hidden rounded-3xl bg-[var(--white-color)] p-8 shadow-xl border border-[var(--muted-color)]/20">
        <AnimatePresence mode="wait">
          {!showLeadForm ? (
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-color)] text-[10px] font-bold text-white">
                  {currentStep + 1}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                  {currentStepData.title[lang]}
                </h2>
              </div>

              <div className="grid gap-3">
                {currentStepData.options.map((option) => {
                  const isSelected = Array.isArray(selections[currentStepData.id])
                    ? (selections[currentStepData.id] as string[]).includes(option.id)
                    : selections[currentStepData.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`group relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected 
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 shadow-md' 
                          : 'border-[var(--muted-color)]/20 hover:border-[var(--primary-color)]/50'
                      }`}
                    >
                      <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' : 'border-[var(--muted-color)]/30'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-color)]">{option.label[lang]}</div>
                        {option.description && (
                          <div className="text-xs text-[var(--muted-color)]">{option.description[lang]}</div>
                        )}
                      </div>
                      {option.priceImpact > 0 && (
                        <div className="ml-auto font-mono text-sm font-bold text-[var(--primary-color)]">
                          {option.impactType === 'multiplier' ? `+${(option.priceImpact - 1) * 100}%` : `+$${option.priceImpact}`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-8">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-[var(--muted-color)] transition-colors hover:text-[var(--text-color)] disabled:opacity-30"
                >
                  <ArrowLeft size={16} />
                  {lang === 'es' ? 'Anterior' : lang === 'en' ? 'Previous' : 'Anterior'}
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selections[currentStepData.id] || (Array.isArray(selections[currentStepData.id]) && (selections[currentStepData.id] as string[]).length === 0)}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {isLastStep ? (lang === 'es' ? 'Ver resumen' : 'View summary') : (lang === 'es' ? 'Siguiente' : 'Next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-full flex-col items-center justify-center text-center space-y-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
                <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-color)]">
                {lang === 'es' ? '¡Todo listo!' : 'All set!'}
              </h2>
              <p className="max-w-xs text-[var(--muted-color)]">
                {lang === 'es' 
                  ? 'Hemos enviado tu propuesta personalizada en PDF a tu correo. Revísalo (incluso en spam).' 
                  : 'We have sent your personalized PDF proposal to your email. Check it (even in spam).'}
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="rounded-xl bg-[var(--primary-color)] px-8 py-3 font-bold text-white transition-all hover:brightness-110"
              >
                {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--text-color)]">
                  {lang === 'es' ? '¡Recibe tu propuesta detallada!' : 'Receive your detailed proposal!'}
                </h2>
                <p className="text-sm text-[var(--muted-color)]">
                  {lang === 'es' ? 'Ingresa tus datos para enviarte el PDF con el desglose.' : 'Enter your details to receive the PDF with the breakdown.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[var(--muted-color)]">
                    {lang === 'es' ? 'Nombre completo' : 'Full Name'}
                  </label>
                  <input
                    required
                    type="text"
                    value={visitorInfo.name}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--muted-color)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 text-slate-900"
                    placeholder="Omar Hernandez"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[var(--muted-color)]">
                    {lang === 'es' ? 'Correo electrónico' : 'Email Address'}
                  </label>
                  <input
                    required
                    type="email"
                    value={visitorInfo.email}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--muted-color)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 text-slate-900"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-[var(--muted-color)]">
                    {lang === 'es' ? 'Empresa / Proyecto' : 'Company / Project'}
                  </label>
                  <input
                    type="text"
                    value={visitorInfo.company}
                    onChange={(e) => setVisitorInfo({ ...visitorInfo, company: e.target.value })}
                    className="w-full rounded-xl border border-[var(--muted-color)]/30 bg-white px-4 py-3 text-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 text-slate-900"
                    placeholder="Mi Startup S.A.S"
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] py-4 font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Download size={20} />
                        {lang === 'es' ? 'Generar y enviar PDF' : 'Generate and send PDF'}
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setCurrentStep(CALCULATOR_STEPS.length - 1)}
                  className="w-full text-center text-xs text-[var(--muted-color)] hover:underline"
                >
                  {lang === 'es' ? 'Atrás, quiero cambiar algo' : 'Back, I want to change something'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 text-center text-[var(--muted-color)] text-sm">
        <p>
          {lang === 'es' 
            ? 'Este es un estimado basado en los servicios estándar. Para una cotización exacta, hablemos por el chat.'
            : 'This is an estimate based on standard services. For an exact quote, let\'s talk through the chat.'}
        </p>
      </div>
    </div>
  );
}
