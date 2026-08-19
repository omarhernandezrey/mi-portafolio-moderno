import React from 'react';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { HelpCircle, MessageCircle, ChevronRight, Zap, Shield, Wallet, Clock, UserCheck, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Footer from '@/components/shared/Footer';

const BASE_URL = 'https://omarhernandezrey.com';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'FAQ | Freelance Web Developer Colombia',
          description: 'How much does a website cost in Colombia? How long does it take? How do payments work? Clear answers on pricing, timelines, and the freelance process.',
          path: '/faq',
          locale: 'en',
          ogSubtitle: 'Freelance Web Developer Colombia',
          keywords: [
            'freelance web developer colombia faq',
            'how much does a website cost colombia',
            'how long does a website take',
            'how to hire a freelance developer',
            'web development pricing 2026',
          ],
        }
      : {
          title: 'Preguntas Frecuentes | Desarrollador Web Colombia',
          description: '¿Cuánto cuesta un sitio web en Colombia? ¿Cuánto tarda? ¿Cómo se paga? Respuestas claras sobre precios, tiempos y proceso de trabajo freelance.',
          path: '/faq',
          locale: 'es',
          ogSubtitle: 'Desarrollador Web Freelance Colombia',
          keywords: [
            'preguntas frecuentes desarrollador web colombia',
            'cuanto cuesta sitio web colombia',
            'cuanto tarda pagina web',
            'como contratar programador freelance',
            'precios desarrollo web 2026',
            'desarrollador web freelance colombia preguntas',
          ],
        }
  );
}

const CATEGORIES_ES = [
  {
    title: 'Precios & Pagos',
    icon: <Wallet size={20} />,
    faqs: [
      {
        q: '¿Cuánto cuesta una landing page o sitio web en Colombia?',
        a: 'Las landing pages profesionales van desde $1,500 USD (COP 1.2M–4M). Sitios corporativos desde $6,000 USD (COP 4M–14M). E-commerce desde $4,000 USD (COP 3.5M–12M). El precio final depende de funcionalidades: integraciones de pago, formularios avanzados, panel de administración, etc. Usa mi calculadora para obtener un estimado en 2 minutos.'
      },
      {
        q: '¿Qué métodos de pago aceptas para proyectos en Colombia y USA?',
        a: 'Para clientes en USA y en el exterior: PayPal (USD/EUR). Para Colombia: Wompi (tarjetas, PSE, Nequi, Bancolombia) y transferencias bancarias. El esquema estándar es 50% al iniciar el proyecto y 50% al entregar.'
      },
      {
        q: '¿Ofreces mantenimiento web después de entregar el proyecto?',
        a: 'Sí. Tengo planes de mantenimiento mensual desde $500 USD. Incluyen actualizaciones de seguridad, backups semanales, monitoreo de uptime 24/7 y soporte técnico prioritario por email con respuesta en 24h.'
      },
      {
        q: '¿Cuánto cobra un desarrollador web freelance en Colombia vs una agencia?',
        a: 'Un freelance senior en Colombia cobra un 30-50% menos que una agencia local, manteniendo la misma calidad técnica. La razón: sin costos de oficina, account managers ni estructura corporativa. Todo el presupuesto va al desarrollo real de tu proyecto.'
      },
    ]
  },
  {
    title: 'Tecnología & Proceso',
    icon: <Zap size={20} />,
    faqs: [
      {
        q: '¿Qué tecnologías usas para desarrollar sitios web y apps?',
        a: 'Desarrollo exclusivamente con Next.js 15+ y React para el frontend, Node.js para el backend y PostgreSQL/Supabase para bases de datos. Esta combinación garantiza los mejores resultados en Core Web Vitals, SEO técnico y escalabilidad. Supera a cualquier CMS tradicional en rendimiento y flexibilidad.'
      },
      {
        q: '¿El diseño web está incluido en el precio del proyecto?',
        a: 'Sí, el diseño está incluido. El proceso integra una fase de diseño en Figma centrada en conversión y experiencia de usuario. Creamos mockups para tu aprobación antes de escribir una sola línea de código. Puedes solicitar ajustes hasta quedar 100% satisfecho.'
      },
      {
        q: '¿El código fuente del proyecto me pertenece a mí?',
        a: 'Sí. Al completar el pago total, se transfieren todos los derechos del código fuente. El software es un activo de tu empresa. Te entrego acceso completo a los repositorios en GitHub y acceso admin a todos los servicios (hosting, dominio, base de datos).'
      },
    ]
  },
  {
    title: 'Tiempos & Logística',
    icon: <Clock size={20} />,
    faqs: [
      {
        q: '¿Cuánto tarda en estar listo mi sitio web o aplicación?',
        a: 'Landing pages: 3-7 días hábiles. Sitios corporativos (5-10 páginas): 2-4 semanas. E-commerce: 3-6 semanas. Aplicaciones web a medida: 4-8 semanas. Los tiempos dependen de la complejidad y de qué tan rápido revisas y apruebas los entregables.'
      },
      {
        q: '¿Quién controla el hosting y el dominio de mi sitio?',
        a: 'Tú. Configuramos todo a tu nombre: dominio, hosting en Vercel/AWS/Google Cloud y base de datos. Recibes acceso administrador completo desde el día 1. No dependes de mí para renovaciones ni cambios de proveedor en el futuro.'
      },
      {
        q: '¿Ofreces garantía si algo falla después de lanzar el proyecto?',
        a: 'Sí. Cada proyecto incluye 30 días de garantía post-lanzamiento sin costo adicional. Durante ese periodo resuelvo cualquier bug técnico de forma prioritaria. Después del período de garantía, puedo continuar el soporte mediante un plan de mantenimiento mensual.'
      },
    ]
  },
  {
    title: 'Colombia & USA',
    icon: <Globe size={20} />,
    faqs: [
      {
        q: '¿Puedes hacer proyectos para clientes fuera de Colombia, como en USA?',
        a: 'Sí. Atiendo clientes en USA, Canadá, España y toda LATAM 100% en remoto. Trabajo cómodamente en zonas horarias EST, CST y PST. Me comunico en español e inglés por Slack, email y videollamadas. He entregado más de 10 proyectos para clientes en USA los últimos 3 años.'
      },
      {
        q: '¿Cuántos proyectos has entregado y cuánta experiencia tienes?',
        a: 'Más de 30 proyectos entregados en 5+ años: landing pages, e-commerce, aplicaciones web y sistemas de automatización para empresas en Colombia, USA y LATAM. Graduado en Ingeniería de Software del Politécnico Grancolombiano con certificaciones adicionales en React, Node.js y Cloud Architecture.'
      },
    ]
  },
];

const CATEGORIES_EN = [
  {
    title: 'Pricing & Payments',
    icon: <Wallet size={20} />,
    faqs: [
      {
        q: 'How much does a landing page or website cost in Colombia?',
        a: 'Professional landing pages start at $1,500 USD. Corporate websites start at $6,000 USD. E-commerce stores start at $4,000 USD. The final price depends on features: payment integrations, advanced forms, admin panels, etc. Use my calculator to get an estimate in 2 minutes.'
      },
      {
        q: 'What payment methods do you accept for projects in the US and abroad?',
        a: 'For clients in the US and abroad: PayPal (USD/EUR). For Colombia: Wompi (cards, PSE, Nequi, Bancolombia) and bank transfers. The standard schedule is 50% to start the project and 50% on delivery.'
      },
      {
        q: 'Do you offer web maintenance after delivering the project?',
        a: 'Yes. I offer monthly maintenance plans starting at $500 USD. They include security updates, weekly backups, 24/7 uptime monitoring, and priority technical support by email with a 24h response time.'
      },
      {
        q: 'How much does a freelance web developer in Colombia charge vs. an agency?',
        a: 'A senior freelancer in Colombia charges 30-50% less than a local agency while maintaining the same technical quality. The reason: no office overhead, account managers, or corporate structure — the full budget goes into actually building your project.'
      },
    ]
  },
  {
    title: 'Technology & Process',
    icon: <Zap size={20} />,
    faqs: [
      {
        q: 'What technologies do you use to build websites and apps?',
        a: 'I build exclusively with Next.js 15+ and React on the frontend, Node.js on the backend, and PostgreSQL/Supabase for databases. This stack delivers the best results in Core Web Vitals, technical SEO, and scalability — it outperforms any traditional CMS in speed and flexibility.'
      },
      {
        q: 'Is web design included in the project price?',
        a: 'Yes, design is included. The process includes a Figma design phase focused on conversion and user experience. We create mockups for your approval before writing a single line of code, and you can request adjustments until you\'re fully satisfied.'
      },
      {
        q: 'Do I own the source code of the project?',
        a: 'Yes. Once payment is completed in full, all source code rights are transferred to you. The software is an asset of your company — you get full access to the GitHub repositories and admin access to every service (hosting, domain, database).'
      },
    ]
  },
  {
    title: 'Timelines & Logistics',
    icon: <Clock size={20} />,
    faqs: [
      {
        q: 'How long will my website or app take to be ready?',
        a: 'Landing pages: 3-7 business days. Corporate sites (5-10 pages): 2-4 weeks. E-commerce: 3-6 weeks. Custom web apps: 4-8 weeks. Timelines depend on complexity and how quickly you review and approve deliverables.'
      },
      {
        q: 'Who controls the hosting and domain for my site?',
        a: 'You do. Everything is set up under your name: domain, hosting on Vercel/AWS/Google Cloud, and database. You get full admin access from day one — you\'re never dependent on me for renewals or provider changes down the line.'
      },
      {
        q: 'Do you offer a guarantee if something breaks after launch?',
        a: 'Yes. Every project includes a 30-day post-launch guarantee at no extra cost. During that period, I fix any technical bug as a priority. After the guarantee period, I can continue support through a monthly maintenance plan.'
      },
    ]
  },
  {
    title: 'Colombia & USA',
    icon: <Globe size={20} />,
    faqs: [
      {
        q: 'Can you take on projects for clients outside Colombia, like in the US?',
        a: 'Yes. I work with clients in the US, Canada, Spain, and across LATAM, 100% remote. I work comfortably across EST, CST, and PST time zones, communicating in both English and Spanish via Slack, email, and video calls. I\'ve delivered 10+ projects for US-based clients over the last 3 years.'
      },
      {
        q: 'How many projects have you delivered, and how much experience do you have?',
        a: '30+ projects delivered over 5+ years: landing pages, e-commerce stores, web applications, and automation systems for companies in Colombia, the US, and LATAM. I hold a Software Engineering degree from Politécnico Grancolombiano plus additional certifications in React, Node.js, and Cloud Architecture.'
      },
    ]
  },
];

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const CATEGORIES = isEn ? CATEGORIES_EN : CATEGORIES_ES;
  const allFaqs = CATEGORIES.flatMap(c => c.faqs);
  const pageUrl = isEn ? `${BASE_URL}/en/faq` : `${BASE_URL}/faq`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": isEn ? "FAQ — Freelance Web Developer Colombia" : "Preguntas Frecuentes — Desarrollador Web Freelance Colombia",
    "inLanguage": isEn ? "en" : "es",
    "mainEntity": allFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "Inicio", "item": isEn ? `${BASE_URL}/en` : BASE_URL },
      { "@type": "ListItem", "position": 2, "name": isEn ? "FAQ" : "Preguntas Frecuentes", "item": pageUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      <main className="flex-1 py-32 px-[var(--grid-margin)]">
        <JsonLd data={faqSchema} />
        <JsonLd data={breadcrumbSchema} />

        <div className="max-w-5xl mx-auto space-y-24">

          {/* Section Header */}
          <div className="text-center space-y-6">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              Customer Support Center
            </div>
            <h1 className="font-display italic text-5xl md:text-7xl font-medium text-white-custom tracking-tight leading-none">
              {isEn ? (
                <>Protocols & <br /><span className="text-primary">Inquiries</span></>
              ) : (
                <>Protocolos y <br /><span className="text-primary">Consultas</span></>
              )}
            </h1>
            <p className="text-text-muted text-sm font-medium max-w-2xl mx-auto opacity-70 italic">
              {isEn
                ? "Direct answers on pricing, timelines, technologies, and the work process. Freelance web developer available for Colombia and the US."
                : "Respuestas directas sobre precios, tiempos, tecnologías y proceso de trabajo. Desarrollador web freelance disponible para Colombia y USA."}
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 gap-20">
            {CATEGORIES.map((category, idx) => (
              <section key={idx} className="space-y-12">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                    {category.icon}
                  </div>
                  <h2 className="font-display italic text-2xl font-medium text-white-custom tracking-tight leading-none">{category.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {category.faqs.map((faq, i) => (
                    <div key={i} className="group space-y-4">
                      <h3 className="text-lg font-bold text-white-custom group-hover:text-primary transition-colors flex items-start gap-3 leading-tight italic">
                        <ChevronRight size={18} className="text-primary mt-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                        {faq.q}
                      </h3>
                      <p className="text-sm text-text-muted/70 font-medium leading-relaxed pl-8 border-l border-white/5 group-hover:border-primary/20 transition-colors italic">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Global CTA */}
          <section className="bg-card-bg rounded-[32px] md:rounded-[60px] border border-white/5 p-8 md:p-12 lg:p-20 shadow-2xl relative overflow-hidden text-center group hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-30" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
              <div className="mx-auto w-20 h-20 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <HelpCircle size={40} />
              </div>

              <div className="space-y-4">
                <h2 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
                  {isEn ? "Don't see your question here?" : "¿Tu pregunta no está aquí?"}
                </h2>
                <p className="text-text-muted text-sm font-medium italic opacity-70 leading-relaxed">
                  {isEn
                    ? "Every project is different. Tell me your situation and I'll give you a personalized answer. Free initial consultation, no obligation."
                    : "Cada proyecto es diferente. Cuéntame tu situación y te doy una respuesta personalizada. Consulta inicial gratis, sin compromiso."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  href="/calculadora"
                  className="bg-white/5 hover:bg-white/10 text-white-custom px-10 py-5 rounded-[24px] border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                >
                  {isEn ? "Calculate Budget" : "Calcular Presupuesto"}
                </Link>
                <a
                  href="https://wa.me/573219052878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:scale-105 text-background px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={16} fill="currentColor" />
                  {isEn ? "Direct WhatsApp" : "WhatsApp Directo"}
                </a>
              </div>
            </div>
          </section>

          {/* Global Trust Bar */}
          <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-20 border-t border-white/5">
            <TrustItem icon={<Shield size={14} />} text={isEn ? "Secure Protocol" : "Protocolo Seguro"} />
            <TrustItem icon={<UserCheck size={14} />} text={isEn ? "Verified Identity" : "Identidad Verificada"} />
            <TrustItem icon={<Clock size={14} />} text={isEn ? "High Availability" : "Alta Disponibilidad"} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="font-mono-label flex items-center gap-2 text-[0.55rem] text-text-muted">
      {icon}
      {text}
    </div>
  );
}
