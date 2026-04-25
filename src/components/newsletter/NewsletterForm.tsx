"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al suscribirse');
      }

      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error al suscribirse');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[var(--secondary-background-color)] to-[var(--background-color)] p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/10 blur-3xl -z-10"></div>
        
        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full text-green-500 mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-black mb-2">¡Casi listo!</h3>
            <p className="text-[var(--muted-color)]">
              Hemos enviado un email de confirmación a tu bandeja de entrada. Por favor, confírmalo para completar tu suscripción.
            </p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-6 text-[var(--primary-color)] font-bold hover:underline"
            >
              Volver a intentar con otro email
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[var(--primary-color)]/10 rounded-2xl text-[var(--primary-color)]">
                <Mail size={24} />
              </div>
              <h3 className="text-2xl font-black">Newsletter Tech</h3>
            </div>
            
            <p className="text-[var(--muted-color)] mb-8 leading-relaxed">
              Únete a +500 desarrolladores y dueños de negocio. Recibe un email al mes sobre IA, desarrollo web y productividad. <strong>Cero spam.</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
                <div className="relative flex items-center bg-[var(--background-color)] rounded-2xl p-1.5 border border-[var(--primary-color)]/10">
                  <input
                    type="email"
                    placeholder="Tu email principal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-lg"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[var(--primary-color)] text-white p-3 rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <ArrowRight size={24} />
                    )}
                  </button>
                </div>
              </div>
              {status === 'error' && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm font-medium pl-2"
                >
                  {errorMsg}
                </motion.p>
              )}
              <p className="text-[10px] text-[var(--muted-color)]/60 text-center uppercase tracking-widest font-bold">
                Al suscribirte, aceptas mi política de privacidad
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
