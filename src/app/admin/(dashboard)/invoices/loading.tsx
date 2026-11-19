import PageHeader from '@/components/admin/ui/PageHeader';
import { Skeleton, SkeletonStatCard } from '@/components/admin/ui/Skeleton';

export default function CargandoFacturas() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5 lg:space-y-6">
      <span className="sr-only">Cargando facturas…</span>
      <PageHeader overline="Finanzas" title="Facturación" description="Gestión de facturas, cobros y documentos." />
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
