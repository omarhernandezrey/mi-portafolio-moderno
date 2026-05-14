"use client";

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom transition-all"
    >
      <Printer size={14} />
      Exportar Dossier
    </button>
  );
}
