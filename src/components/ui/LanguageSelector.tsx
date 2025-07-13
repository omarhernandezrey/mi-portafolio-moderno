"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useI18n } from '@/contexts/I18nContext';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
];

interface LanguageSelectorProps {
  isMobile?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMobile = false }) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      if (isMobile) {
        // Para móvil, posicionar relativo al contenedor padre
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      } else {
        // Para desktop, usar scroll offset
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar si el clic fue fuera del botón y del dropdown
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Para móvil, también escuchar en el document para clics fuera
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Para móvil, también prevenir scroll del fondo cuando el dropdown está abierto
      if (isMobile) {
        document.body.style.overflowY = 'hidden';
      }
    } else if (isMobile) {
      // Restaurar scroll cuando se cierra
      document.body.style.overflowY = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      if (isMobile) {
        document.body.style.overflowY = 'unset';
      }
    };
  }, [isOpen, isMobile]);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === language || isAnimating) return;

    setIsAnimating(true);
    setIsOpen(false);

    // Agregar un pequeño delay para la animación
    setTimeout(async () => {
      await setLanguage(langCode);
      setIsAnimating(false);
    }, 200);
  };

  const toggleDropdown = () => {
    if (!isAnimating) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        ref={buttonRef}
        type="button"
        className="group relative flex items-center gap-1 px-2 py-1.5 rounded-lg border backdrop-blur-xl transition-all duration-300"
        style={{
          backgroundColor: isOpen 
            ? 'var(--card-bg-color)'
            : `color-mix(in srgb, var(--secondary-background-color) 60%, transparent)`,
          borderColor: isOpen 
            ? 'var(--primary-color)'
            : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
          color: 'var(--text-color)',
          boxShadow: isOpen 
            ? `0 10px 30px color-mix(in srgb, var(--primary-color) 20%, transparent)`
            : 'none',
        }}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        disabled={isAnimating}
        aria-label={`Current language: ${currentLanguage.nativeName}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Icono de globo */}
        <div className="flex items-center gap-1">
          <FaGlobe 
            size={12} 
            style={{ color: 'var(--primary-color)' }}
          />
          
          {/* Solo bandera en móvil, bandera + nombre en desktop */}
          <div className="flex items-center gap-1">
            <span className="text-sm" role="img" aria-label={currentLanguage.name}>
              {currentLanguage.flag}
            </span>
            <span className="hidden lg:block text-xs font-medium">
              {currentLanguage.nativeName}
            </span>
          </div>
        </div>

        {/* Flecha */}
        <div
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <FaChevronDown 
            size={10} 
            style={{ color: 'var(--muted-color)' }}
          />
        </div>
      </button>

      {/* Dropdown con Portal o posicionamiento relativo */}
      {isMobile ? (
        // Para móvil: dropdown relativo dentro del mismo contenedor
        <AnimatePresence>
          {isOpen && (
            <div
              role="listbox"
              aria-label="Language selection"
              className="absolute top-full left-0 mt-2 py-2 rounded-lg border backdrop-blur-xl overflow-hidden shadow-2xl z-[99999]"
              style={{
                width: Math.max(dropdownPosition.width, 140),
                backgroundColor: 'var(--card-bg-color)',
                borderColor: `color-mix(in srgb, var(--primary-color) 30%, transparent)`,
                boxShadow: `0 20px 40px color-mix(in srgb, var(--primary-color) 15%, transparent)`,
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={lang.code === language}
                  className="w-full flex items-center gap-2 px-3 py-2 transition-all duration-200"
                  style={{
                    backgroundColor: lang.code === language 
                      ? `color-mix(in srgb, var(--primary-color) 10%, transparent)`
                      : 'transparent',
                    color: lang.code === language 
                      ? 'var(--primary-color)'
                      : 'var(--text-color)',
                  }}
                  onMouseEnter={(e) => {
                    if (lang.code !== language) {
                      e.currentTarget.style.backgroundColor = `color-mix(in srgb, var(--muted-color) 10%, transparent)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (lang.code !== language) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isAnimating}
                >
                  {/* Bandera */}
                  <span 
                    className="text-sm" 
                    role="img" 
                    aria-label={lang.name}
                  >
                    {lang.flag}
                  </span>

                  {/* Información del idioma */}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {lang.nativeName}
                    </span>
                    <span 
                      className="text-xs opacity-60"
                      style={{ color: 'var(--muted-color)' }}
                    >
                      {lang.name}
                    </span>
                  </div>

                  {/* Indicador de selección */}
                  {lang.code === language && (
                    <div className="ml-auto flex items-center">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </AnimatePresence>
      ) : (
        // Para desktop: dropdown con portal
        typeof window !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                role="listbox"
                aria-label="Language selection"
                className="fixed py-2 rounded-lg border backdrop-blur-xl overflow-hidden shadow-2xl"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: Math.max(dropdownPosition.width, 140),
                  backgroundColor: 'var(--card-bg-color)',
                  borderColor: `color-mix(in srgb, var(--primary-color) 30%, transparent)`,
                  boxShadow: `0 20px 40px color-mix(in srgb, var(--primary-color) 15%, transparent)`,
                  zIndex: 99999,
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={lang.code === language}
                    className="w-full flex items-center gap-2 px-3 py-2 transition-all duration-200"
                    style={{
                      backgroundColor: lang.code === language 
                        ? `color-mix(in srgb, var(--primary-color) 10%, transparent)`
                        : 'transparent',
                      color: lang.code === language 
                        ? 'var(--primary-color)'
                        : 'var(--text-color)',
                    }}
                    onMouseEnter={(e) => {
                      if (lang.code !== language) {
                        e.currentTarget.style.backgroundColor = `color-mix(in srgb, var(--muted-color) 10%, transparent)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (lang.code !== language) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => handleLanguageChange(lang.code)}
                    disabled={isAnimating}
                  >
                    {/* Bandera */}
                    <span 
                      className="text-sm" 
                      role="img" 
                      aria-label={lang.name}
                    >
                      {lang.flag}
                    </span>

                    {/* Información del idioma */}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {lang.nativeName}
                      </span>
                      <span 
                        className="text-xs opacity-60"
                        style={{ color: 'var(--muted-color)' }}
                      >
                        {lang.name}
                      </span>
                    </div>

                    {/* Indicador de selección */}
                    {lang.code === language && (
                      <div className="ml-auto flex items-center">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--primary-color)' }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      )}

      {/* Loading overlay */}
      {isAnimating && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: `color-mix(in srgb, var(--background-color) 80%, transparent)`,
          }}
        >
          <div
            className="w-3 h-3 border-2 border-transparent rounded-full animate-spin"
            style={{
              borderTopColor: 'var(--primary-color)',
              borderRightColor: 'var(--primary-color)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;