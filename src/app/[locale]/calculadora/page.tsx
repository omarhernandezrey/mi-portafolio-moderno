import React from 'react';
import { buildMetadata } from '@/lib/seo';
import BudgetCalculator from '@/components/calculator/BudgetCalculator';
import { Metadata } from 'next';
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
          title: 'Calculator: How Much Does a Website Cost? Colombia 2026',
          description: 'Calculate the cost of your website, app, or e-commerce store in 2 minutes. Real pricing for Colombia and the US in 2026, broken down by feature. No obligation.',
          path: '/calculadora',
          locale: 'en',
          ogSubtitle: 'Web Development Pricing Colombia 2026',
          keywords: [
            'website budget calculator colombia',
            'how much does a website cost colombia 2026',
            'web development pricing colombia',
            'web project estimate',
            'e-commerce cost calculator',
          ],
        }
      : {
          title: 'Calculadora: ¿Cuánto Cuesta una Página Web? Colombia 2026',
          description: 'Calcula el costo de tu sitio web, app o e-commerce en 2 minutos. Precios reales para Colombia y USA 2026, con desglose por funcionalidad. Sin compromiso.',
          path: '/calculadora',
          locale: 'es',
          ogSubtitle: 'Precios Desarrollo Web Colombia 2026',
          keywords: [
            'calculadora presupuesto sitio web colombia',
            'cuanto cuesta pagina web colombia 2026',
            'precio desarrollo web colombia',
            'estimado proyecto web',
            'cuanto vale una app colombia',
            'calculadora costo e-commerce',
          ],
        }
  );
}

export default async function CalculadoraPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const pageUrl = isEn ? `${BASE_URL}/en/calculadora` : `${BASE_URL}/calculadora`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "Inicio", "item": isEn ? `${BASE_URL}/en` : BASE_URL },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Budget Calculator" : "Calculadora de Presupuesto", "item": pageUrl },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": isEn ? "Budget Calculator — Web Development Colombia" : "Calculadora de Presupuesto — Desarrollo Web Colombia",
    "description": isEn
      ? "Free tool to calculate the cost of your website, app, or e-commerce store in Colombia and the US. Real estimate in 2 minutes."
      : "Herramienta gratuita para calcular el costo de tu sitio web, app o e-commerce en Colombia y USA. Estimado real en 2 minutos.",
    "url": pageUrl,
    "inLanguage": isEn ? "en" : "es",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "author": { "@id": `${BASE_URL}/#person` },
    "provider": { "@id": `${BASE_URL}/#organization` },
    "featureList": isEn
      ? [
          "Landing page estimate",
          "Corporate website estimate",
          "E-commerce estimate",
          "Web app estimate",
          "Feature-by-feature breakdown",
          "Prices in USD",
        ]
      : [
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
