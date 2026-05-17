import React from "react";
import "./globals.css"; // Import global styles
import { Metadata } from "next";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import TechMarquee from "../components/sections/TechMarquee";
import EducationSection from "../components/sections/EducationSection";
import ServicesSection from "../components/sections/ServicesSection";
import SkillSection from "../components/sections/SkillSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import ContactForm from "../components/sections/ContactForm";
import Footer from "../components/shared/Footer";
import { OMAR_PROFILE } from "@/data/omarProfile";

export const metadata: Metadata = {
  title: "Desarrollador Web Freelance Colombia | React & Next.js | Omar Hernández Rey",
  description: "Contratar desarrollador web freelance en Colombia. Creo webs, apps y chatbots con IA usando React y Next.js. Proyectos desde $500 USD. Clientes en Colombia y USA. Consulta gratis, respuesta en 24h.",
  alternates: {
    canonical: "https://omarhernandezrey.com",
  },
  keywords: [
    "contratar desarrollador web colombia",
    "programador freelance colombia",
    "desarrollador full stack colombia",
    "desarrollador web bogota",
    "full stack developer colombia",
    "react developer colombia",
    "next.js developer colombia",
    "hire developer colombia remote",
    "freelance web developer affordable",
    "software developer colombia",
    "ingeniero de software colombia",
    "desarrollador web profesional",
    "chatbot ia colombia",
    "aplicaciones web colombia",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://omarhernandezrey.com",
    siteName: "Omar Hernández Rey — Desarrollador Web Freelance Colombia",
    title: "Desarrollador Web Freelance Colombia | React & Next.js",
    description: "Contratar desarrollador web en Colombia. Webs, apps y chatbots IA. React, Next.js, Node.js. Proyectos desde $500 USD. Consulta gratis.",
    images: [
      {
        url: "https://omarhernandezrey.com/api/og?title=Desarrollador%20Web%20Freelance%20Colombia&subtitle=React%20%26%20Next.js%20%7C%20Desde%20%24500%20USD",
        secureUrl: "https://omarhernandezrey.com/api/og?title=Desarrollador%20Web%20Freelance%20Colombia&subtitle=React%20%26%20Next.js%20%7C%20Desde%20%24500%20USD",
        width: 1200,
        height: 630,
        alt: "Omar Hernández Rey — Desarrollador Web Freelance Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollador Web Freelance Colombia | Omar Hernández Rey",
    description: "Creo webs, apps y chatbots IA. Colombia y USA remote. React & Next.js. Proyectos desde $500 USD.",
    images: ["https://omarhernandezrey.com/api/og?title=Desarrollador%20Web%20Freelance%20Colombia&subtitle=React%20%26%20Next.js%20%7C%20Desde%20%24500%20USD"],
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "name": "Omar Hernández Rey — Desarrollador Web Freelance Colombia",
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
        "description": "Desarrollador Full Stack freelance en Colombia. React, Next.js, Node.js e IA. Proyectos desde $500 USD para Colombia y USA remoto.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutSection />
      <TechMarquee />
      <EducationSection />
      <SkillSection />
      <ProjectsSection />
      <ServicesSection />
      <ContactForm />
      <Footer />
    </>
  );
}
