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

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://omarhernandez.dev/#person",
        "name": "Omar Hernández Rey",
        "url": "https://omarhernandez.dev",
        "image": "https://omarhernandez.dev/profile.jpg",
        "jobTitle": "Full Stack Web Developer",
        "sameAs": [
          "https://linkedin.com/in/omarhernandez",
          "https://github.com/omarhernandez"
        ],
        "description": "Full Stack Developer specialized in React, Next.js and Node.js. / Desarrollador Full Stack especializado en React, Next.js y Node.js."
      },
      {
        "@type": "ProfessionalService",
        "name": "Omar Hernández Rey - Freelance Web Development",
        "image": "https://omarhernandez.dev/portfolio-preview.jpg",
        "@id": "https://omarhernandez.dev/#service",
        "url": "https://omarhernandez.dev",
        "telephone": "+573219052878",
        "priceRange": "$$$",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bogotá",
          "addressCountry": "CO"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 4.6097,
          "longitude": -74.0817
        },
        "description": "Professional web development services including landing pages, web applications, and technical SEO. / Servicios profesionales de desarrollo web incluyendo landing pages, aplicaciones web y SEO técnico."
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
      <ServicesSection />
      <ProjectsSection />
      <ContactForm />
      <Footer />
    </>
  );
}
