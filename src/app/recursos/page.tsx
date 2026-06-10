import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import RecursosContent from '@/components/recursos/RecursosContent';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = 'https://omarhernandezrey.com';

export const metadata: Metadata = buildMetadata({
  title: 'Recursos Gratis: Checklist Web y Guía de Precios 2026',
  description: 'Descarga gratis: checklist de auditoría técnica web, guía de precios de desarrollo web en Colombia 2026 y plantilla de briefing para tu proyecto.',
  path: '/recursos',
  ogSubtitle: 'Herramientas para tu Proyecto Digital',
  keywords: [
    'recursos gratuitos desarrollo web colombia',
    'checklist auditoria web gratis',
    'guia precios desarrollo web colombia 2026',
    'plantilla briefing proyecto web',
    'herramientas emprendedores digitales',
    'checklist seo tecnico gratis',
  ],
});

export default function RecursosPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Recursos Gratuitos", "item": `${BASE_URL}/recursos` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/recursos`,
    "name": "Recursos Gratuitos para Proyectos Web",
    "description": "Colección de herramientas gratuitas para emprendedores y empresas que quieren lanzar o mejorar su presencia digital.",
    "url": `${BASE_URL}/recursos`,
    "author": { "@id": `${BASE_URL}/#person` },
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "hasPart": [
      {
        "@type": "DigitalDocument",
        "name": "Checklist de Auditoría Técnica para Sitios Web",
        "description": "Lista completa para auditar el rendimiento, SEO y seguridad de cualquier sitio web.",
        "isAccessibleForFree": true,
      },
      {
        "@type": "DigitalDocument",
        "name": "Guía de Precios de Desarrollo Web Colombia 2026",
        "description": "Referencia de precios actualizados para proyectos de desarrollo web en Colombia.",
        "isAccessibleForFree": true,
      },
      {
        "@type": "DigitalDocument",
        "name": "Plantilla de Briefing para Proyectos Web",
        "description": "Template para definir el alcance y requerimientos de tu proyecto digital.",
        "isAccessibleForFree": true,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <RecursosContent />
    </>
  );
}
