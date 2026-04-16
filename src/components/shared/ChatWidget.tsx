"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Phone, Calendar } from 'lucide-react';
import { nanoid } from 'nanoid';
import { sendChatMessage } from '@/services/chatService';
import { useTranslation } from 'react-i18next';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Inicializar sessionId desde localStorage
  useEffect(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = nanoid();
      localStorage.setItem('chatbot_session_id', id);
    }
    setSessionId(id);
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
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
  };

  const handleQuickAction = (actionKey: string) => {
    const message = t(`chatbot.quickActions.${actionKey}`);
    handleSubmit(undefined, message);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg focus:outline-none"
        aria-label={t('chatbot.ariaOpen')}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Panel de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--muted-color)] bg-[var(--background-color)] shadow-2xl sm:max-h-[80vh] sm:w-[90vw] md:w-[380px]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t('chatbot.title')}</h3>
                  <p className="text-[10px] opacity-80">{t('chatbot.status')}</p>
                </div>
              </div>
              <button 
                onClick={toggleChat} 
                className="rounded-full p-1 hover:bg-white/10"
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
                            className="rounded-xl border border-[var(--primary-color)] px-4 py-2 text-left text-xs text-[var(--primary-color)] transition-colors hover:bg-[var(--primary-color)] hover:text-white"
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
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-[var(--primary-color)] text-white rounded-br-none' 
                        : 'bg-[var(--white-color)] border border-[var(--muted-color)] text-[var(--text-color)] rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Botones de acción dinámicos */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.handoffUrl && (
                        <a 
                          href={msg.handoffUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-[10px] text-white transition-colors hover:bg-green-600"
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
                          className="flex items-center gap-2 rounded-full bg-blue-500 px-3 py-1 text-[10px] text-white transition-colors hover:bg-blue-600"
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
                    <div className="animate-pulse bg-[var(--white-color)] border border-[var(--muted-color)] rounded-2xl px-4 py-2 text-[10px] text-[var(--muted-color)]">
                      {t('chatbot.loading')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer (Input) */}
            <div className="border-t border-[var(--muted-color)] p-4">
              <form 
                className="flex items-center gap-2"
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 rounded-full border border-[var(--muted-color)] bg-[var(--white-color)] px-4 py-2 text-sm focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-color)]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-color)] text-white disabled:opacity-50 transition-transform active:scale-95"
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
