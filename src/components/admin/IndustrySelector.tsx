"use client";

import React, { useState } from 'react';
import { Building2, Save, Loader2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface IndustrySelectorProps {
  leadId: string;
  currentIndustry?: string;
}

export default function IndustrySelector({ leadId, currentIndustry }: IndustrySelectorProps) {
  const [industry, setIndustry] = useState(currentIndustry || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

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
      showToast('⚠️ Debes seleccionar una industria antes de guardar', 'warning');
      return;
    }

    if (industry === currentIndustry) {
      showToast('ℹ️ No hay cambios para guardar', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/industry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar industria');
      }
      
      showToast('✅ Industria guardada correctamente', 'success');
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : 'Error al guardar la industria',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-5 bg-card-bg rounded-[20px] border border-white/5 hover:border-primary/20 transition-colors relative z-10">
      <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
        <Building2 size={14} className="text-primary" />
        Nicho / Industria
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <select 
            className="w-full appearance-none bg-white/5 border border-white/20 hover:border-primary/50 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-white-custom font-medium cursor-pointer"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="" className="bg-card-bg text-text-muted">-- Seleccionar industria --</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id} className="bg-card-bg text-white-custom py-2">{ind.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3.5 bg-primary text-background rounded-xl disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              <span>Guardar</span>
            </>
          )}
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-[11px] font-medium">
        {currentIndustry ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald-400">Actual: {industries.find(i => i.id === currentIndustry)?.name || currentIndustry}</span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-amber-400">Sin industria asignada</span>
          </>
        )}
      </div>
    </div>
  );
}
