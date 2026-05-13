import React from "react";
import "./globals.css"; // Import global styles
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

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "name": "Omar Hernández Rey — Desarrollo Web & IA Freelance",
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
        "description": "Desarrollador Full Stack freelance especializado en React, Next.js, Node.js e IA. Disponible para proyectos en Colombia y remotos para USA.",
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
