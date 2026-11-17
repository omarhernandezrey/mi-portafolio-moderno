import PageHeader from '@/components/admin/ui/PageHeader';
import { Skeleton } from '@/components/admin/ui/Skeleton';

export default function CargandoLeads() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5 lg:space-y-6">
      <span className="sr-only">Cargando leads…</span>
      <PageHeader overline="CRM Pipeline" title="Leads" description="Administración y seguimiento de oportunidades comerciales." />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
