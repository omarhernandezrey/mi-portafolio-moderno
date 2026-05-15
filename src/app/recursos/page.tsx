import { Metadata } from 'next';
import RecursosContent from '@/components/recursos/RecursosContent';

export const metadata: Metadata = {
  title: 'Recursos Gratuitos para tu Proyecto Digital | Omar Hernández Rey',
  description: 'Descarga gratis: checklist técnico de auditoría, guía de precios 2026 y plantilla de briefing para proyectos web. Herramientas para emprendedores y empresas en Colombia y USA.',
  alternates: {
    canonical: 'https://omarhernandezrey.com/recursos',
  },
  openGraph: {
    title: 'Recursos Gratuitos — Omar Hernández Rey',
    description: 'Checklist de auditoría técnica, guía de precios 2026 y plantilla de briefing. Descarga gratis.',
    url: 'https://omarhernandezrey.com/recursos',
    images: [
      {
        url: 'https://omarhernandezrey.com/api/og?title=Recursos+Gratuitos&subtitle=Herramientas+para+tu+Proyecto+Digital',
        width: 1200,
        height: 630,
        alt: 'Recursos gratuitos — Omar Hernández Rey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Gratuitos — Omar Hernández Rey',
    description: 'Checklist de auditoría técnica, guía de precios 2026 y plantilla de briefing. Descarga gratis.',
    images: ['https://omarhernandezrey.com/api/og?title=Recursos+Gratuitos&subtitle=Herramientas+para+tu+Proyecto+Digital'],
  },
};

export default function RecursosPage() {
  return <RecursosContent />;
}
