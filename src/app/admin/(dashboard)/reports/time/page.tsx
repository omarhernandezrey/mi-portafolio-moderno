"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  DollarSign,
  Clock,
  User,
  Building2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { adminFetch } from '@/lib/admin/client-fetch';

interface ReportRow {
  id: string;
  name: string;
  company: string;
  budget: string;
  total_seconds: number;
}

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function parseBudget(budget: string | null | undefined) {
  const raw = String(budget ?? '').replace(/[^0-9.,]/g, '');
  if (!raw) return 0;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized = raw;

  if (lastComma > lastDot) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    const decimals = raw.length - lastDot - 1;
    const dotCount = (raw.match(/\./g) || []).length;
    normalized =
      dotCount > 1 || decimals === 3
        ? raw.replace(/\./g, '')
        : raw.replace(/,/g, '');
  } else {
    normalized = raw.replace(/,/g, '');
  }

  return parseFloat(normalized) || 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TimeReportPage() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await adminFetch<ReportRow[]>('/api/admin/timer/report');
      setReport(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el reporte de horas.'
      );
      setReport([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totalSeconds = report.reduce(
    (sum, row) => sum + (row.total_seconds || 0),
    0
  );
  const totalBudget = report.reduce(
    (sum, row) => sum + parseBudget(row.budget),
    0
  );
  const averagePerHour =
    totalSeconds > 0 ? totalBudget / (totalSeconds / 3600) : 0;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Analytics"
        title="Reporte de rentabilidad"
        description="Horas registradas y retorno por proyecto."
        actions={
          <AdminButton
            onClick={fetchReport}
            disabled={isLoading}
            size="sm"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          >
            Actualizar
          </AdminButton>
        }
      />

      <section
        aria-label="Resumen de rentabilidad"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <StatCard
          title="Horas totales"
          value={formatHours(totalSeconds)}
          icon={<Clock size={19} />}
          color="primary"
          description="Tiempo registrado en proyectos"
        />
        <StatCard
          title="Proyectos"
          value={report.length.toString()}
          icon={<User size={19} />}
          color="info"
          description="Clientes con tiempo registrado"
        />
        <StatCard
          title="Promedio/hora"
          value={formatMoney(averagePerHour)}
          icon={<DollarSign size={19} />}
          color="success"
          description="Ingreso medio por hora"
        />
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5 text-xs font-medium text-admin-danger"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-admin-line bg-card-bg p-8 text-center">
            <p className="animate-pulse text-xs font-medium text-text-muted">
              Cargando datos...
            </p>
          </div>
        ) : report.length === 0 ? (
          <EmptyState
            icon={<Clock size={24} />}
            title="Sin registros"
            description="No hay registros de tiempo todavía."
          />
        ) : (
          report.map((row) => {
            const ratio =
              row.total_seconds > 0
                ? parseBudget(row.budget) / (row.total_seconds / 3600)
                : 0;

            return (
              <article
                key={row.id}
                className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-admin-line bg-white/[0.04]">
                    <User size={16} className="text-text-muted/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-admin-ink">
                      {row.name}
                    </p>
                    {row.company && (
                      <p className="flex items-center gap-1 text-[10px] text-text-muted/60">
                        <Building2 size={9} className="shrink-0" />
                        <span className="truncate">{row.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5 text-center">
                    <p className="font-mono-label text-[8px] text-text-muted/50">
                      Horas
                    </p>
                    <p className="mt-1 text-xs font-black text-admin-ink">
                      {formatHours(row.total_seconds)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5 text-center">
                    <p className="font-mono-label text-[8px] text-text-muted/50">
                      Budget
                    </p>
                    <p className="mt-1 truncate text-xs font-black text-admin-success">
                      {row.budget || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5 text-center">
                    <p className="font-mono-label text-[8px] text-text-muted/50">
                      $/hora
                    </p>
                    <p
                      className={`mt-1 text-xs font-black ${
                        averagePerHour > 0 && ratio < averagePerHour * 0.5
                          ? 'text-admin-danger'
                          : 'text-admin-ink'
                      }`}
                    >
                      {formatMoney(ratio)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-admin-line bg-white/[0.02]">
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Cliente / Proyecto
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Horas totales
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Ingreso (budget)
                </th>
                <th className="px-5 py-3 text-right font-mono-label text-[9px] text-text-muted/60">
                  Ratio $/hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-xs font-medium text-text-muted"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : report.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10">
                    <EmptyState
                      icon={<Clock size={24} />}
                      title="Sin registros"
                      description="No hay registros de tiempo todavía."
                      className="border-0 bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                report.map((row) => {
                  const ratio =
                    row.total_seconds > 0
                      ? parseBudget(row.budget) / (row.total_seconds / 3600)
                      : 0;

                  return (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-admin-ink">
                          {row.name}
                        </p>
                        <p className="text-[10px] text-text-muted/60">
                          {row.company || '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-text-muted">
                        {formatHours(row.total_seconds)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-admin-success/20 bg-admin-success/10 px-2.5 py-1 text-xs font-black text-admin-success">
                          <DollarSign size={10} />
                          {row.budget || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`text-sm font-black ${
                            averagePerHour > 0 && ratio < averagePerHour * 0.5
                              ? 'text-admin-danger'
                              : 'text-admin-ink'
                          }`}
                        >
                          {formatMoney(ratio)}
                          <span className="text-[9px] font-normal text-text-muted/60">
                            /h
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
