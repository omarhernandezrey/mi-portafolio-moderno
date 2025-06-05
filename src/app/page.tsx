import React from "react";
import "./globals.css"; // Import global styles
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import EducationSection from "../components/sections/EducationSection";
import ServicesSection from "../components/sections/ServicesSection";
import SkillSection from "../components/sections/SkillSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import ContactForm from "../components/sections/ContactForm";
import Footer from "../components/shared/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <SkillSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactForm />
      <Footer />
    </>
  );
}
