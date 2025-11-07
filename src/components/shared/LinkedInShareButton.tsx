// components/shared/LinkedInShareButton.tsx
"use client";

import React, { useState } from "react";
import { FaLinkedin, FaShare, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useLinkedInShare } from "@/hooks/useLinkedInShare";

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
  const { shareToLinkedIn } = useLinkedInShare({ project });

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await shareToLinkedIn();
    } finally {
      setTimeout(() => setIsSharing(false), 3000);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
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
