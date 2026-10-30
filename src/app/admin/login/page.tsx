"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (err === 'unauthorized') {
      setError('No tienes permiso para acceder al panel de administración.');
    } else if (err === 'auth-code-error') {
      setError('El enlace de acceso expiró o es inválido. Solicita uno nuevo.');
    }
  }, []);

  let supabaseClient: ReturnType<typeof createClient> | null = null;
  const getSupabase = () => {
    if (!supabaseClient) supabaseClient = createClient();
    return supabaseClient;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: authError } = await getSupabase().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('No se pudo conectar con el servicio de autenticación.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-shell relative flex min-h-dvh items-center justify-center overflow-hidden p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-bold text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Volver al portafolio
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-admin-line bg-white/[0.03] px-2.5 py-1 font-mono-label text-[8px] text-text-muted/70">
            <LockKeyhole size={10} />
            Acceso restringido
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl border border-admin-line bg-admin-surface/90 p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8"
        >
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-custom-primary">
              <ShieldCheck size={28} />
            </div>
            <p className="font-mono-label mb-2 text-[9px] text-primary/80">
              Panel de administración
            </p>
            <h1 className="font-display text-3xl font-semibold italic tracking-tight text-admin-ink">
              Admin Suite
            </h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-text-muted">
              Introduce tu correo autorizado y recibirás un enlace mágico para
              acceder.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                role="status"
                aria-live="polite"
                className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle size={24} />
                </div>
                <h2 className="font-display text-xl font-semibold italic text-admin-ink">
                  Enlace enviado
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Hemos enviado un acceso a{' '}
                  <strong className="font-bold text-primary">{email}</strong>.
                  Revisa tu bandeja de entrada y la carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="mt-5 text-xs font-bold text-primary transition-colors hover:text-accent"
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
                className="space-y-5"
                noValidate={false}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="admin-email"
                    className="ml-0.5 block text-xs font-bold text-text-muted"
                  >
                    Correo profesional
                  </label>
                  <div className="group relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
                    />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="admin@tuproyecto.com"
                      required
                      autoFocus
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? 'admin-login-error' : undefined}
                      className="w-full rounded-xl border border-admin-line bg-admin-bg/60 py-3.5 pl-11 pr-4 text-sm font-medium text-admin-ink outline-none transition-colors placeholder:text-text-muted/40 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    id="admin-login-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5 text-xs font-medium leading-relaxed text-admin-danger"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary bg-primary px-5 py-3.5 text-sm font-black text-background shadow-custom-primary transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"
                    />
                  ) : (
                    <Send
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                  <span>{isLoading ? 'Enviando...' : 'Acceder ahora'}</span>
                </button>

                <p className="text-center text-[10px] font-medium leading-relaxed text-text-muted/50">
                  Solo los correos incluidos en la lista de administradores
                  pueden solicitar acceso.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-5 text-center font-mono-label text-[8px] text-text-muted/40">
          Supabase Auth · Acceso cifrado · Omar Hernández
        </p>
      </div>
    </div>
  );
}
