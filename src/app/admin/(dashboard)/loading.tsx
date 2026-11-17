import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import { Skeleton, SkeletonStatCard } from '@/components/admin/ui/Skeleton';

export default function CargandoResumen() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6 lg:space-y-8">
      <span className="sr-only">Cargando el resumen del portafolio…</span>
      <PageHeader overline="Portafolio" title="Resumen" description={<Skeleton shape="text" className="w-56" />} />

      <div className="space-y-5 lg:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonStatCard className="sm:col-span-2" />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard className="sm:col-span-2" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AdminCard padding="normal" className="lg:col-span-2">
            <Skeleton className="h-48 w-full" />
          </AdminCard>
          <AdminCard padding="normal" className="lg:col-span-2">
            <Skeleton className="h-32 w-full" />
          </AdminCard>
          <AdminCard padding="normal">
            <Skeleton className="h-40 w-full" />
          </AdminCard>
          <AdminCard padding="normal">
            <Skeleton className="h-40 w-full" />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
