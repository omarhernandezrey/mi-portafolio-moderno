"use client";

import React, { useState } from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IndustrySelectorProps {
  leadId: string;
  currentIndustry?: string;
}

export default function IndustrySelector({ leadId, currentIndustry }: IndustrySelectorProps) {
  const [industry, setIndustry] = useState(currentIndustry || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const industries = [
    { id: 'startup', name: 'Startup / MVP' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'landing', name: 'Landing Page' },
    { id: 'automation', name: 'Automatización / Dashboard' },
    { id: 'clinica-dental', name: 'Salud / Servicios Profesionales' },
    { id: 'General', name: 'General / Otro' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Usamos el API route para actualizar si no queremos exponer supabase client
      const res = await fetch(`/api/admin/leads/${leadId}/industry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      });

      if (!res.ok) throw new Error('Error al actualizar industria');
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la industria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-[var(--background-color)] rounded-xl border border-[var(--primary-color)]/20">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted-color)] uppercase tracking-widest">
        <Building2 size={14} />
        Nicho / Industria
      </div>
      
      <div className="flex gap-2">
        <select 
          className="flex-1 bg-[var(--card-bg-color)] border border-[var(--primary-color)]/10 rounded-lg p-2 text-sm outline-none focus:border-[var(--primary-color)]"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">Seleccionar nicho...</option>
          {industries.map((ind) => (
            <option key={ind.id} value={ind.id}>{ind.name}</option>
          ))}
        </select>
        
        <button 
          onClick={handleSave}
          disabled={loading || !industry || industry === currentIndustry}
          className="p-2 bg-[var(--primary-color)] text-white rounded-lg disabled:opacity-50 hover:brightness-110 transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        </button>
      </div>
    </div>
  );
}
