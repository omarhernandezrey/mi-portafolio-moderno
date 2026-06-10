import React from "react";
import { buildMetadata } from '@/lib/seo';
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

export const metadata: Metadata = buildMetadata({
  title: "Desarrollador Web Freelance Colombia | React y Next.js",
  description: "Contrata un desarrollador web freelance en Colombia. Webs, apps y chatbots con IA en React y Next.js desde $500 USD. Consulta gratis, respuesta en 24h.",
  path: "",
  ogSubtitle: "React & Next.js | Desde $500 USD",
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
});

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
