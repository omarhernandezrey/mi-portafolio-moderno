import React from 'react';
import { Activity, Briefcase, CalendarDays, LayoutGrid } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';

export const dynamic = 'force-dynamic';

export default function PortafolioDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Resumen"
        description={
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </span>
        }
        actions={
          <AdminButtonLink
            href="/admin/negocio"
            variant="primary"
            size="sm"
            icon={<Briefcase size={15} />}
          >
            Ir a Negocio
          </AdminButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminCard padding="normal">
          <EmptyState
            icon={<Activity size={22} />}
            title="Aún sin panel de métricas"
            description="Los commits, rachas y lenguajes de los repositorios ya se recopilan cada día. Esta vista los mostrará en cuanto esté lista la pantalla de gráficas."
          />
        </AdminCard>

        <AdminCard padding="normal">
          <EmptyState
            icon={<LayoutGrid size={22} />}
            title="Aún sin edición de contenido"
            description="Proyectos, habilidades, educación y el resto de secciones del sitio se gestionarán desde aquí."
          />
        </AdminCard>
      </div>
    </div>
  );
}
