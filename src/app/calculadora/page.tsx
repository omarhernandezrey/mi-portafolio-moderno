import React from 'react';
import BudgetCalculator from '@/components/calculator/BudgetCalculator';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const BASE_URL = 'https://omarhernandezrey.com';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuesto Web — ¿Cuánto cuesta mi sitio web? | Colombia 2026',
  description: 'Calcula el costo de tu sitio web, app o e-commerce en 2 minutos. Precios reales para Colombia y USA. Desglose por funcionalidad, sin compromiso. Desarrollador freelance disponible.',
  alternates: {
    canonical: `${BASE_URL}/calculadora`,
  },
  keywords: [
    'calculadora presupuesto sitio web colombia',
    'cuanto cuesta pagina web colombia 2026',
    'precio desarrollo web colombia',
    'estimado proyecto web',
    'cuanto vale una app colombia',
    'calculadora costo e-commerce',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: `${BASE_URL}/calculadora`,
    title: 'Calculadora de Presupuesto — ¿Cuánto cuesta mi sitio web en Colombia?',
    description: 'Obtén un estimado real de tu proyecto en 2 minutos. Landing pages, e-commerce, apps. Precios Colombia y USA 2026.',
    images: [{
      url: `${BASE_URL}/api/og?title=Calculadora%20de%20Presupuesto&subtitle=Precios%20Desarrollo%20Web%20Colombia%202026`,
      width: 1200,
      height: 630,
      alt: 'Calculadora de presupuesto desarrollo web Colombia',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuánto cuesta mi sitio web? Calculadora Colombia 2026',
    description: 'Estimado real en 2 minutos. Landing pages, e-commerce, apps web. Gratis.',
    images: [`${BASE_URL}/api/og?title=Calculadora%20de%20Presupuesto&subtitle=Precios%20Desarrollo%20Web%20Colombia%202026`],
  },
};

export default function CalculadoraPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Calculadora de Presupuesto", "item": `${BASE_URL}/calculadora` },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Calculadora de Presupuesto — Desarrollo Web Colombia",
    "description": "Herramienta gratuita para calcular el costo de tu sitio web, app o e-commerce en Colombia y USA. Estimado real en 2 minutos.",
    "url": `${BASE_URL}/calculadora`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "author": { "@id": `${BASE_URL}/#person` },
    "provider": { "@id": `${BASE_URL}/#organization` },
    "featureList": [
      "Estimado de landing pages",
      "Estimado de sitios corporativos",
      "Estimado de e-commerce",
      "Estimado de apps web",
      "Desglose por funcionalidad",
      "Precios en COP y USD",
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--background-color)] pt-24 pb-12">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webAppSchema} />
      <BudgetCalculator />
    </main>
  );
}
