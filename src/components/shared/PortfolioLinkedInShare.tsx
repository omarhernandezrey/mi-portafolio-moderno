// src/components/PortfolioLinkedInShare.tsx
// -----------------------------------------------------
// * Botón mejorado para compartir el portafolio completo en LinkedIn *
// -----------------------------------------------------

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLinkedInShare } from '../../hooks/useLinkedInShare';

// Tipado de cada proyecto del portafolio
interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  repository: string;
  demo: string;
  category: string;
}

// Tipado de las props del componente
interface PortfolioLinkedInShareProps {
  projects?: ProjectData[]; // Hacemos projects opcional
  className?: string;
  portfolioUrl?: string;
  authorName?: string;
}

// Componente principal
const PortfolioLinkedInShare: React.FC<PortfolioLinkedInShareProps> = ({
  projects = [], // Valor por defecto
  className = '',
  portfolioUrl = 'https://omarh-portafolio-web.vercel.app',
  authorName = 'Omar Hernández'
}) => {
  // Estados para mostrar feedback visual
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isStableOpen, setIsStableOpen] = useState(false); // Estado adicional para estabilidad
  
  // Ref para el contenedor del menú
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Efecto para estabilizar el estado del menú
  useEffect(() => {
    if (showOptions) {
      // Delay para asegurar que el menú se mantenga abierto
      setIsStableOpen(true);
      
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Establecer un timeout mínimo para que el menú permanezca visible
      timeoutRef.current = setTimeout(() => {
        setIsStableOpen(true); // Mantenerlo estable
      }, 300); // 300ms de estabilidad mínima
    } else {
      // Delay antes de cerrar para evitar cierres accidentales
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsStableOpen(false);
      }, 100); // 100ms de delay antes de cerrar
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showOptions]);

  // Efecto para manejar clics fuera del menú (con delay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Delay antes de cerrar para evitar cierres inmediatos
        setTimeout(() => {
          setShowOptions(false);
        }, 150);
      }
    };

    // Solo agregar el listener si el menú está abierto Y estable
    if (showOptions && isStableOpen) {
      // Delay antes de activar el listener
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 200); // 200ms antes de activar el listener

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showOptions, isStableOpen]);

  // Construye el "proyecto" genérico del portafolio completo (memoizado)
  const portfolioProject: ProjectData = useMemo(() => {
    // Validación para evitar errores si projects es undefined o null
    const validProjects = projects || [];
    const projectCount = validProjects.length;
    const allTechnologies = validProjects.length > 0 
      ? [...new Set(validProjects.flatMap(p => p.technologies || []))]
      : ['React', 'TypeScript', 'Next.js']; // Tecnologías por defecto

    return {
    title: `Portafolio de ${authorName}`,
      description: projectCount > 0 
        ? `Explora mi colección completa de ${projectCount} proyectos de desarrollo web y aplicaciones.`
        : `Explora mi portafolio de desarrollo web y aplicaciones.`,
      technologies: allTechnologies,
    repository: 'https://github.com/omarhernandezrey/mi-portafolio-moderno',
    demo: portfolioUrl,
    category: 'Portfolio'
  };
  }, [projects, portfolioUrl, authorName]);

  // Hook que encapsula la lógica de compartir
  const { shareToLinkedIn, copyToClipboard } = useLinkedInShare({
    project: portfolioProject,
    portfolioUrl,
    authorName
  });

  // Acción para compartir directamente
  const handleDirectShare = async () => {
    setIsSharing(true);
    try {
      await shareToLinkedIn();
    } finally {
      setIsSharing(false);
    }
  };

  // Acción para copiar al portapapeles
  const handleCopyMessage = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se cierre el menú
    const success = await copyToClipboard();
    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  // Acción para abrir LinkedIn
  const handleOpenLinkedIn = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se cierre el menú
    window.open('https://www.linkedin.com/feed/', '_blank');
  };

  // Toggle para mostrar/ocultar opciones (con estabilización)
  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (showOptions) {
      // Si está abierto, cerrar con delay
      setTimeout(() => {
        setShowOptions(false);
      }, 50);
    } else {
      // Si está cerrado, abrir inmediatamente
      setShowOptions(true);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón principal */}
      <div className="flex gap-2">
    <button
          onClick={handleDirectShare}
          disabled={isSharing}
          className={`flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#0077B5] to-[#005885] hover:from-[#005885] hover:to-[#004070] border border-[#0077B5] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Compartir todo mi portafolio en LinkedIn"
    >
          {/* Ícono oficial de LinkedIn en SVG */}
      <svg
            className={`w-6 h-6 ${isSharing ? 'animate-spin' : ''}`}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>{isSharing ? 'Compartiendo...' : 'Compartir Mi Portafolio'}</span>
          <span className="text-sm opacity-75">({projects.length} proyecto{projects.length !== 1 ? 's' : ''})</span>
        </button>

        {/* Botón de opciones */}
        <button
          onClick={toggleOptions}
          className={`px-3 py-4 text-white bg-gradient-to-r from-[#0077B5] to-[#005885] hover:from-[#005885] hover:to-[#004070] border border-[#0077B5] rounded-xl transition-all duration-300 hover:scale-105 ${
            showOptions ? 'ring-2 ring-[#0077B5] ring-opacity-50' : ''
          }`}
          title="Más opciones"
        >
          <svg
            className={`w-5 h-5 transition-all duration-300 ${showOptions ? 'rotate-180 text-yellow-200' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Opciones desplegables - PERMANENTES cuando están abiertas */}
      {(showOptions || isStableOpen) && (
        <div 
          className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden transition-all duration-300 ${
            showOptions && isStableOpen ? 'opacity-100 transform scale-100' : 'opacity-75 transform scale-95'
          }`}
          onClick={(e) => e.stopPropagation()} // Evitar que se cierre al hacer clic dentro
          onMouseEnter={() => {
            // Mantener abierto al hacer hover
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        >
          <div className="p-2">
            {/* Opción para copiar mensaje */}
            <button
              onClick={handleCopyMessage}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium">Copiar mensaje</div>
                <div className="text-sm text-gray-500">Copia el texto para pegar manualmente</div>
              </div>
              {showCopied && (
                <span className="ml-auto text-green-600 text-sm font-medium animate-pulse">¡Copiado!</span>
              )}
            </button>

            {/* Opción para abrir LinkedIn directamente */}
            <button
              onClick={handleOpenLinkedIn}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium">Abrir LinkedIn</div>
                <div className="text-sm text-gray-500">Ve directamente a LinkedIn</div>
              </div>
            </button>

            {/* Botón para cerrar el menú */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeout(() => {
                    setShowOptions(false);
                  }, 100);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
                Cerrar menú
    </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioLinkedInShare;