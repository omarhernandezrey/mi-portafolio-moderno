"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Download, Loader2, Mail } from 'lucide-react';
import NavbarLogic from '@/components/ui/NavbarLogic';
import Footer from '@/components/shared/Footer';

const magnets = [
  {
    id: 'checklist',
    title: 'Checklist: ¿Qué pedirle a un desarrollador?',
    description: 'Evita estafas y sorpresas. Los 15 puntos clave que debes exigir antes de firmar cualquier contrato de desarrollo.',
    icon: <CheckCircle className="text-green-500" size={32} />,
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'guia-precios',
    title: 'Guía: Precios Desarrollo Web LATAM 2026',
    description: '¿Cuánto cuesta realmente una web hoy? Desglosamos precios por tipo de proyecto y seniority en el mercado latinoamericano.',
    icon: <FileText className="text-blue-500" size={32} />,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'plantilla-brief',
    title: 'Plantilla: Brief de proyecto digital',
    description: 'Ahorra semanas de ida y vuelta. La plantilla exacta que uso con mis clientes para definir el alcance sin ambigüedades.',
    icon: <Download className="text-purple-500" size={32} />,
    color: 'from-purple-500/20 to-pink-500/20',
  }
];

export default function RecursosPage() {
  const [email, setEmail] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (magnetId: string) => {
    if (!email || !email.includes('@')) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    setError(null);
    setLoadingId(magnetId);

    try {
      const res = await fetch('/api/leadmagnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnetId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setSuccessId(magnetId);
      setTimeout(() => setSuccessId(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
      <NavbarLogic />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent"
          >
            Recursos Gratuitos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--muted-color)]"
          >
            Herramientas y guías prácticas para ayudarte a tomar mejores decisiones tecnológicas en tu negocio o carrera.
          </motion.p>
        </header>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-300"></div>
            <div className="relative flex items-center bg-[var(--secondary-background-color)] rounded-2xl p-2 border border-[var(--primary-color)]/10">
              <Mail className="ml-4 text-[var(--muted-color)]" size={20} />
              <input
                type="email"
                placeholder="Tu mejor email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-lg"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {magnets.map((magnet, idx) => (
            <motion.div
              key={magnet.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative overflow-hidden rounded-[2.5rem] border border-[var(--primary-color)]/10 bg-gradient-to-br ${magnet.color} p-8 flex flex-col h-full shadow-xl backdrop-blur-sm`}
            >
              <div className="mb-6 p-4 bg-[var(--background-color)] rounded-3xl w-fit shadow-inner">
                {magnet.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 leading-tight">{magnet.title}</h3>
              <p className="text-[var(--muted-color)] mb-8 flex-1 leading-relaxed">
                {magnet.description}
              </p>
              
              <button
                onClick={() => handleDownload(magnet.id)}
                disabled={loadingId !== null || successId === magnet.id}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  successId === magnet.id
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--primary-color)] text-white hover:brightness-110 active:scale-95 shadow-lg shadow-[var(--primary-color)]/20'
                } disabled:opacity-50`}
              >
                {loadingId === magnet.id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : successId === magnet.id ? (
                  <>
                    <CheckCircle size={20} />
                    ¡Enviado! Revisa tu inbox
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Obtener ahora (PDF)
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <section className="mt-32 max-w-4xl mx-auto bg-gradient-to-br from-[var(--secondary-background-color)] to-[var(--background-color)] rounded-[3rem] p-12 border border-[var(--primary-color)]/5 text-center shadow-2xl">
          <h2 className="text-3xl font-black mb-6">¿Buscas algo más personalizado?</h2>
          <p className="text-xl text-[var(--muted-color)] mb-10 leading-relaxed">
            Usa mi calculadora de presupuestos para obtener una estimación inmediata basada en tus requerimientos específicos.
          </p>
          <a 
            href="/calculadora" 
            className="inline-flex items-center gap-3 bg-[var(--text-color)] text-[var(--background-color)] px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-xl"
          >
            Ir a la calculadora
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              →
            </motion.span>
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
