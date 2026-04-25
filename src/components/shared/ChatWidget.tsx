"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Phone, Calendar, ShieldCheck, Mic, MicOff, Paperclip } from 'lucide-react';
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
  const [consentAt, setConsentAt] = useState<string | undefined>(undefined);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [lastPollTime, setLastPollTime] = useState<string>(new Date().toISOString());

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  }, [isOpen, sessionId, hasConsented, lastPollTime, currentLanguage]);

  // Inicializar sessionId y consentimiento desde localStorage
  useEffect(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = nanoid();
      localStorage.setItem('chatbot_session_id', id);
    }
    setSessionId(id);

    setHasConsented(localStorage.getItem('chatbot_consent') === 'true');
    setConsentAt(localStorage.getItem('chatbot_consent_at') || undefined);

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
    const ts = new Date().toISOString();
    setHasConsented(true);
    setConsentAt(ts);
    localStorage.setItem('chatbot_consent', 'true');
    localStorage.setItem('chatbot_consent_at', ts);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert(currentLanguage === 'es' ? 'La imagen debe pesar menos de 4 MB.' : 'Image must be under 4 MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    if (!hasConsented) return;

    const finalInput = overrideInput || input;
    if (!finalInput.trim() && !imageDataUrl || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: finalInput }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(sessionId, finalInput, currentLanguage, visitorMeta, consentAt, imageDataUrl);
      setImageDataUrl(undefined);
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
  }, [input, imageDataUrl, isLoading, sessionId, currentLanguage, t, hasConsented, visitorMeta, consentAt]);

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

    window.addEventListener('openChatWithMsg', handleOpenChat);
    return () => window.removeEventListener('openChatWithMsg', handleOpenChat);
  }, [handleSubmit]);

  // Speech to Text (Tarea 28.4)
  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    onResult: (text) => setInput(text),
    language: currentLanguage
  });

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <>
      {/* Botón Flotante */}
      <motion.button
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-[var(--inner-circle-text-color)] shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20"
        onClick={toggleChat}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={showAttention ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1.1, 1] } : {}}
        transition={showAttention ? { repeat: Infinity, duration: 2, repeatDelay: 5 } : {}}
        aria-label="Abrir chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative"
            >
              <Bot size={32} />
              {showAttention && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-14 -left-20 w-32 bg-white text-slate-900 text-xs font-bold py-2 px-3 rounded-2xl rounded-br-none shadow-xl border border-slate-100"
                >
                  {currentLanguage === 'es' ? '¿Hablamos? 👋' : 'Let\'s talk! 👋'}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[9998] flex h-[600px] w-[400px] flex-col overflow-hidden rounded-3xl bg-[var(--background-color)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[var(--primary-color)]/20 max-sm:bottom-0 max-sm:right-0 max-sm:h-[100dvh] max-sm:w-full max-sm:rounded-none"
            role="dialog"
            aria-modal="true"
          >
            {/* Header Moderno */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-[var(--primary-color)]/20 to-[var(--accent-color)]/20 p-6 backdrop-blur-xl border-b border-[var(--primary-color)]/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-[var(--inner-circle-text-color)] shadow-lg">
                    <Bot size={24} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--background-color)] bg-emerald-500 shadow-sm animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-[var(--white-color)]">Omar Assistant</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary-color)] opacity-80">AI Power • 24/7 Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--white-color)]/5 text-[var(--white-color)] hover:bg-[var(--primary-color)] hover:text-[var(--inner-circle-text-color)] transition-all active:scale-95"
                  aria-label="WhatsApp"
                >
                  <Phone size={18} />
                </a>
                <button
                  onClick={toggleChat}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--white-color)]/5 text-[var(--white-color)] hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-95 sm:hidden"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body / Mensajes */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-hide"
            >
              {/* Mensaje de bienvenida inicial */}
              {messages.length === 0 && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex max-w-[85%] flex-col gap-2"
                  >
                    <div className="rounded-2xl rounded-tl-none bg-[var(--card-bg-color)] p-4 text-[15px] leading-relaxed text-[var(--text-color)] shadow-sm border border-[var(--primary-color)]/5">
                      {currentLanguage === 'es' ? '¡Hola! Soy el asistente inteligente de Omar. 👋' : 'Hi! I am Omar\'s intelligent assistant. 👋'}
                      <br /><br />
                      {currentLanguage === 'es' ? '¿En qué puedo ayudarte hoy?' : 'How can I help you today?'}
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleSubmit(undefined, currentLanguage === 'es' ? 'Quiero contratar un servicio' : 'I want to hire a service')}
                      className="rounded-xl border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 p-3 text-left text-sm font-medium text-[var(--text-color)] transition-all hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/40 active:scale-[0.98]"
                    >
                      🚀 {currentLanguage === 'es' ? 'Quiero contratar un servicio' : 'I want to hire a service'}
                    </button>
                    <button
                      onClick={() => handleSubmit(undefined, currentLanguage === 'es' ? 'Tengo una oferta laboral' : 'I have a job offer')}
                      className="rounded-xl border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 p-3 text-left text-sm font-medium text-[var(--text-color)] transition-all hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/40 active:scale-[0.98]"
                    >
                      💼 {currentLanguage === 'es' ? 'Tengo una oferta laboral' : 'I have a job offer'}
                    </button>
                    <button
                      onClick={() => handleSubmit(undefined, currentLanguage === 'es' ? 'Tengo una pregunta técnica' : 'I have a technical question')}
                      className="rounded-xl border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5 p-3 text-left text-sm font-medium text-[var(--text-color)] transition-all hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/40 active:scale-[0.98]"
                    >
                      🛠️ {currentLanguage === 'es' ? 'Pregunta técnica' : 'Technical question'}
                    </button>
                  </div>
                </div>
              )}

              {/* Render de mensajes */}
              <div className="flex flex-col gap-6 pb-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all ${
                        msg.role === 'user'
                          ? 'rounded-2xl rounded-tr-none bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-[var(--inner-circle-text-color)]'
                          : 'rounded-2xl rounded-tl-none bg-[var(--card-bg-color)] text-[var(--text-color)] border border-[var(--primary-color)]/5'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Botones de acción dinámicos */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.handoffUrl && (
                        <a
                          href={msg.handoffUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                        >
                          <Phone size={14} />
                          {t('chatbot.handoffButton')}
                        </a>
                      )}
                      {msg.calcomUrl && (
                        <a
                          href={buildCalcomUrl(msg.calcomUrl, visitorMeta)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-[var(--primary-color)]/10 px-3 py-2 text-xs font-bold text-[var(--primary-color)] border border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)] hover:text-[var(--inner-circle-text-color)] transition-all active:scale-95"
                        >
                          <Calendar size={14} />
                          {t('chatbot.calendarButton')}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex items-start">
                    <div className="flex gap-1.5 rounded-2xl rounded-tl-none bg-[var(--card-bg-color)] p-4 shadow-sm border border-[var(--primary-color)]/5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary-color)]" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary-color)]" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary-color)]" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                {/* Habeas Data / Privacidad (Tarea 16.2) */}
                {!hasConsented && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-[var(--primary-color)]/5 p-6 border border-[var(--primary-color)]/10 text-center"
                  >
                    <ShieldCheck className="mx-auto mb-3 text-[var(--primary-color)]" size={32} />
                    <p className="mb-4 text-xs leading-relaxed text-[var(--text-color)]">
                      {currentLanguage === 'es'
                        ? 'Para chatear, acepta nuestra política de privacidad y tratamiento de datos personales.'
                        : 'To chat, please accept our privacy policy and personal data processing.'}
                    </p>
                    <button
                      onClick={handleConsent}
                      className="w-full rounded-xl bg-[var(--primary-color)] py-3 text-xs font-black uppercase tracking-widest text-[var(--inner-circle-text-color)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {currentLanguage === 'es' ? 'Acepto y Continuar' : 'Accept and Continue'}
                    </button>
                    <div className="mt-3">
                      <Link
                        href="/privacidad"
                        target="_blank"
                        className="text-[10px] font-bold text-[var(--muted-color)] hover:text-[var(--primary-color)] transition-colors underline"
                      >
                        {currentLanguage === 'es' ? 'Ver política completa' : 'View privacy policy'}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer Moderno (Input) */}
            <div className="p-4 max-sm:pb-6 bg-gradient-to-t from-[var(--background-color)] via-[var(--background-color)] to-transparent relative z-10">
              {/* Preview imagen seleccionada */}
              {imageDataUrl && (
                <div className="mb-2 flex items-center gap-2">
                  <img src={imageDataUrl} alt="preview" className="h-14 w-14 rounded-lg object-cover border border-[var(--primary-color)]/30" />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(undefined)}
                    className="text-[var(--muted-color)] hover:text-red-400 transition-colors"
                    aria-label="Eliminar imagen"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
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
                {/* File input oculto para imágenes */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
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
                  {/* Botón adjuntar imagen (Tarea AUD.5) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || !hasConsented}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                      imageDataUrl
                        ? 'text-[var(--primary-color)] bg-[var(--primary-color)]/10'
                        : 'text-[var(--muted-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10'
                    } disabled:opacity-50`}
                    aria-label="Adjuntar imagen"
                    title={currentLanguage === 'es' ? 'Adjuntar imagen' : 'Attach image'}
                  >
                    <Paperclip size={18} />
                  </button>

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
                      aria-label="Dictado por voz"
                      title={isListening ? 'Detener dictado' : 'Dictado por voz'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !imageDataUrl) || !hasConsented}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-[var(--inner-circle-text-color)] shadow-lg transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-30"
                    aria-label="Enviar"
                  >
                    <Send size={18} className="translate-x-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
