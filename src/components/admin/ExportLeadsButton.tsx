"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';

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

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      if (leads.length === 0) {
        alert("No hay leads para exportar");
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
        new Date(lead.created_at).toLocaleString()
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
      
    } catch (error) {
      console.error("Error exporting leads:", error);
      alert("Error al exportar los leads");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={exportToCSV}
      disabled={isExporting || leads.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/20 transition-all text-sm font-medium disabled:opacity-50"
    >
      <Download size={16} />
      <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
    </button>
  );
}
