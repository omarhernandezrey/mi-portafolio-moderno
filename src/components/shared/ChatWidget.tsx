"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { nanoid } from 'nanoid';
import { sendChatMessage } from '@/services/chatService';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  handoffUrl?: string;
  calcomUrl?: string;
}

export default function ChatWidget() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language === 'en' ? 'en' : 'es';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showAttention, setShowAttention] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Inicializar sessionId y consentimiento desde localStorage
  useEffect(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = nanoid();
      localStorage.setItem('chatbot_session_id', id);
    }
    setSessionId(id);
    
    setHasConsented(localStorage.getItem('chatbot_consent') === 'true');

    // Animación de atención después de 30 segundos si no se ha abierto
    const timer = setTimeout(() => {
      if (!localStorage.getItem('chatbot_opened_once')) {
        setShowAttention(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current && hasConsented) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, hasConsented]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleConsent = () => {
    setHasConsented(true);
    localStorage.setItem('chatbot_consent', 'true');
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    if (!hasConsented) return;
    
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: finalInput }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(sessionId, finalInput, currentLanguage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.reply,
        handoffUrl: response.handoffUrl,
        calcomUrl: response.calcomUrl
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('chatbot.error') 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, currentLanguage, t, hasConsented]);

  const handleQuickAction = (actionKey: string) => {
    const message = t(`chatbot.quickActions.${actionKey}`);
    handleSubmit(undefined, message);
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {/* Burbuja de Atención */}
      <AnimatePresence>
        {showAttention && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="mb-2 mr-2 rounded-2xl bg-[var(--white-color)] border border-[var(--primary-color)] px-4 py-2 text-xs font-medium text-[var(--text-color)] shadow-xl"
          >
            {currentLanguage === 'es' ? '¿Hablamos? 👋' : 'Let\'s talk? 👋'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <motion.button
        animate={showAttention && !isOpen ? { 
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: 1.5, 
          repeat: showAttention && !isOpen ? Infinity : 0,
          repeatDelay: 5
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
        aria-label={isOpen ? t('chatbot.ariaClose') : t('chatbot.ariaOpen')}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Panel de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--muted-color)] bg-[var(--background-color)] shadow-2xl transition-all duration-300 max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:mb-0 max-sm:h-[85vh] max-sm:w-full max-sm:rounded-b-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-header"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 id="chatbot-header" className="text-sm font-bold">{t('chatbot.title')}</h3>
                  <p className="text-[10px] opacity-80">{t('chatbot.status')}</p>
                </div>
              </div>
              <button 
                onClick={toggleChat} 
                className="rounded-full p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={t('chatbot.ariaClose')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body (Messages) */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 scroll-smooth"
            >
              <div className="flex flex-col gap-4">
                {/* Pantalla de Consentimiento */}
                {!hasConsented ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
                    <div className="p-4 bg-[var(--primary-color)]/10 rounded-full text-[var(--primary-color)]">
                      <ShieldCheck size={48} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-[var(--text-color)]">
                        {currentLanguage === 'es' ? 'Tu privacidad es lo primero' : 'Your privacy first'}
                      </h4>
                      <p className="text-xs text-[var(--muted-color)] leading-relaxed">
                        {currentLanguage === 'es' 
                          ? 'Para poder ayudarte, necesito que aceptes mi política de tratamiento de datos personales (Habeas Data).'
                          : 'To help you, I need you to accept my personal data processing policy.'}
                      </p>
                    </div>
                    <Link 
                      href={currentLanguage === 'es' ? '/privacidad' : '/privacy'}
                      className="text-[10px] text-[var(--primary-color)] underline"
                      target="_blank"
                    >
                      {currentLanguage === 'es' ? 'Ver política completa' : 'View full policy'}
                    </Link>
                    <button
                      onClick={handleConsent}
                      className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl text-sm font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
                    >
                      {currentLanguage === 'es' ? 'Aceptar y continuar' : 'Accept and continue'}
                    </button>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 && !isLoading && (
                      <div className="flex flex-col gap-4">
                        <div className="text-center text-sm text-[var(--muted-color)] mt-4">
                          {t('chatbot.welcome')}
                        </div>
                        <div className="flex flex-col gap-2">
                            {['hire', 'recruiter', 'tech'].map((key) => (
                              <button
                                key={key}
                                onClick={() => handleQuickAction(key)}
                                className="rounded-xl border border-[var(--primary-color)] px-4 py-3 text-left text-xs text-[var(--primary-color)] transition-colors hover:bg-[var(--primary-color)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                              >
                                {t(`chatbot.quickActions.${key}`)}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-[var(--primary-color)] text-white rounded-br-none' 
                              : 'bg-[var(--white-color)] border border-[var(--muted-color)] text-[var(--text-color)] rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.handoffUrl && (
                            <a 
                              href={msg.handoffUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-full bg-[var(--accent-color)] px-4 py-2 text-[10px] font-bold text-white transition-all hover:brightness-110 hover:shadow-md active:scale-95"
                            >
                              <Phone size={12} />
                              {t('chatbot.handoff')}
                            </a>
                          )}
                          {msg.calcomUrl && (
                            <a 
                              href={msg.calcomUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2 text-[10px] font-bold text-white transition-all hover:brightness-110 hover:shadow-md active:scale-95"
                            >
                              <Calendar size={12} />
                              {t('chatbot.calendar')}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-1 rounded-2xl border border-[var(--muted-color)] bg-[var(--white-color)] px-4 py-2 text-[10px] text-[var(--muted-color)]">
                          <div className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted-color)]" />
                          <div className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted-color)] [animation-delay:0.2s]" />
                          <div className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted-color)] [animation-delay:0.4s]" />
                          <span className="ml-1">{t('chatbot.loading')}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer (Input) */}
            <div className="border-t border-[var(--muted-color)] p-4 max-sm:pb-8">
              <form 
                className="flex items-center gap-2"
                onSubmit={handleSubmit}
              >
                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  value={input === '---bot---' ? 'spam' : ''} 
                  readOnly
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 rounded-full border border-[var(--muted-color)] bg-[var(--white-color)] px-4 py-2 text-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 text-[var(--text-color)] disabled:opacity-50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || !hasConsented}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !hasConsented}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-color)] text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-90 shadow-md"
                  aria-label={t('chatbot.send') || 'Send'}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
