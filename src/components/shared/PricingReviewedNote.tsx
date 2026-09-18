import { PRICING_LAST_REVIEWED } from '@/data/pricing-sources';

/** Línea discreta de trazabilidad para páginas de servicios y la calculadora. */
export default function PricingReviewedNote({ isEn }: { isEn: boolean }) {
  const label = new Intl.DateTimeFormat(isEn ? 'en' : 'es', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${PRICING_LAST_REVIEWED}-01T00:00:00`));

  return (
    <p className="text-center text-[10px] text-text-muted/40 font-medium py-6">
      {isEn ? `Reference pricing last updated ${label}.` : `Precios de referencia actualizados a ${label}.`}
    </p>
  );
}
