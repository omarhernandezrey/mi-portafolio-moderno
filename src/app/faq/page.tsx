import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes (FAQ)',
  description: 'Respuestas a las dudas más comunes sobre mis servicios de desarrollo web.',
};

const FAQS = [
  {
    q: '¿Cuánto cuesta una landing page?',
    a: 'El rango para una landing page estática optimizada para conversión está entre $300 y $600 USD, dependiendo de la complejidad y las integraciones requeridas.'
  },
  {
    q: '¿Cuánto tardas en entregar un proyecto?',
    a: 'Un MVP (Producto Mínimo Viable) suele tardar entre 4 y 6 semanas. Una landing page simple puede estar lista en 3 a 7 días.'
  },
  {
    q: '¿Qué métodos de pago aceptas?',
    a: 'Acepto PayPal, Wise, Nequi (para Colombia) y USDT (Binance Pay). Para proyectos cerrados pido un 50% de anticipo para iniciar.'
  },
  {
    q: '¿Trabajas con plantillas como WordPress o Wix?',
    a: 'No, me especializo en desarrollo a medida con Next.js y React. Esto garantiza sitios mucho más rápidos, seguros y escalables que los hechos con plantillas.'
  },
  {
    q: '¿Puedes hacer el diseño UI/UX también?',
    a: 'Sí, manejo Figma y puedo encargarme de toda la interfaz centrada en la experiencia del usuario y la conversión de negocio.'
  },
  {
    q: '¿El hosting y el dominio están incluidos?',
    a: 'Te asesoro para configurar el mejor servicio a tu nombre (usualmente Vercel o AWS), pero el costo del dominio y hosting corre por cuenta del cliente para que siempre mantengas el control total de tus activos.'
  },
  {
    q: '¿Ofreces garantía post-lanzamiento?',
    a: 'Sí, incluyo 30 días de soporte técnico gratuito para corregir cualquier error que pueda surgir tras el despliegue.'
  },
  {
    q: '¿Trabajas en remoto o presencial?',
    a: 'Trabajo principalmente de forma remota para clientes de todo el mundo. Si estás en Bogotá, podemos coordinar reuniones híbridas si el proyecto lo requiere.'
  },
  {
    q: '¿Entregas el código fuente?',
    a: 'Totalmente. Una vez finalizado el pago total, la propiedad intelectual y el código fuente pasan a ser tuyos.'
  },
  {
    q: '¿Haces mantenimiento mensual?',
    a: 'Sí, tengo paquetes de mantenimiento desde $100 USD al mes que incluyen backups, actualizaciones de seguridad y pequeños cambios.'
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto text-[var(--text-color)]">
      <h1 className="text-4xl font-bold mb-4 text-[var(--primary-color)]">Preguntas Frecuentes</h1>
      <p className="text-[var(--muted-color)] mb-12 italic">Todo lo que necesitas saber antes de empezar a trabajar conmigo.</p>
      
      <div className="space-y-8">
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-[var(--muted-color)]/20 pb-8 last:border-none">
            <h2 className="text-xl font-semibold mb-3 flex items-start gap-4">
              <span className="text-[var(--accent-color)] font-black text-2xl leading-none">?</span>
              {faq.q}
            </h2>
            <p className="text-[var(--muted-color)] leading-relaxed pl-8">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] text-white text-center shadow-xl">
        <h3 className="text-2xl font-bold mb-4">¿Tienes otra pregunta?</h3>
        <p className="mb-8 opacity-90">Escríbeme por el chat o envíame un mensaje directo.</p>
        <div className="flex justify-center gap-4">
          <a 
            href={`https://wa.me/573219052878`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-[var(--primary-color)] px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
          >
            WhatsApp Directo
          </a>
        </div>
      </div>
    </main>
  );
}
