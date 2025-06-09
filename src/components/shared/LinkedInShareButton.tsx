// components/shared/LinkedInShareButton.tsx
"use client";

import React, { useState } from "react";
import { FaLinkedin, FaShare, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  repository: string;
  demo: string;
  category: string;
}

interface LinkedInShareButtonProps {
  project: Project;
  className?: string;
}

const LinkedInShareButton: React.FC<LinkedInShareButtonProps> = ({
  project,
  className = "",
}) => {
  const [isSharing, setIsSharing] = useState(false);

  // Función para generar el texto del post de LinkedIn
  const generateLinkedInText = () => {
    const portfolioUrl = "https://omarh-portafolio-web.vercel.app";
    
    const linkedInText = `🚀 ¡Quiero compartir mi nuevo proyecto: "${project.title}"!

💼 🔍 DISPONIBLE PARA OPORTUNIDADES LABORALES COMO DESARROLLADOR WEB 🔍 💼

📋 ${project.description}

💻 Tecnologías utilizadas:
${project.technologies.map(tech => `• ${tech}`).join('\n')}

🔗 Enlaces:
• Demo en vivo: ${project.demo}
• Código fuente: ${project.repository}
• Mi portafolio: ${portfolioUrl}

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #WebDevelopment #${project.category.replace(/\s+/g, '')} #Programming #Frontend #Developer #Tech #Innovation #FullStack
${project.technologies.map(tech => `#${tech.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')}`;

    return linkedInText;
  };

  // Función para abrir LinkedIn con el post prellenado
  const shareToLinkedIn = () => {
    setIsSharing(true);
    
    const text = encodeURIComponent(generateLinkedInText());
    const portfolioUrl = "https://omarh-portafolio-web.vercel.app";
    
    // Usar URL simplificada que mantiene opciones de imagen
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}&text=${text}`;
    
    // Abrir en ventana centrada y más grande
    const popup = window.open(
      linkedInUrl,
      'linkedin-share',
      'width=700,height=600,scrollbars=yes,resizable=yes,left=' + 
      (window.screen.width / 2 - 350) + ',top=' + (window.screen.height / 2 - 300)
    );

    if (popup) {
      popup.focus();
    }

    // Detectar cuando se cierra la ventana
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        setIsSharing(false);
        clearInterval(checkClosed);
      }
    }, 1000);

    // Timeout de seguridad
    setTimeout(() => {
      setIsSharing(false);
      clearInterval(checkClosed);
    }, 10000);
  };

  return (
    <motion.button
      onClick={shareToLinkedIn}
      disabled={isSharing}
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: isSharing 
          ? 'rgba(10, 102, 194, 0.1)' 
          : 'rgba(10, 102, 194, 0.05)',
        color: '#0a66c2',
        border: '1px solid rgba(10, 102, 194, 0.2)',
      }}
      whileHover={{
        scale: 1.02,
        backgroundColor: 'rgba(10, 102, 194, 0.1)',
        boxShadow: '0 4px 15px rgba(10, 102, 194, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Compartir ${project.title} en LinkedIn`}
      title="Compartir proyecto en LinkedIn con modal completo"
    >
      {/* Icono animado */}
      <motion.div
        animate={{
          rotate: isSharing ? 360 : 0,
          scale: isSharing ? 1.1 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        {isSharing ? (
          <FaShare size={16} />
        ) : (
          <FaLinkedin size={16} />
        )}
      </motion.div>

      {/* Texto del botón */}
      <span className="group-hover:text-[#0a66c2] transition-colors duration-300">
        {isSharing ? 'Compartiendo...' : 'Compartir en LinkedIn'}
      </span>

      {/* Icono de enlace externo */}
      <motion.div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <FaExternalLinkAlt size={10} />
      </motion.div>

      {/* Efecto de brillo al hover */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(10, 102, 194, 0.1), transparent)',
          opacity: 0,
        }}
        whileHover={{
          opacity: [0, 1, 0],
          x: [-100, 100],
        }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default LinkedInShareButton;