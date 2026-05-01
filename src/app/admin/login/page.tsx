"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, AlertCircle, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Portafolio
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card-bg p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-primary/10 backdrop-blur-sm"
        >
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.1)]">
              <Shield size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white-custom tracking-tight mb-2">Admin Portal</h1>
            <p className="text-text-muted text-sm leading-relaxed">
              Autenticación segura para el panel de gestión.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl bg-primary/5 p-8 text-center border border-primary/20"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <CheckCircle size={28} />
                </div>
                <h2 className="mb-3 text-xl font-bold text-white-custom">Enlace enviado</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Hemos enviado un acceso mágico a <strong className="text-primary">{email}</strong>. 
                  Revisa tu bandeja (y spam si es necesario).
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-xs uppercase tracking-widest font-bold text-primary hover:text-accent transition-colors"
                >
                  Intentar con otro correo
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleLogin} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-text-muted ml-1">
                    Correo Profesional
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-background/50 pl-12 pr-4 py-4 text-white-custom outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/50"
                      placeholder="admin@tuproyecto.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20"
                  >
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 font-bold text-background shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Acceder ahora</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-text-muted uppercase tracking-tighter opacity-50">
                  Protegido por Supabase Auth & Portafolio Moderno Security
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
