"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { nanoid } from 'nanoid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Inicializar sessionId desde localStorage
  useEffect(() => {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = nanoid();
      localStorage.setItem('chatbot_session_id', id);
    }
    setSessionId(id);
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    console.log('Sending to session:', sessionId);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);
    // Próxima tarea: Conexión con API
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg focus:outline-none"
        aria-label="Abrir chat"
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
                  <h3 className="text-sm font-bold">Asistente de Omar</h3>
                  <p className="text-[10px] opacity-80">En línea ahora</p>
                </div>
              </div>
              <button onClick={toggleChat} className="rounded-full p-1 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Body (Messages) */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {messages.length === 0 && !isLoading && (
                   <div className="text-center text-sm text-[var(--muted-color)] mt-10">
                     Hola 👋 Soy el asistente de Omar. ¿En qué puedo ayudarte hoy?
                   </div>
                )}
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-[var(--primary-color)] text-white rounded-br-none' 
                        : 'bg-[var(--white-color)] border border-[var(--muted-color)] text-[var(--text-color)] rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="animate-pulse bg-[var(--white-color)] border border-[var(--muted-color)] rounded-2xl px-4 py-2 text-[10px]">
                      Escribiendo...
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
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-full border border-[var(--muted-color)] bg-[var(--white-color)] px-4 py-2 text-sm focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-color)]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-color)] text-white disabled:opacity-50"
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
