import React from 'react';
import { Activity, Briefcase, CalendarDays, FolderKanban, LayoutGrid } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function contarProyectos(): Promise<number | null> {
  const { count, error } = await supabaseServer
    .from('portfolio_projects')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`[admin/portafolio] portfolio_projects: ${error.message}`);
    return null;
  }
  return count ?? 0;
}

export default async function PortafolioDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
  const totalProyectos = await contarProyectos();

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

        <AdminCard padding="normal" className="flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-admin-ink">Proyectos</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-text-muted">
                {totalProyectos === null
                  ? 'Crea, edita, publica y reordena los proyectos del visor desde aquí.'
                  : `${totalProyectos} proyecto${totalProyectos === 1 ? '' : 's'}: crea, edita, publica y reordena los que alimentan el visor.`}
              </p>
            </div>
          </div>
          <AdminButtonLink href="/admin/proyectos" size="sm" className="self-start">
            Gestionar proyectos
          </AdminButtonLink>
        </AdminCard>

        <AdminCard padding="normal" className="lg:col-span-2">
          <EmptyState
            icon={<LayoutGrid size={22} />}
            title="El resto del contenido aún no se edita desde aquí"
            description="Habilidades, educación, servicios y tecnologías se irán sumando a esta área con el mismo patrón que ya usan los proyectos."
          />
        </AdminCard>
      </div>
    </div>
  );
}
