"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Lead {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  type?: string | null;
  service_requested?: string | null;
  budget?: string | null;
  timeline?: string | null;
  status?: string | null;
  created_at: string;
}

interface ExportLeadsButtonProps {
  leads: Lead[];
}

export default function ExportLeadsButton({ leads }: ExportLeadsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      if (leads.length === 0) {
        showToast('⚠️ No hay leads para exportar', 'warning');
        return;
      }

      // Definir cabeceras
      const headers = ["ID", "Nombre", "Email", "Teléfono", "Empresa", "Tipo", "Servicio", "Presupuesto", "Plazo", "Estado", "Fecha"];
      
      // Mapear datos
      const rows = leads.map(lead => [
        lead.id,
        lead.name || "",
        lead.email || "",
        lead.phone || "",
        lead.company || "",
        lead.type || "",
        lead.service_requested || "",
        lead.budget || "",
        lead.timeline || "",
        lead.status || "",
        new Date(lead.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      ]);

      // Unir todo en formato CSV (usando punto y coma para mejor compatibilidad con Excel en regiones latinas)
      const csvContent = [
        headers.join(";"),
        ...rows.map(e => e.map(val => `"${val}"`).join(";"))
      ].join("\n");

      // Crear el archivo y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `leads_omar_portafolio_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`✅ ${leads.length} leads exportados correctamente`, 'success');
      
    } catch (error) {
      console.error("Error exporting leads:", error);
      showToast('❌ Error al exportar los leads', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={exportToCSV}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all text-sm font-bold disabled:opacity-50"
    >
      <Download size={16} />
      <span>{isExporting ? 'Exportando...' : `Exportar CSV (${leads.length})`}</span>
    </button>
  );
}
