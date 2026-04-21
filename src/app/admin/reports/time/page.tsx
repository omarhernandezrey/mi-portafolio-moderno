"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

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

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <TrendingUp className="text-green-600" /> Reporte de Rentabilidad
        </h1>
        <button 
          onClick={fetchReport}
          className="text-sm text-blue-600 hover:underline"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Horas</p>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {formatHours(report.reduce((acc, curr) => acc + (curr.total_seconds || 0), 0))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Cliente / Proyecto</th>
              <th className="px-6 py-4">Horas Totales</th>
              <th className="px-6 py-4">Ingreso (Budget)</th>
              <th className="px-6 py-4 text-right">Ratio $/hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Cargando datos...</td></tr>
            ) : report.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No hay registros de tiempo.</td></tr>
            ) : report.map((row, i) => {
              const budgetNum = parseFloat(row.budget?.replace(/[^0-9.]/g, '') || '0');
              const hours = row.total_seconds / 3600;
              const ratio = hours > 0 ? (budgetNum / hours).toFixed(2) : '0';

              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.company}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {formatHours(row.total_seconds)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs font-bold">
                      <DollarSign size={10} /> {row.budget || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-black ${parseFloat(ratio) < 20 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${ratio}<span className="text-[10px] font-normal text-slate-400">/h</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
