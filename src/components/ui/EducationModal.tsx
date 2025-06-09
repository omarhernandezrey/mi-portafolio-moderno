"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaTimes, FaLinkedin, FaShare } from "react-icons/fa";
import { Transition } from "@headlessui/react";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  institution: string;
  duration: string;
  description: string;
  logo: string;
  certificate?: string | null;
}

const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  title,
  institution,
  duration,
  description,
  logo,
  certificate,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let previouslyFocusedElement: HTMLElement | null = null;

    if (isOpen) {
      // Solo capturar el elemento anterior cuando se abre el modal
      previouslyFocusedElement = document.activeElement as HTMLElement;
      // Pequeño delay para evitar conflictos de focus
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        // Solo restaurar focus si el elemento aún existe y es válido
        if (
          previouslyFocusedElement &&
          document.contains(previouslyFocusedElement)
        ) {
          try {
            previouslyFocusedElement.focus();
          } catch (error) {
            // Ignorar errores de focus silenciosamente
            console.debug("Focus restoration failed:", error);
          }
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Función para compartir en LinkedIn - IGUAL que en proyectos
  const handleShareToLinkedIn = () => {
    setCopied(true);
    
    // Generar texto para LinkedIn igual que en LinkedInShareButton
    const portfolioUrl = "https://omarh-portafolio-web.vercel.app";
    
    const linkedInText = `🎓 ¡Nuevo certificado obtenido!

💼 🔍 DISPONIBLE PARA OPORTUNIDADES LABORALES COMO DESARROLLADOR WEB 🔍 💼

📜 ${title}
🏛️ ${institution}
📅 ${duration}

📋 Descripción:
${description}

✨ Este certificado forma parte de mi formación continua como desarrollador web, demostrando mi compromiso con el aprendizaje y la excelencia profesional.

🌐 Conoce más sobre mi formación y proyectos en: ${portfolioUrl}

🎯 BUSCO TRABAJO COMO DESARROLLADOR WEB - ¡Contáctame si tienes una oportunidad!

#OpenToWork #WebDeveloper #HiringMe #BuscoTrabajo #Certificacion #FormacionContinua #WebDevelopment #Developer #Frontend #Backend #FullStack #EducacionTecnologica #DesarrolloProfesional`;

    const text = encodeURIComponent(linkedInText);
    
    // Usar URL simplificada que mantiene opciones de imagen - IGUAL que proyectos
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}&text=${text}`;
    
    // Abrir en ventana centrada y más grande - IGUAL que proyectos
    const popup = window.open(
      linkedInUrl,
      'linkedin-share',
      'width=700,height=600,scrollbars=yes,resizable=yes,left=' + 
      (window.screen.width / 2 - 350) + ',top=' + (window.screen.height / 2 - 300)
    );

    if (popup) {
      popup.focus();
    }

    // Detectar cuando se cierra la ventana - IGUAL que proyectos
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        setCopied(false);
        clearInterval(checkClosed);
      }
    }, 1000);

    // Timeout de seguridad - IGUAL que proyectos
    setTimeout(() => {
      setCopied(false);
      clearInterval(checkClosed);
    }, 10000);
  };

  return (
    <Transition show={isOpen} appear>
      {/* Overlay */}
      <Transition.Child
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-50"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-50"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      </Transition.Child>

      {/* Modal */}
      <Transition.Child
        enter="transition-transform duration-300"
        enterFrom="scale-90 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition-transform duration-200"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-90 opacity-0"
      >
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            className="bg-gradient-to-br from-[var(--background-color)] via-[var(--secondary-background-color)] to-[var(--background-color)] text-[var(--text-color)] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            {/* Botón de Cierre */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--muted-color)] hover:text-[var(--accent-color)] focus:outline-none z-10"
              aria-label="Cerrar modal"
              ref={closeButtonRef}
            >
              <FaTimes size={24} />
            </button>

            {/* Contenido del Modal */}
            <div className="p-8">


              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-[var(--secondary-background-color)] border-4 border-[var(--accent-color)]">
                  <Image
                    src={logo}
                    alt={`${institution} logo`}
                    width={96} // 24px * 4
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Título y Detalles */}
              <h2
                id="modal-title"
                className="text-3xl font-bold text-center mb-4 text-[var(--primary-color)]"
              >
                {title}
              </h2>
              <p className="text-center text-[var(--accent-color)] text-lg font-medium mb-2">
                {institution}
              </p>
              <p className="text-center text-[var(--muted-color)] mb-6">
                {duration}
              </p>

              {/* Descripción */}
              <p
                id="modal-description"
                className="text-[var(--text-color)] leading-relaxed mb-6 text-justify"
              >
                {description}
              </p>

              {/* Botón de LinkedIn - IGUAL que en proyectos */}
              {certificate && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleShareToLinkedIn}
                    disabled={copied}
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full max-w-[280px]"
                    style={{
                      backgroundColor: copied 
                        ? 'rgba(10, 102, 194, 0.1)' 
                        : 'rgba(10, 102, 194, 0.05)',
                      color: '#0a66c2',
                      border: '1px solid rgba(10, 102, 194, 0.2)',
                    }}
                    title="Compartir certificado en LinkedIn"
                  >
                    {/* Icono animado */}
                    <div
                      style={{
                        transform: copied ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                        transition: 'transform 0.5s',
                      }}
                    >
                      {copied ? (
                        <FaShare size={16} />
                      ) : (
                        <FaLinkedin size={16} />
                      )}
                    </div>

                    {/* Texto del botón */}
                    <span className="group-hover:text-[#0a66c2] transition-colors duration-300">
                      {copied ? 'Compartiendo...' : 'Compartir en LinkedIn'}
                    </span>

                    {/* Icono de enlace externo */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        animation: 'pulse 1.5s infinite',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}

              {/* Certificado */}
              {certificate && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4 text-center">
                    Certificado
                  </h3>
                  <div className="flex justify-center">
                    {/* Enlace al certificado completo */}
                    <a
                      href={certificate}
                      className="cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={certificate}
                        alt="Certificado"
                        width={600} // Ajusta según tus necesidades
                        height={400}
                        className="w-full max-w-[600px] max-h-[400px] rounded-lg object-contain"
                      />
                    </a>
                  </div>
                </div>
              )}

              {/* Botón de Cierre */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-[var(--accent-color)] text-[var(--background-color)] py-2 px-8 rounded-full hover:bg-[var(--primary-hover-color)] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--accent-hover-color)]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition.Child>
    </Transition>
  );
};

export default React.memo(EducationModal);
