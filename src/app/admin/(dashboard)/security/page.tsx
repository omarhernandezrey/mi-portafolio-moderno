"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, KeyRound, ShieldCheck, ShieldOff, ShieldPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminButton, AdminCard, ConfirmDialog, Skeleton } from '@/components/admin/ui';

type Factor = { id: string; status: 'verified' | 'unverified'; friendlyName?: string | null };

type Enrolamiento = {
  factorId: string;
  qrCode: string;
  secret: string;
};

/**
 * Activar/desactivar MFA (T-19). Solo `owner`: lo exige
 * `ADMIN_PATH_PERMISSIONS['/admin/security']`. En cuanto queda un factor
 * verificado, `middleware.ts` y `AdminLayout` empiezan a exigir el desafío
 * de `/admin/mfa-challenge` en cada sesión nueva — no hace falta nada más
 * aquí para que se aplique.
 */
export default function SecurityPage() {
  const [cargando, setCargando] = useState(true);
  const [factorVerificado, setFactorVerificado] = useState<Factor | null>(null);
  const [enrolamiento, setEnrolamiento] = useState<Enrolamiento | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);

  const cargarFactores = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    setFactorVerificado(data?.totp?.find((f) => f.status === 'verified') ?? null);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarFactores();
  }, [cargarFactores]);

  const iniciarEnrolamiento = async () => {
    setError('');
    setOcupado(true);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setOcupado(false);
    if (enrollError || !data) {
      setError('No se pudo iniciar la activación. Intenta de nuevo.');
      return;
    }
    setEnrolamiento({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  };

  const verificarYActivar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enrolamiento) return;
    setError('');
    setOcupado(true);
    const supabase = createClient();
    const { data: desafio, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrolamiento.factorId,
    });
    if (challengeError || !desafio) {
      setError('No se pudo generar el desafío. Intenta de nuevo.');
      setOcupado(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrolamiento.factorId,
      challengeId: desafio.id,
      code: codigo.trim(),
    });
    setOcupado(false);
    if (verifyError) {
      setError('Código incorrecto o expirado. Revisa tu app de autenticación e intenta de nuevo.');
      return;
    }
    setEnrolamiento(null);
    setCodigo('');
    await cargarFactores();
  };

  const desactivar = async () => {
    if (!factorVerificado) return;
    setOcupado(true);
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId: factorVerificado.id });
    setOcupado(false);
    setConfirmandoBaja(false);
    await cargarFactores();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono-label text-4xs text-primary/80">Seguridad</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-admin-ink sm:text-3xl">
          Verificación en dos pasos
        </h1>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-text-muted">
          Un código de tu app de autenticación (Google Authenticator, 1Password…), además de tu
          correo, para entrar al panel.
        </p>
      </div>

      {cargando ? (
        <AdminCard>
          <Skeleton className="h-24 w-full" />
        </AdminCard>
      ) : factorVerificado ? (
        <AdminCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-admin-success/20 bg-admin-success/10 text-admin-success">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-admin-ink">Verificación activa</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Cada sesión nueva pide el código, además del enlace de correo.
              </p>
            </div>
          </div>
          <AdminButton variant="danger" onClick={() => setConfirmandoBaja(true)} className="self-start sm:self-auto">
            <ShieldOff size={16} />
            Desactivar
          </AdminButton>
        </AdminCard>
      ) : enrolamiento ? (
        <AdminCard className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldPlus size={20} />
            </div>
            <div>
              <p className="font-bold text-admin-ink">Escanea el código</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Ábrelo con tu app de autenticación y escribe el código de 6 dígitos que te muestre.
              </p>
            </div>
          </div>

          <div className="flex justify-center rounded-xl border border-admin-line bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URI de Supabase, no un recurso de /public */}
            <img src={enrolamiento.qrCode} alt="Código QR para activar la verificación en dos pasos" className="h-44 w-44" />
          </div>

          <p className="text-center font-mono text-xs text-text-muted/70">
            ¿No puedes escanear? Clave manual: <span className="text-admin-ink">{enrolamiento.secret}</span>
          </p>

          <form onSubmit={verificarYActivar} className="space-y-4">
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
                value={codigo}
                onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full rounded-xl border border-admin-line bg-admin-bg/60 py-3.5 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] text-admin-ink outline-none transition-colors placeholder:text-text-muted/40 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <AdminButton type="submit" variant="primary" disabled={ocupado || codigo.length !== 6} className="flex-1">
                {ocupado ? 'Verificando…' : 'Activar'}
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setEnrolamiento(null);
                  setCodigo('');
                  setError('');
                }}
              >
                Cancelar
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : (
        <AdminCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-admin-line bg-white/[0.03] text-text-muted">
              <ShieldOff size={20} />
            </div>
            <div>
              <p className="font-bold text-admin-ink">Sin activar</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Cualquiera con tu enlace de correo podría entrar al panel.
              </p>
            </div>
          </div>
          <AdminButton variant="primary" onClick={iniciarEnrolamiento} disabled={ocupado} className="self-start sm:self-auto">
            <ShieldPlus size={16} />
            Activar
          </AdminButton>
        </AdminCard>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5 text-xs font-medium leading-relaxed text-admin-danger"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ConfirmDialog
        open={confirmandoBaja}
        onClose={() => setConfirmandoBaja(false)}
        onConfirm={desactivar}
        title="¿Desactivar la verificación en dos pasos?"
        description="Volverás a entrar solo con el enlace de correo. Puedes activarla de nuevo cuando quieras."
        confirmLabel="Desactivar"
        tone="danger"
        busy={ocupado}
      />
    </div>
  );
}
