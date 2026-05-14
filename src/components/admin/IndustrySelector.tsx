"use client";

import React, { useState } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
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
    // Validación: debe seleccionar una industria
    if (!industry) {
      showToast('⚠️ Debes seleccionar una industria antes de guardar', 'warning');
      return;
    }

    // Validación: no guardar si no hay cambios
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

  // Determinar si el botón debe estar deshabilitado
  const isSaveDisabled = loading;

  return (
    <div className="space-y-4 p-4 bg-card-bg rounded-[20px] border border-white/5 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
        <Building2 size={14} className="text-primary" />
        Nicho / Industria
      </div>
      
      <div className="flex gap-2">
        <select 
          className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors text-white-custom"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="" className="bg-card-bg">Seleccionar nicho...</option>
          {industries.map((ind) => (
            <option key={ind.id} value={ind.id} className="bg-card-bg">{ind.name}</option>
          ))}
        </select>
        
        <button 
          onClick={handleSave}
          disabled={isSaveDisabled}
          className="px-4 py-3 bg-primary text-background rounded-xl disabled:opacity-50 hover:brightness-110 transition-all flex items-center gap-2 text-sm font-bold"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              <span className="hidden sm:inline">Guardar</span>
            </>
          )}
        </button>
      </div>
      
      {/* Indicador de estado */}
      <div className="flex items-center gap-2 text-[10px] text-text-muted/60">
        {currentIndustry ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Actualmente: {industries.find(i => i.id === currentIndustry)?.name || currentIndustry}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Sin industria asignada
          </>
        )}
      </div>
    </div>
  );
}
