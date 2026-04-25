"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Phone, Calendar, ShieldCheck, Mic, MicOff } from 'lucide-react';
import { nanoid } from 'nanoid';
import { sendChatMessage } from '@/services/chatService';
import { useTranslation } from 'react-i18next';
import { buildCalcomUrl } from '@/lib/chatbot/calcom';
import Link from 'next/link';
import useSpeechToText from '@/hooks/useSpeechToText';
import { track } from '@vercel/analytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  handoffUrl?: string;
  calcomUrl?: string;
  created_at?: string;
}

export default function ChatWidget() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language === 'en' ? 'en' : 'es';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [visitorMeta, setVisitorMeta] = useState<{ name?: string; email?: string }>({});
  const [showAttention, setShowAttention] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<string>(new Date().toISOString());

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Polling para mensajes de Omar (Handoff humano - Tarea 19.3)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && sessionId && hasConsented) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/chat/poll?sessionId=${sessionId}&since=${lastPollTime}`);
          const data = await response.json();

          if (data.messages && data.messages.length > 0) {
            setMessages(prev => {
              // Filtrar mensajes que ya existen para evitar duplicados (comparando contenido y rol)
              const newMsgs = data.messages.filter((nm: Message) => 
                !prev.some(pm => pm.content === nm.content && pm.role === nm.role)
              );
              return [...prev, ...newMsgs];
            });
            // Actualizar el timestamp del último poll con el mensaje más reciente recibido
            const newestMsg = data.messages[data.messages.length - 1];
            setLastPollTime(newestMsg.created_at);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 5000); // Cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, sessionId, hasConsented, lastPollTime]);

  // Inicializar sessionId y consentimiento desde localStorage
  useEffect(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = nanoid();
      localStorage.setItem('chatbot_session_id', id);
    }
    setSessionId(id);
    
    setHasConsented(localStorage.getItem('chatbot_consent') === 'true');

    // Lógica de Re-engagement
    const checkReengage = async (sid: string) => {
      try {
        const r = await fetch(`/api/chat/re-engage?sessionId=${sid}`);
        const data = await r.json();
        if (data.reengage) {
          const reMsg = currentLanguage === 'es' 
            ? `¡Qué bueno verte de nuevo ${data.name}! 👋 ¿Seguimos donde quedamos sobre tu interés en ${data.intent || 'un proyecto'}?`
            : `Great to see you again ${data.name}! 👋 Shall we pick up where we left off regarding your interest in ${data.intent || 'a project'}?`;
          
          setMessages([{ role: 'assistant', content: reMsg }]);
          setIsOpen(true); // Abrimos el chat proactivamente
          setShowAttention(false);
        }
      } catch (e) {
        console.error('Re-engage check failed:', e);
      }
    };

    if (id) checkReengage(id);

    // Animación de atención después de 30 segundos si no se ha abierto
    const timer = setTimeout(() => {
      if (!localStorage.getItem('chatbot_opened_once')) {
        setShowAttention(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [currentLanguage]);

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

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      track('chatbot_opened');
      localStorage.setItem('chatbot_opened_once', 'true');
      setShowAttention(false);
    }
  };

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
      
      // Actualizar metadatos del visitante si el bot los extrajo
      if (response.visitorMeta) {
        if (!visitorMeta.email && response.visitorMeta.email) {
          track('lead_created', { source: 'chatbot' });
        }
        setVisitorMeta(prev => ({ ...prev, ...response.visitorMeta }));
      }

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
  }, [input, isLoading, sessionId, currentLanguage, t, hasConsented, visitorMeta.email]);

  // Escuchar evento para abrir el chat con mensaje pre-rellenado (Tarea 29.2)
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { message } = customEvent.detail || {};
      setIsOpen(true);
      if (message) {
        setInput(message);
        // Opcional: enviar automáticamente si se desea
        // handleSubmit(undefined, message);
      }
    };

    window.addEventListener('chatbot-open', handleOpenChat as EventListener);
    return () => window.removeEventListener('chatbot-open', handleOpenChat as EventListener);
  }, [handleSubmit]);

  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    language: currentLanguage === 'es' ? 'es-CO' : 'en-US',
    onResult: (text) => setInput(text),
    onEnd: () => {
      // Si hay texto al terminar por silencio, enviar
      if (input.trim()) {
        handleSubmit();
      }
    }
  });

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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
            className="mb-3 mr-2 relative group"
          >
            <div className="absolute inset-0 bg-[var(--primary-color)] blur-md opacity-20 group-hover:opacity-40 rounded-2xl transition-opacity duration-500"></div>
            <div className="relative rounded-2xl bg-[var(--secondary-background-color)]/90 backdrop-blur-md border border-[var(--primary-color)]/30 px-5 py-3 text-sm font-bold text-[var(--text-color)] shadow-2xl flex items-center gap-3 cursor-pointer" onClick={toggleChat}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary-color)]"></span>
              </span>
              {currentLanguage === 'es' ? '¿Hablamos? 👋' : 'Let\'s talk? 👋'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <motion.button
        animate={showAttention && !isOpen ? { 
          y: [0, -8, 0],
        } : {}}
        transition={{ 
          duration: 2.5, 
          repeat: showAttention && !isOpen ? Infinity : 0,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_var(--primary-color)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-color)]/50 transition-all z-50 group"
        aria-label={isOpen ? t('chatbot.ariaClose') : t('chatbot.ariaOpen')}
        aria-expanded={isOpen}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        {isOpen ? <X size={30} className="drop-shadow-md" /> : <Bot size={32} className="drop-shadow-md" />}
      </motion.button>

      {/* Panel de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 flex h-[650px] w-[400px] flex-col overflow-hidden rounded-[2rem] border border-[var(--primary-color)]/20 bg-[var(--background-color)]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:mb-0 max-sm:h-[85vh] max-sm:w-full max-sm:rounded-b-none z-40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-header"
          >
            {/* Header Moderno */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-[var(--primary-color)]/10 bg-[var(--secondary-background-color)]/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] opacity-40 blur-sm animate-pulse"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-background-color)] to-[var(--background-color)] border border-[var(--primary-color)]/30 text-[var(--primary-color)] shadow-inner">
                    <Bot size={24} />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--background-color)] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                </div>
                <div className="flex flex-col">
                  <h3 id="chatbot-header" className="text-base font-extrabold tracking-tight text-[var(--text-color)] flex items-center gap-2">
                    {t('chatbot.title')}
                    <span className="px-2 py-0.5 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] uppercase font-black tracking-wider border border-[var(--primary-color)]/20">AI</span>
                  </h3>
                  <p className="text-xs font-medium text-[var(--muted-color)] flex items-center gap-1.5">
                    <span className="text-green-500 animate-pulse">●</span> {t('chatbot.status')}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleChat} 
                className="rounded-full p-2 text-[var(--muted-color)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-colors focus:outline-none"
                aria-label={t('chatbot.ariaClose')}
              >
                <X size={20} strokeWidth={2.5} />
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
                                className="group relative overflow-hidden rounded-2xl border border-[var(--primary-color)]/20 bg-[var(--secondary-background-color)]/50 px-5 py-3.5 text-left text-sm font-medium text-[var(--text-color)] transition-all hover:border-[var(--primary-color)]/60 hover:shadow-[0_0_15px_var(--primary-color)]/10 focus:outline-none"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/0 via-[var(--primary-color)]/5 to-[var(--primary-color)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                  <span className="text-[var(--primary-color)]">✦</span>
                                  {t(`chatbot.quickActions.${key}`)}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={idx} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} drop-shadow-sm`}
                      >
                        <div 
                          className={`max-w-[88%] px-5 py-3.5 text-[15px] leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white rounded-2xl rounded-br-sm shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                              : 'bg-[var(--secondary-background-color)]/80 backdrop-blur-md border border-[var(--primary-color)]/15 text-[var(--text-color)] rounded-2xl rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                          }`}                        >
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
                              href={buildCalcomUrl(msg.calcomUrl, visitorMeta)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2 text-[10px] font-bold text-white transition-all hover:brightness-110 hover:shadow-md active:scale-95"
                            >
                              <Calendar size={12} />
                              {t('chatbot.calendar')}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start drop-shadow-sm"
                      >
                        <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[var(--primary-color)]/15 bg-[var(--secondary-background-color)]/80 backdrop-blur-md px-5 py-3 text-xs font-medium text-[var(--primary-color)] shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                          <Bot size={14} className="animate-pulse" />
                          <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-color)]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-color)] [animation-delay:0.2s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--primary-color)] [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer Moderno (Input) */}
            <div className="p-4 max-sm:pb-6 bg-gradient-to-t from-[var(--background-color)] via-[var(--background-color)] to-transparent relative z-10">
              <form 
                className="relative flex items-center gap-2 rounded-full border border-[var(--primary-color)]/30 bg-[var(--secondary-background-color)]/80 backdrop-blur-xl p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all focus-within:border-[var(--primary-color)] focus-within:shadow-[0_0_25px_var(--primary-color)]/20"
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
                
                <div className="flex-1 px-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('chatbot.placeholder')}
                    className="w-full bg-transparent text-[15px] text-[var(--text-color)] placeholder-[var(--muted-color)] focus:outline-none disabled:opacity-50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading || !hasConsented}
                  />
                </div>

                <div className="flex items-center gap-1 pr-1">
                  {/* Botón Micrófono (Tarea 28.4) */}
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleMic}
                      disabled={isLoading || !hasConsented}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                        isListening 
                          ? 'bg-red-500/20 text-red-500 animate-pulse' 
                          : 'text-[var(--muted-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10'
                      } disabled:opacity-50`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      title={isListening ? 'Escuchando...' : 'Hablar'}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || !hasConsented}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white disabled:opacity-50 disabled:grayscale transition-transform hover:scale-105 active:scale-95 shadow-md"
                    aria-label={t('chatbot.send') || 'Send'}
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
