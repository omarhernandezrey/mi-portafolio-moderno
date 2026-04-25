"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--background-color)] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-[var(--card-bg-color)] p-8 shadow-2xl border border-[var(--primary-color)]/20"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--white-color)]">Acceso Administrador</h1>
          <p className="text-[var(--muted-color)]">Recibirás un enlace de acceso en tu correo</p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-green-500/10 p-6 text-center border border-green-500/20"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <CheckCircle size={24} />
            </div>
            <h2 className="mb-2 font-semibold text-[var(--white-color)]">¡Enlace enviado!</h2>
            <p className="text-sm text-[var(--muted-color)]">
              Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el botón de acceso.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-4 text-sm text-[var(--primary-color)] hover:underline"
            >
              Intentar con otro correo
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-color)]">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--muted-color)]/30 bg-[var(--background-color)] px-4 py-3 text-[var(--white-color)] outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                placeholder="tu@email.com"
                required
                autoFocus
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] py-3 font-semibold text-[var(--inner-circle-text-color)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Send size={20} />
                  <span>Enviar Enlace Mágico</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
