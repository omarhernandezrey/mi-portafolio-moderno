import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades } from '@/data/ciudades';
import OpenChatButton from '@/components/shared/OpenChatButton';
import { Bot, CheckCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/shared/Footer';

interface Props {
  params: Promise<{
    servicio: string;
    ciudad: string;
  }>;
}

export async function generateStaticParams() {
  const paths = [];
  for (const servicio of serviciosProgramaticos) {
    for (const ciudad of ciudades) {
      paths.push({
        servicio: servicio.id,
        ciudad: ciudad.id,
      });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad) return {};

  const title = servicio.h1.replace('{ciudad}', ciudad.name);
  const description = servicio.description
    .replace('{ciudad}', ciudad.name)
    .replace('{country}', ciudad.country);

  return {
    title,
    description,
    alternates: {
      canonical: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    },
    openGraph: {
      title,
      description,
      url: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(servicio.name + ' en ' + ciudad.name)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(servicio.name + ' en ' + ciudad.name)}`],
    },
  };
}

export default async function ServicioCiudadPage({ params }: Props) {
  const { servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad) {
    notFound();
  }

  const h1 = servicio.h1.replace('{ciudad}', ciudad.name);
  const h2 = servicio.h2.replace('{ciudad}', ciudad.name);
  const description = servicio.description
    .replace('{ciudad}', ciudad.name)
    .replace('{country}', ciudad.country);

  const initialChatMessage = `Hola Omar, vengo de la página de ${servicio.name} en ${ciudad.name}. Me gustaría saber más sobre este servicio.`;

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent leading-tight">
              {h1}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[var(--muted-color)] mb-8">
              {h2}
            </p>
            <p className="text-lg leading-relaxed mb-10 text-[var(--text-color)]/80">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <OpenChatButton 
                message={initialChatMessage}
                className="px-8 py-4 bg-[var(--primary-color)] text-white rounded-2xl font-black shadow-lg shadow-[var(--primary-color)]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Solicitar presupuesto en {ciudad.name}
                <ArrowRight size={20} />
              </OpenChatButton>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary-color)] rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-color)] rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-[var(--secondary-background-color)]/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">
              ¿Por qué elegir {servicio.name} para tu negocio en {ciudad.name}?
            </h2>
            
            <div className="grid gap-8">
              <div className="flex gap-4 p-6 rounded-3xl bg-[var(--background-color)] border border-[var(--primary-color)]/10 shadow-xl">
                <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Presencia Local Garantizada</h3>
                  <p className="text-[var(--muted-color)]">
                    Entendemos el mercado de {ciudad.name} y adaptamos nuestras soluciones tecnológicas para que conecten con tus clientes locales en {ciudad.country}.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-3xl bg-[var(--background-color)] border border-[var(--primary-color)]/10 shadow-xl">
                <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Tecnología de Vanguardia</h3>
                  <p className="text-[var(--muted-color)]">
                    No solo entregamos código; entregamos ventajas competitivas. Desde {servicio.id === 'chatbot-ia' ? 'agentes inteligentes' : 'aplicaciones ultra-rápidas'} hasta optimización extrema para móviles en {ciudad.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[var(--muted-color)] mb-8 italic">
                &quot;Mi misión es que las empresas de {ciudad.name} no solo tengan una página web, sino una máquina de ventas automatizada.&quot;
              </p>
              <OpenChatButton 
                message={initialChatMessage}
                className="text-[var(--primary-color)] font-black hover:underline underline-offset-8 decoration-2"
              >
                Hablemos sobre tu proyecto en {ciudad.name} &rarr;
              </OpenChatButton>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic SEO Section to avoid duplication penalties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-invert prose-p:text-[var(--text-color)]/80">
            <h2 className="text-2xl font-bold mb-6">Expertos en {servicio.name} para {ciudad.country}</h2>
            <p>
              En {ciudad.name}, la competencia digital crece día a día. Ya sea que busques {servicio.keywords[0]} o {servicio.keywords[1]}, es fundamental contar con un socio tecnológico que hable tu mismo idioma y entienda tus desafíos en {ciudad.name}.
            </p>
            <p>
              Nuestra metodología de trabajo se enfoca en resultados tangibles. Implementamos {servicio.name} pensando en el ROI, asegurando que cada línea de código escrita aporte al crecimiento de tu marca en {ciudad.country}.
            </p>
            <p>
              Desde el centro de {ciudad.name} hasta las zonas comerciales más importantes, apoyamos a emprendedores locales a digitalizarse con éxito. No permitas que tu negocio se quede atrás en la era de la inteligencia artificial.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
