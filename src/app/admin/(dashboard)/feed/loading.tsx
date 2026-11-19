import PageHeader from '@/components/admin/ui/PageHeader';
import { Skeleton } from '@/components/admin/ui/Skeleton';

export default function CargandoFeed() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6 sm:space-y-10">
      <span className="sr-only">Cargando publicaciones del feed…</span>
      <PageHeader overline="Feed Público" title="Comunidad" description="Moderación de publicaciones del feed de comunidad." />
      <Skeleton className="h-11 w-full max-w-xl rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
