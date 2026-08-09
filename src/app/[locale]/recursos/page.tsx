import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import RecursosContent from '@/components/recursos/RecursosContent';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = 'https://omarhernandezrey.com';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'Free Resources: Web Checklist & Pricing Guide 2026',
          description: 'Free download: technical web audit checklist, web development pricing guide for Colombia 2026, and a project briefing template.',
          path: '/recursos',
          locale: 'en',
          ogSubtitle: 'Tools for Your Digital Project',
          keywords: [
            'free web development resources colombia',
            'free web audit checklist',
            'web development pricing guide colombia 2026',
            'project briefing template',
            'digital entrepreneur tools',
          ],
        }
      : {
          title: 'Recursos Gratis: Checklist Web y Guía de Precios 2026',
          description: 'Descarga gratis: checklist de auditoría técnica web, guía de precios de desarrollo web en Colombia 2026 y plantilla de briefing para tu proyecto.',
          path: '/recursos',
          locale: 'es',
          ogSubtitle: 'Herramientas para tu Proyecto Digital',
          keywords: [
            'recursos gratuitos desarrollo web colombia',
            'checklist auditoria web gratis',
            'guia precios desarrollo web colombia 2026',
            'plantilla briefing proyecto web',
            'herramientas emprendedores digitales',
            'checklist seo tecnico gratis',
          ],
        }
  );
}

export default async function RecursosPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const pageUrl = isEn ? `${BASE_URL}/en/recursos` : `${BASE_URL}/recursos`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "Inicio", "item": isEn ? `${BASE_URL}/en` : BASE_URL },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Free Resources" : "Recursos Gratuitos", "item": pageUrl },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    "name": isEn ? "Free Resources for Web Projects" : "Recursos Gratuitos para Proyectos Web",
    "description": isEn
      ? "A collection of free tools for entrepreneurs and companies looking to launch or improve their digital presence."
      : "Colección de herramientas gratuitas para emprendedores y empresas que quieren lanzar o mejorar su presencia digital.",
    "url": pageUrl,
    "inLanguage": isEn ? "en" : "es",
    "author": { "@id": `${BASE_URL}/#person` },
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "hasPart": isEn
      ? [
          {
            "@type": "DigitalDocument",
            "name": "Technical Audit Checklist for Websites",
            "description": "A complete list to audit the performance, SEO, and security of any website.",
            "isAccessibleForFree": true,
          },
          {
            "@type": "DigitalDocument",
            "name": "Web Development Pricing Guide Colombia 2026",
            "description": "Updated pricing reference for web development projects in Colombia.",
            "isAccessibleForFree": true,
          },
          {
            "@type": "DigitalDocument",
            "name": "Web Project Briefing Template",
            "description": "A template to define the scope and requirements of your digital project.",
            "isAccessibleForFree": true,
          },
        ]
      : [
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
