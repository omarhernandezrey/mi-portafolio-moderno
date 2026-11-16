"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Paso adicional de MFA (T-19): solo se llega aquí si `middleware.ts` /
 * `AdminLayout` detectaron que la sesión necesita completar el desafío
 * (`necesitaDesafioMfa`). Sin eso no hace falta — por eso esta página no
 * comprueba el rol por su cuenta: confía en que quien la enrutó ya decidió
 * que hacía falta.
 */
export default function MfaChallengePage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const supabase = createClient();
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp?.find((f) => f.status === 'verified');
      if (listError || !factor) {
        if (!cancelado) {
          setError('No se encontró un factor de verificación activo. Vuelve a iniciar sesión.');
          setIsLoading(false);
        }
        return;
      }
      const { data: desafio, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id,
      });
      if (cancelado) return;
      if (challengeError || !desafio) {
        setError('No se pudo iniciar la verificación. Intenta de nuevo.');
        setIsLoading(false);
        return;
      }
      setFactorId(factor.id);
      setChallengeId(desafio.id);
      setIsLoading(false);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || !challengeId) return;
    setError('');
    setIsVerifying(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: code.trim(),
      });
      if (verifyError) {
        setError('Código incorrecto o expirado. Pide uno nuevo desde tu app de autenticación.');
        setIsVerifying(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('No se pudo verificar el código. Intenta de nuevo.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="admin-shell relative flex min-h-dvh items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="relative w-full max-w-md rounded-2xl border border-admin-line bg-admin-surface/90 p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-custom-primary">
          <ShieldCheck size={28} />
        </div>
        <h1 className="font-display text-2xl font-semibold italic tracking-tight text-admin-ink">
          Verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Introduce el código de 6 dígitos de tu app de autenticación.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-text-muted">Preparando la verificación…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="group relative">
              <KeyRound
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
              />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                disabled={!challengeId}
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'mfa-error' : undefined}
                className="w-full rounded-xl border border-admin-line bg-admin-bg/60 py-3.5 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] text-admin-ink outline-none transition-colors placeholder:text-text-muted/40 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {error && (
              <div
                id="mfa-error"
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5 text-xs font-medium leading-relaxed text-admin-danger"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!challengeId || isVerifying || code.length !== 6}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary bg-primary px-5 py-3.5 text-sm font-black text-background shadow-custom-primary transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isVerifying ? 'Verificando…' : 'Verificar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
