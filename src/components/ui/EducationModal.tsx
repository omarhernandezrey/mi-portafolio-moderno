"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";
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

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    if (isOpen) {
      closeButtonRef.current?.focus();
    }

    return () => {
      previouslyFocusedElement?.focus();
    };
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
              className="absolute top-4 right-4 text-[var(--muted-color)] hover:text-[var(--accent-color)] focus:outline-none"
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
