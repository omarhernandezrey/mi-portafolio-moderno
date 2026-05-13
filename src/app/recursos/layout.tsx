import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recursos y Guías Gratuitas | Omar Hernández Rey',
  description: 'Guías gratuitas: cómo contratar un desarrollador, precios reales 2026, checklist de proyecto digital. Descarga sin costo.',
  alternates: {
    canonical: 'https://omarhernandezrey.com/recursos',
  },
};

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
