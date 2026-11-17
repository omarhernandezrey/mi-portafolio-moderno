import PageHeader from '@/components/admin/ui/PageHeader';
import { Skeleton, SkeletonStatCard } from '@/components/admin/ui/Skeleton';

export default function CargandoTickets() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5 lg:space-y-6">
      <span className="sr-only">Cargando tickets…</span>
      <PageHeader overline="Soporte Técnico" title="Tickets" description="Seguimiento de incidencias y soporte al cliente." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
