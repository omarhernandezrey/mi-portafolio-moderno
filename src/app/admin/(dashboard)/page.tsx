import React from 'react';
import { Activity, Briefcase, CalendarDays, FolderKanban, Gauge, LayoutGrid } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function contarFilas(tabla: string): Promise<number | null> {
  const { count, error } = await supabaseServer.from(tabla).select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`[admin/portafolio] ${tabla}: ${error.message}`);
    return null;
  }
  return count ?? 0;
}

/**
 * Módulos de contenido que ya tienen su propia pantalla de edición
 * (T-09 en adelante). Cada uno se lista aquí con su tabla real, no con una
 * cifra inventada; el resto del contenido sigue en el `EmptyState` de abajo
 * hasta que tenga su propia tarea.
 */
const MODULOS_LISTOS = [
  { tabla: 'portfolio_projects', icon: FolderKanban, nombre: 'Proyectos', nombrePlural: 'proyectos', href: '/admin/proyectos', accion: 'Gestionar proyectos' },
  { tabla: 'portfolio_skills', icon: Gauge, nombre: 'Skills', nombrePlural: 'skills', href: '/admin/skills', accion: 'Gestionar skills' },
] as const;

export default async function PortafolioDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
  const conteos = await Promise.all(MODULOS_LISTOS.map((m) => contarFilas(m.tabla)));

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

        {MODULOS_LISTOS.map((modulo, i) => {
          const total = conteos[i];
          const Icon = modulo.icon;
          return (
            <AdminCard key={modulo.tabla} padding="normal" className="flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-admin-ink">{modulo.nombre}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-text-muted">
                    {total === null
                      ? `Crea, edita, publica y reordena ${modulo.nombrePlural} desde aquí.`
                      : `${total} ${modulo.nombrePlural}: crea, edita, publica y reordena.`}
                  </p>
                </div>
              </div>
              <AdminButtonLink href={modulo.href} size="sm" className="self-start">
                {modulo.accion}
              </AdminButtonLink>
            </AdminCard>
          );
        })}

        <AdminCard padding="normal">
          <EmptyState
            icon={<LayoutGrid size={22} />}
            title="El resto del contenido aún no se edita desde aquí"
            description="Educación, servicios y tecnologías se irán sumando a esta área con el mismo patrón que ya usan proyectos y skills."
          />
        </AdminCard>
      </div>
    </div>
  );
}
