"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, User, Building2 } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';

interface ReportRow {
  id: string;
  name: string;
  company: string;
  budget: string;
  total_seconds: number;
}

export default function TimeReportPage() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const r = await fetch('/api/admin/timer/report');
      const data = await r.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const totalHours = report.reduce((acc, curr) => acc + (curr.total_seconds || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Analytics"
        title="Reporte de Rentabilidad"
        actions={
          <button 
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:bg-white/10 transition-all"
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-card-bg p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl">
          <p className="text-[10px] sm:text-xs font-black text-text-muted uppercase tracking-widest">Total Horas</p>
          <div className="text-2xl sm:text-3xl font-black text-white-custom mt-2">
            {formatHours(totalHours)}
          </div>
        </div>
        <div className="bg-card-bg p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl">
          <p className="text-[10px] sm:text-xs font-black text-text-muted uppercase tracking-widest">Proyectos</p>
          <div className="text-2xl sm:text-3xl font-black text-primary mt-2">
            {report.length}
          </div>
        </div>
        <div className="bg-card-bg p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-xs font-black text-text-muted uppercase tracking-widest">Promedio $/hora</p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
            ${totalHours > 0 
              ? (report.reduce((acc, row) => acc + parseFloat(row.budget?.replace(/[^0-9.]/g, '') || '0'), 0) / (totalHours / 3600)).toFixed(2)
              : '0.00'}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          <div className="bg-card-bg rounded-2xl border border-white/5 p-8 text-center">
            <div className="animate-pulse text-text-muted text-sm">Cargando datos...</div>
          </div>
        ) : report.length === 0 ? (
          <div className="bg-card-bg rounded-2xl border border-white/5 p-8">
            <EmptyState 
              icon={<Clock size={32} />}
              title="Sin registros"
              description="No hay registros de tiempo."
            />
          </div>
        ) : (
          report.map((row, i) => {
            const budgetNum = parseFloat(row.budget?.replace(/[^0-9.]/g, '') || '0');
            const hours = row.total_seconds / 3600;
            const ratio = hours > 0 ? (budgetNum / hours).toFixed(2) : '0';

            return (
              <div key={i} className="bg-card-bg rounded-2xl border border-white/5 p-4 shadow-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User size={18} className="text-text-muted/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white-custom text-sm truncate">{row.name}</div>
                    {row.company && (
                      <div className="flex items-center gap-1 text-[10px] text-text-muted/60">
                        <Building2 size={10} />
                        <span className="truncate">{row.company}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background/40 rounded-lg p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-text-muted/40 font-black">Horas</div>
                    <div className="text-xs font-black text-white-custom font-mono">{formatHours(row.total_seconds)}</div>
                  </div>
                  <div className="bg-background/40 rounded-lg p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-text-muted/40 font-black">Presupuesto</div>
                    <div className="text-xs font-black text-emerald-400 font-mono truncate">{row.budget || 'N/A'}</div>
                  </div>
                  <div className="bg-background/40 rounded-lg p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-text-muted/40 font-black">$/hora</div>
                    <div className={`text-xs font-black font-mono ${parseFloat(ratio) < 20 ? 'text-red-500' : 'text-white-custom'}`}>
                      ${ratio}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card-bg rounded-[24px] sm:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
            <thead>
              <tr className="bg-background/40">
                <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Cliente / Proyecto</th>
                <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Horas Totales</th>
                <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Ingreso (Budget)</th>
                <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Ratio $/hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-text-muted italic">Cargando datos...</td></tr>
              ) : report.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-text-muted italic">No hay registros de tiempo.</td></tr>
              ) : report.map((row, i) => {
                const budgetNum = parseFloat(row.budget?.replace(/[^0-9.]/g, '') || '0');
                const hours = row.total_seconds / 3600;
                const ratio = hours > 0 ? (budgetNum / hours).toFixed(2) : '0';

                return (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 xl:px-8 py-5">
                      <div className="font-bold text-white-custom text-sm">{row.name}</div>
                      <div className="text-xs text-text-muted/60">{row.company}</div>
                    </td>
                    <td className="px-4 xl:px-8 py-5 font-mono text-sm text-text-muted">
                      {formatHours(row.total_seconds)}
                    </td>
                    <td className="px-4 xl:px-8 py-5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-black">
                        <DollarSign size={10} /> {row.budget || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 xl:px-8 py-5 text-right">
                      <span className={`font-black ${parseFloat(ratio) < 20 ? 'text-red-500' : 'text-white-custom'}`}>
                        ${ratio}<span className="text-[10px] font-normal text-text-muted/60">/h</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
