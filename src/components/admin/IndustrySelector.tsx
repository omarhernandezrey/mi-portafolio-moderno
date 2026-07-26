"use client";

import React, { useState } from 'react';
import { Building2, Save, Loader2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFetch } from '@/lib/admin/client-fetch';

interface IndustrySelectorProps {
  leadId: string;
  currentIndustry?: string;
}

export default function IndustrySelector({ leadId, currentIndustry }: IndustrySelectorProps) {
  const [industry, setIndustry] = useState(currentIndustry || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useAdminToast();

  const industries = [
    { id: 'startup', name: 'Startup / MVP' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'landing', name: 'Landing Page' },
    { id: 'automation', name: 'Automatización / Dashboard' },
    { id: 'clinica-dental', name: 'Salud / Servicios Profesionales' },
    { id: 'General', name: 'General / Otro' },
  ];

  const handleSave = async () => {
    if (!industry) {
      toast.warning('Debes seleccionar una industria antes de guardar');
      return;
    }

    if (industry === currentIndustry) {
      toast.info('No hay cambios para guardar');
      return;
    }

    setLoading(true);
    try {
      await adminFetch(`/api/admin/leads/${leadId}/industry`, {
        method: 'PATCH',
        body: JSON.stringify({ industry }),
      });

      toast.success('Industria guardada correctamente');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la industria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card-bg rounded-[24px] border border-white/10 hover:border-primary/30 transition-colors relative z-10 shadow-xl">
      <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest">
        <Building2 size={18} className="text-primary" />
        Nicho / Industria
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <select
            className="w-full appearance-none bg-background border-2 border-white/30 hover:border-primary/60 focus:border-primary rounded-2xl px-5 py-4 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white-custom font-bold cursor-pointer shadow-inner"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="" className="bg-card-bg text-text-muted font-medium py-3">
              Seleccionar industria...
            </option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id} className="bg-card-bg text-white-custom font-bold py-3">
                {ind.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={24} />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-4 bg-primary text-background rounded-2xl disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 text-base font-black whitespace-nowrap shrink-0 shadow-lg shadow-primary/30 uppercase tracking-wider"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Save size={20} />
              <span>Guardar</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm font-bold pt-2">
        {currentIndustry ? (
          <>
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            <span className="text-emerald-400">
              Actual: {industries.find((i) => i.id === currentIndustry)?.name || currentIndustry}
            </span>
          </>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            <span className="text-amber-400">Sin industria asignada</span>
          </>
        )}
      </div>
    </div>
  );
}
