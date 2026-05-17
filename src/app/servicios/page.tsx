import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Bot, Zap, ShoppingCart, LineChart, Target, Smartphone, Search, Link2, Wrench, MapPin, CheckCircle } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades } from '@/data/ciudades';
import OpenChatButton from '@/components/shared/OpenChatButton';

export const metadata: Metadata = {
  title: 'Servicios de Desarrollo Web y Software | Colombia & Remoto',
  description: 'Contratar desarrollador web freelance en Colombia. Desarrollo web, chatbots con IA, e-commerce, SEO técnico y automatización. Full Stack con React y Next.js. Proyectos desde $500 USD.',
  alternates: {
    canonical: 'https://omarhernandezrey.com/servicios',
  },
  keywords: [
    'contratar desarrollador web colombia',
    'programador freelance colombia',
    'desarrollador full stack colombia',
    'desarrollo web profesional colombia',
    'chatbot ia colombia',
    'e-commerce colombia',
    'automatizacion de procesos colombia',
    'seo tecnico colombia',
    'full stack developer colombia',
    'ingeniero de software freelance',
    'aplicaciones web colombia',
    'react developer colombia',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://omarhernandezrey.com/servicios',
    siteName: 'Omar Hernández Rey Portfolio',
    title: 'Servicios de Desarrollo Web y Software | Omar Hernández Rey',
    description: 'Desarrollador full stack freelance en Colombia. Web apps, chatbots IA, e-commerce, SEO. Colombia y remoto USA/LATAM. Desde $500 USD.',
    images: [
      {
        url: 'https://omarhernandezrey.com/api/og?title=Servicios%20de%20Desarrollo%20Web&subtitle=Colombia%20%26%20Remoto%20%E2%80%94%20Desde%20%24500%20USD',
        width: 1200,
        height: 630,
        alt: 'Servicios de Desarrollo Web — Omar Hernández Rey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servicios de Desarrollo Web | Omar Hernández Rey',
    description: 'Desarrollador full stack freelance en Colombia. Web, IA, e-commerce y más. Desde $500 USD.',
    images: ['https://omarhernandezrey.com/api/og?title=Servicios%20de%20Desarrollo%20Web&subtitle=Colombia%20%26%20Remoto%20%E2%80%94%20Desde%20%24500%20USD'],
  },
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'desarrollo-web': <Code2 size={28} />,
  'chatbot-ia': <Bot size={28} />,
  'automatizacion': <Zap size={28} />,
  'e-commerce': <ShoppingCart size={28} />,
  'consultoria-tech': <LineChart size={28} />,
  'landing-page': <Target size={28} />,
  'aplicacion-movil': <Smartphone size={28} />,
  'seo-tecnico': <Search size={28} />,
  'integracion-apis': <Link2 size={28} />,
  'mantenimiento-web': <Wrench size={28} />,
};

const COLOMBIA_CITIES = ['bogota', 'medellin', 'cali', 'barranquilla', 'bucaramanga'];

export default function ServiciosPage() {
  const ciudadesPrincipales = ciudades.filter(c => COLOMBIA_CITIES.includes(c.id));

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Servicios de Desarrollo Web y Software — Omar Hernández Rey',
    'description': 'Servicios profesionales de desarrollo web, chatbots con IA, e-commerce y más para Colombia y LATAM.',
    'url': 'https://omarhernandezrey.com/servicios',
    'numberOfItems': serviciosProgramaticos.length,
    'itemListElement': serviciosProgramaticos.map((s, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': s.name,
      'description': s.description.replace('{ciudad}', 'Colombia').replace('{country}', 'Colombia'),
      'url': `https://omarhernandezrey.com/servicios/${s.id}/bogota`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://omarhernandezrey.com' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Servicios', 'item': 'https://omarhernandezrey.com/servicios' },
    ],
  };

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://omarhernandezrey.com/servicios#service-catalog',
    'name': 'Omar Hernández Rey — Servicios de Desarrollo Web Freelance',
    'url': 'https://omarhernandezrey.com/servicios',
    'telephone': '+573219052878',
    'priceRange': '$$-$$$',
    'areaServed': ['CO', 'US', 'MX', 'AR', 'CL', 'PE'],
    'provider': {
      '@type': 'Person',
      '@id': 'https://omarhernandezrey.com/#person',
    },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Servicios de Desarrollo Web',
      'itemListElement': serviciosProgramaticos.map(s => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': s.name,
          'description': s.description.replace('{ciudad}', 'Colombia').replace('{country}', 'Colombia'),
          'url': `https://omarhernandezrey.com/servicios/${s.id}/bogota`,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={professionalServiceSchema} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5 bg-card-bg/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[15%] left-[5%] w-80 h-80 bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-accent/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              Desarrollador Web Freelance · Colombia & Remoto
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white-custom tracking-tighter leading-[0.9] italic">
              Servicios de<br />
              <span className="text-primary">Desarrollo Web</span><br />
              y Software
            </h1>
            <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl leading-relaxed opacity-80">
              Soy Omar Hernández, desarrollador full stack freelance en Colombia. Creo webs, apps y chatbots con IA para empresas y emprendedores que quieren crecer digitalmente. Disponible para proyectos en Colombia y remoto para USA y LATAM.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['React & Next.js', 'Node.js', 'PostgreSQL', 'IA & Chatbots', 'SEO Técnico'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-text-muted">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <OpenChatButton
                message="Hola Omar, vengo de la página de servicios. Quiero saber más sobre lo que ofreces."
                className="inline-flex items-center gap-3 bg-primary text-background px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                Consulta Gratis
                <ArrowRight size={16} />
              </OpenChatButton>
              <Link
                href="#servicios"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-[24px] border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:border-white/20 transition-all"
              >
                Ver todos los servicios
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-16 border-t border-white/5">
            {[
              { value: '+30', label: 'Proyectos entregados' },
              { value: '5+', label: 'Años de experiencia' },
              { value: '$500 USD', label: 'Desde por proyecto' },
              { value: '24h', label: 'Tiempo de respuesta' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary italic">{stat.value}</div>
                <div className="text-xs text-text-muted/60 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicios" className="py-24 md:py-32 bg-background">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Catálogo de servicios</p>
            <h2 className="text-3xl md:text-5xl font-black text-white-custom tracking-tighter italic">
              ¿Qué puedo hacer por tu negocio?
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto leading-relaxed opacity-70">
              Desde sitios web hasta sistemas de automatización con IA. Cada servicio está disponible para clientes en Colombia y remoto para USA y LATAM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosProgramaticos.map((servicio) => (
              <article key={servicio.id} className="group bg-card-bg rounded-[28px] border border-white/5 p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {SERVICE_ICONS[servicio.id] ?? <Code2 size={28} />}
                  </div>
                  <span className="text-[10px] font-black text-text-muted/40 uppercase tracking-wider">
                    {servicio.deliveryTime}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white-custom italic mb-3 group-hover:text-primary transition-colors">
                  {servicio.name}
                </h3>
                <p className="text-sm text-text-muted/70 leading-relaxed flex-1 mb-5">
                  {servicio.description.replace('{ciudad}', 'Colombia').replace('{country}', 'Colombia')}
                </p>

                <div className="space-y-2 mb-6">
                  {servicio.benefits.slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-muted/60">
                      <CheckCircle size={13} className="text-primary shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-primary/80 italic">{servicio.priceRange.split('(')[0].trim()}</span>
                  <Link
                    href={`/servicios/${servicio.id}/bogota`}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom transition-colors"
                  >
                    Ver servicio
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-24 border-t border-white/5 bg-card-bg/20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Cobertura</p>
            <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Trabajo con clientes en toda Colombia<br />
              <span className="text-primary">y en remoto para USA y LATAM</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto opacity-70 text-sm leading-relaxed">
              Puedes contratar mis servicios desde cualquier ciudad de Colombia. Trabajo 100% remoto, con videollamadas y comunicación por WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ciudadesPrincipales.map(ciudad => (
              <Link
                key={ciudad.id}
                href={`/servicios/desarrollo-web/${ciudad.id}`}
                className="group flex items-center gap-2 p-4 bg-card-bg rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors">{ciudad.name}</span>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-text-muted/40">
              También atiendo: Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales y toda Colombia.
              Remoto para: Miami, New York, Ciudad de México, Buenos Aires, Lima, Santiago.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-background">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Cómo trabajo</p>
            <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Proceso claro, resultados reales
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Consulta gratis', desc: 'Hablamos por videollamada o WhatsApp. Me cuentas tu proyecto y yo te explico cómo lo haría.' },
              { n: '02', title: 'Propuesta clara', desc: 'Recibes una propuesta detallada con alcance, tiempos y precio. Sin sorpresas.' },
              { n: '03', title: 'Desarrollo ágil', desc: 'Trabajo por sprints cortos. Ves el avance cada semana y puedes dar feedback constante.' },
              { n: '04', title: 'Entrega y soporte', desc: 'Entrego el proyecto listo para producción con documentación y soporte post-lanzamiento.' },
            ].map(step => (
              <div key={step.n} className="bg-card-bg rounded-2xl p-7 border border-white/5">
                <div className="text-5xl font-black text-primary/15 mb-5">{step.n}</div>
                <h3 className="text-lg font-black text-white-custom italic mb-3">{step.title}</h3>
                <p className="text-sm text-text-muted/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5 bg-card-bg/30">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white-custom tracking-tighter italic">
            ¿Listo para arrancar<br />
            <span className="text-primary">tu proyecto?</span>
          </h2>
          <p className="text-lg text-text-muted opacity-70 leading-relaxed">
            La consulta inicial es gratis y sin compromiso. Cuéntame tu idea y te digo en menos de 24 horas cómo puedo ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OpenChatButton
              message="Hola Omar, quiero contratar tus servicios de desarrollo web. Me gustaría agendar una consulta."
              className="inline-flex items-center gap-3 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              Agendar Consulta Gratis
              <ArrowRight size={16} />
            </OpenChatButton>
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-[28px] border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:border-white/20 transition-all"
            >
              Leer el blog técnico
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
