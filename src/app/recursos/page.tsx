import { Metadata } from 'next';
import RecursosContent from '@/components/recursos/RecursosContent';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = 'https://omarhernandezrey.com';

export const metadata: Metadata = {
  title: 'Recursos Gratuitos para Proyectos Web — Checklist, Guía de Precios y Plantillas | Colombia',
  description: 'Descarga gratis: checklist de auditoría técnica para sitios web, guía de precios de desarrollo web en Colombia 2026 y plantilla de briefing. Para emprendedores y empresas en Colombia y USA.',
  alternates: { canonical: `${BASE_URL}/recursos` },
  keywords: [
    'recursos gratuitos desarrollo web colombia',
    'checklist auditoria web gratis',
    'guia precios desarrollo web colombia 2026',
    'plantilla briefing proyecto web',
    'herramientas emprendedores digitales',
    'checklist seo tecnico gratis',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: `${BASE_URL}/recursos`,
    title: 'Recursos Gratuitos — Checklist, Guía de Precios y Plantillas | Omar Hernández Rey',
    description: 'Descarga: checklist de auditoría web, guía de precios 2026 y plantilla de briefing. Gratis para emprendedores en Colombia y USA.',
    images: [{
      url: `${BASE_URL}/api/og?title=Recursos%20Gratuitos&subtitle=Herramientas%20para%20tu%20Proyecto%20Digital`,
      width: 1200,
      height: 630,
      alt: 'Recursos gratuitos para proyectos web — Omar Hernández Rey',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Gratuitos — Checklist, Guías y Plantillas | Omar Hernández Rey',
    description: 'Checklist auditoría web, guía de precios Colombia 2026 y plantilla de briefing. Descarga gratis.',
    images: [`${BASE_URL}/api/og?title=Recursos%20Gratuitos&subtitle=Herramientas%20para%20tu%20Proyecto%20Digital`],
  },
};

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
