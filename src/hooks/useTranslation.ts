"use client";

import { useI18n } from "@/contexts/I18nContext";

/**
 * Hook personalizado que maneja las traducciones con fallbacks seguros para SSR
 * Evita errores de hidratación proporcionando valores por defecto en español
 */
export const useTranslation = () => {
  const { t, isHydrated, language } = useI18n();

  // Diccionario de fallbacks en español para evitar hidratación mismatch
  const fallbacks: Record<string, string> = {
    // Navigation
    "navigation.home": "Inicio",
    "navigation.about": "Sobre mí",
    "navigation.projects": "Proyectos",
    "navigation.services": "Servicios",
    "navigation.skills": "Habilidades",
    "navigation.education": "Educación",
    "navigation.contact": "Contacto",

    // Hero
    "hero.greeting": "¡Hola Soy",
    "hero.name": "Omar Hernández Rey",
    "hero.title": "Desarrollador Web Full Stack",
    "hero.description": "Combino {creativity}, {innovation} y {technology} para crear experiencias web {unforgettable}.",
    "hero.creativity": "creatividad",
    "hero.innovation": "innovación",
    "hero.technology": "tecnología",
    "hero.unforgettable": "inolvidables",
    "hero.viewProjects": "Ver Proyectos",
    "hero.ariaLabel": "Ver mis proyectos",

    // About
    "about.badge": "Conóceme",
    "about.title": "Sobre mí",
    "about.description": "¡Hola! Soy {name}, un {role} con experiencia tanto en {frontend} como en {backend}. Estoy a punto de graduarme en {degree} del {university} y continuo aprendiendo con cursos de {platform} sobre tecnologías web, DevOps y más.",
    "about.name": "Omar Hernández Rey",
    "about.role": "Desarrollador Web Full Stack",
    "about.frontend": "Front-End",
    "about.backend": "Back-End",
    "about.degree": "Ingeniería de Software",
    "about.university": "Politécnico Grancolombiano",
    "about.platform": "Platzi",
    "about.downloadCV": "Download CV",
    "about.interests.badge": "Pasiones",
    "about.interests.title": "Mis Intereses",
    "about.personalData.name": "Nombre",
    "about.personalData.birthDate": "Fecha de Nacimiento",
    "about.personalData.address": "Dirección",
    "about.personalData.phone": "Teléfono",
    "about.personalInfo.fullName": "Omar Hernández Rey",
    "about.personalInfo.birth": "14 de febrero de 1990",
    "about.personalInfo.location": "Carrera 2N #39D-16 Sur, Bogotá",
    "about.personalInfo.phoneNumber": "(+57) 3219058278",

    // Services
    "services.badge": "Lo que Ofrezco",
    "services.title": "Mis Servicios",
    "services.subtitle": "Lo que puedo hacer por ti",
    "services.description": "Soluciones integrales diseñadas para dar vida a tu visión digital con tecnología de vanguardia y mejores prácticas",
    "services.cta": "Trabajemos Juntos",

    // Skills
    "skills.badge": "Excelencia Técnica",
    "skills.title": "Habilidades Principales",
    "skills.subtitle": "Tecnologías con las que trabajo",
    "skills.description": "Dominando el ecosistema de desarrollo moderno para crear experiencias digitales excepcionales",
    "skills.viewAll": "Todas las Habilidades",
    "skills.allSkills": "Todas las Habilidades",

    // Education
    "education.title": "Educación",
    "education.subtitle": "Mi formación académica y profesional",
    "education.badge": "Educación",
    "education.headerTitle": "Mi Trayectoria Académica",
    "education.loadMore": "Cargar Más",
    "education.loading": "Cargando más...",
    "education.certificate": "Certificado",
    "education.shareLinkedIn": "Compartir en LinkedIn",
    "education.sharing": "Compartiendo...",
    "education.close": "Cerrar",

    // Contact
    "contact.badge": "Conectemos",
    "contact.title": "Contáctame",
    "contact.subtitle": "Hablemos sobre tu próximo proyecto",
    "contact.description": "¿Listo para dar vida a tus ideas? Conversemos sobre tu próximo proyecto desde Bogotá, Colombia",
    "contact.form.name": "Tu Nombre",
    "contact.form.email": "Tu Correo Electrónico",
    "contact.form.message": "Cuéntame sobre tu proyecto...",
    "contact.form.send": "Enviar Mensaje",
    "contact.form.sending": "Enviando...",
    "contact.form.success": "¡Mensaje enviado exitosamente!",
    "contact.form.error": "Error al enviar el mensaje. Inténtalo de nuevo.",

    // Projects
    "projects.badge": "Proyectos Destacados",
    "projects.title": "Mis Proyectos",
    "projects.subtitle": "Algunos de mis trabajos recientes",
    "projects.description": "Explora mi colección de aplicaciones web y proyectos de desarrollo",
    "projects.searchPlaceholder": "Buscar proyectos...",
    "projects.showingResults": "Mostrando {count} de {total} proyectos",
    "projects.searchResults": "para \"{searchTerm}\"",
    "projects.noResults": "No se encontraron proyectos",
    "projects.noResultsDescription": "Intenta ajustar tu búsqueda o los filtros.",
    "projects.clearFilters": "Limpiar filtros",
    "projects.viewProject": "Ver Proyecto",
    "projects.viewCode": "Ver Código",
    "projects.technologies": "Tecnologías",

    // Footer
    "footer.rights": "Todos los derechos reservados.",
    "footer.madeWith": "Hecho con",
    "footer.in": "en",
    "footer.location": "Bogotá, Colombia",
    "footer.name": "Omar Hernández Rey",
    "footer.description": "Desarrollador Web Full Stack apasionado por crear experiencias digitales innovadoras y funcionales.",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.tryAgain": "Intentar de nuevo",
    "common.close": "Cerrar",
  };

  /**
   * Función de traducción mejorada que maneja hidratación e interpolación
   * @param key - Clave de traducción
   * @param options - Opciones adicionales para interpolación
   * @returns Texto traducido o fallback con interpolación
   */
  const tr = (key: string, options?: Record<string, unknown>): string => {
    try {
      // Si no está hidratado, usar fallback con interpolación manual
      if (!isHydrated) {
        let text = fallbacks[key] || key;
        
        // Aplicar interpolación manual si hay opciones
        if (options) {
          Object.entries(options).forEach(([placeholder, value]) => {
            const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
            text = text.replace(regex, String(value));
          });
        }
        
        return text;
      }

      // Si está hidratado, usar traducción normal
      return t(key, options);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      
      // En caso de error, usar fallback con interpolación manual
      let text = fallbacks[key] || key;
      if (options) {
        Object.entries(options).forEach(([placeholder, value]) => {
          const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
          text = text.replace(regex, String(value));
        });
      }
      
      return text;
    }
  };

  return {
    t: tr,
    isHydrated,
    language,
    isReady: isHydrated,
  };
};