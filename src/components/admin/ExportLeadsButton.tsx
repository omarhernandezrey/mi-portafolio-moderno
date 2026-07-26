"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useAdminToast } from '@/hooks/useAdminToast';
import type { Lead } from '@/lib/admin/types';

interface ExportLeadsButtonProps {
  leads: Lead[];
}

export default function ExportLeadsButton({ leads }: ExportLeadsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const toast = useAdminToast();

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      if (leads.length === 0) {
        toast.warning('No hay leads para exportar');
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
      
      toast.success(`${leads.length} leads exportados correctamente`);
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error('Error al exportar los leads');
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
