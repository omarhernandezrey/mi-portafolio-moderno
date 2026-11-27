import React from "react";
import { draftMode } from "next/headers";
import { buildMetadata, withBrand } from '@/lib/seo';
import { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import TechMarquee from "@/components/sections/TechMarquee";
import EducationSection from "@/components/sections/EducationSection";
import ServicesSection from "@/components/sections/ServicesSection";
import SkillSection from "@/components/sections/SkillSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/shared/Footer";
import PreviewBanner from "@/components/preview/PreviewBanner";
import { OMAR_PROFILE } from "@/data/omarProfile";
import { getProjects } from "@/lib/portfolio/repository";
import { PRECIO_DESDE_PROYECTO_COP, PRECIO_DESDE_PROYECTO_USD } from "@/data/precios";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: withBrand("Full Stack Web Developer Colombia"),
          description: `Hire a full stack web developer in Colombia. Custom websites and apps in React and Next.js from ${PRECIO_DESDE_PROYECTO_USD}. Free consultation, 24h response.`,
          path: "",
          locale: 'en',
          ogSubtitle: `React & Next.js | From ${PRECIO_DESDE_PROYECTO_USD}`,
          keywords: [
            "hire web developer colombia",
            "full stack developer colombia",
            "web developer bogota",
            "react developer colombia",
            "next.js developer colombia",
            "hire developer colombia remote",
            "affordable full stack web developer",
            "software developer colombia",
          ],
        }
      : {
          title: withBrand("Desarrollador Web Full Stack Colombia"),
          description: `Contrata un desarrollador web full stack en Colombia. Webs y aplicaciones a medida en React y Next.js desde ${PRECIO_DESDE_PROYECTO_COP}. Consulta gratis, respuesta en 24h.`,
          path: "",
          locale: 'es',
          ogSubtitle: `React & Next.js | Desde ${PRECIO_DESDE_PROYECTO_COP}`,
          keywords: [
            "contratar desarrollador web colombia",
            "desarrollador full stack colombia",
            "desarrollador web bogota",
            "full stack developer colombia",
            "react developer colombia",
            "next.js developer colombia",
            "hire developer colombia remote",
            "desarrollador web full stack asequible",
            "software developer colombia",
            "ingeniero de software colombia",
            "desarrollador web profesional",
            "aplicaciones web colombia",
          ],
        }
  );
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const { isEnabled: vistaPrevia } = await draftMode();
  // Import dinámico a propósito: `preview.ts` carga `supabaseServer`, que
  // lanza si faltan las variables de Supabase (ver su propio archivo). Un
  // `import` estático arriba del todo metería ese riesgo en CADA visita a
  // la home, aunque la vista previa nunca se use — con `await import(...)`
  // ese módulo solo se carga cuando el modo borrador está de verdad activo.
  const proyectos = vistaPrevia
    ? await import('@/lib/portfolio/preview').then((m) => m.leerProyectosConBorradores())
    : await getProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "name": "Omar Hernández Rey — Desarrollador Web Full Stack Colombia",
        "image": OMAR_PROFILE.image,
        "@id": "https://omarhernandezrey.com/#service",
        "url": OMAR_PROFILE.url,
        "telephone": OMAR_PROFILE.telephone,
        "priceRange": "$$-$$$",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": OMAR_PROFILE.addressLocality,
          "addressCountry": OMAR_PROFILE.addressCountry
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 4.6097,
          "longitude": -74.0817
        },
        "description": `Desarrollador Full Stack en Colombia. React, Next.js, Node.js e IA. Proyectos desde ${PRECIO_DESDE_PROYECTO_COP}, remoto para USA y LATAM.`,
        "provider": {
          "@type": "Person",
          "@id": "https://omarhernandezrey.com/#person"
        },
        "areaServed": ["CO", "US", "MX", "AR", "CL", "PE"]
      }
    ]
  };

  return (
    <>
      {vistaPrevia && <PreviewBanner volverA={`/${locale}`} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutSection />
      <TechMarquee />
      <EducationSection />
      <SkillSection />
      <ProjectsSection projects={proyectos} />
      <ServicesSection />
      <ContactForm />
      <Footer />
    </>
  );
}
