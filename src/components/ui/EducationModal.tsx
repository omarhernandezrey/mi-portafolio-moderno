"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaTimes, FaCopy, FaCheck } from "react-icons/fa";
import { Transition } from "@headlessui/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLinkedInCertificateShare } from "@/hooks/useLinkedInShare";

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
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRootRef = useRef<HTMLElement | null>(null);
  const { copyCertificateToClipboard } = useLinkedInCertificateShare({
    certificate: {
      title,
      institution,
      duration,
      description,
      certificate,
    },
  });

  // Asegurar portal en body para evitar stacking contexts
  useEffect(() => {
    setMounted(true);
    let container = document.getElementById("modal-root") as HTMLElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = "modal-root";
      document.body.appendChild(container);
    }
    modalRootRef.current = container;
  }, []);

  // Evitar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

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
  const handleCopyInformation = async () => {
    if (copied) return;
    const copiedOk = await copyCertificateToClipboard();
    if (!copiedOk) {
      alert(t('education.copyError'));
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!mounted || !modalRootRef.current) return null;

  return createPortal(
    <Transition show={isOpen} appear>
      {/* Overlay */}
      <Transition.Child
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-black/70 z-[99998]"
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
          className="fixed inset-0 flex items-center justify-center z-[99999] px-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            className="bg-gradient-to-br from-[var(--background-color)] via-[var(--secondary-background-color)] to-[var(--background-color)] text-[var(--text-color)] rounded-lg shadow-2xl w-[95%] sm:w-[90%] max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[80vh] overflow-y-auto overscroll-contain relative"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            {/* Botón de Cierre */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[var(--muted-color)] hover:text-[var(--accent-color)] focus:outline-none z-10"
              aria-label={t('education.closeModal')}
              ref={closeButtonRef}
            >
              <FaTimes size={22} />
            </button>

            {/* Contenido del Modal */}
            <div className="p-3 sm:p-4 md:p-4">


              {/* Logo */}
              <div className="flex justify-center mb-2.5 sm:mb-3.5">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-[var(--secondary-background-color)] border-2 border-[var(--accent-color)]">
                  <Image
                    src={logo}
                    alt={`${institution} logo`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Título y Detalles */}
              <h2
                id="modal-title"
                className="text-base sm:text-lg md:text-xl font-bold text-center mb-1.5 sm:mb-2.5 text-[var(--primary-color)]"
              >
                {title}
              </h2>
              <p className="text-center text-[var(--accent-color)] text-xs sm:text-sm font-medium mb-1.5">
                {institution}
              </p>
              <p className="text-center text-[var(--muted-color)] text-[11px] sm:text-xs mb-3.5">
                {duration}
              </p>

              {/* Descripción */}
              <p
                id="modal-description"
                className="text-[var(--text-color)] text-[13px] sm:text-sm leading-relaxed mb-4 text-justify"
              >
                {description}
              </p>

              {/* Botón para copiar información del curso */}
              {certificate && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleCopyInformation}
                    disabled={copied}
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full max-w-[280px]"
                    style={{
                      backgroundColor: copied 
                        ? 'rgba(10, 102, 194, 0.1)' 
                        : 'rgba(10, 102, 194, 0.05)',
                      color: '#0a66c2',
                      border: '1px solid rgba(10, 102, 194, 0.2)',
                    }}
                    title={copied ? t('education.copied') : t('education.copyInfo')}
                  >
                    {/* Icono animado */}
                    <div
                      style={{
                        transform: copied ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s',
                      }}
                    >
                      {copied ? (
                        <FaCheck size={16} />
                      ) : (
                        <FaCopy size={16} />
                      )}
                    </div>

                    {/* Texto del botón */}
                    <span className="group-hover:text-[#0a66c2] transition-colors duration-300">
                      {copied ? t('education.copied') : t('education.copyInfo')}
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
                <div className="mt-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-[var(--accent-color)] mb-2.5 text-center">
                    {t('education.certificate')}
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
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg object-contain max-h-[30vh] md:max-h-[35vh]"
                      />
                    </a>
                  </div>
                </div>
              )}

              {/* Botón de Cierre */}
              <div className="mt-5 flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-[var(--accent-color)] text-[var(--background-color)] py-1.5 px-5 rounded-full hover:bg-[var(--primary-hover-color)] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--accent-hover-color)] text-xs sm:text-sm"
                >
                  {t('education.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition.Child>
    </Transition>,
    modalRootRef.current
  );
};

export default React.memo(EducationModal);
