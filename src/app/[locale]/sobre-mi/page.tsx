import React from 'react';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, GraduationCap, Briefcase, Code2, CheckCircle, Sparkles, MapPin, ExternalLink, BookOpen, Wrench, ShoppingCart, Zap, Search, Target } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { OMAR_PROFILE } from '@/data/omarProfile';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'About Me | Full Stack Developer Colombia',
          description: 'Freelance Full Stack Developer with 5+ years of experience in React, Next.js, Node.js, and AI. Projects in Colombia and remote for US clients.',
          path: '/sobre-mi',
          locale: 'en',
          ogSubtitle: 'Full Stack Developer | Colombia',
          keywords: [
            'full stack developer colombia',
            'web developer bogota',
            'software engineer colombia',
            'react developer colombia',
            'freelance web developer colombia',
            'next.js developer colombia',
            'node.js developer colombia',
            'remote web development colombia',
          ],
        }
      : {
          title: 'Sobre Mí | Desarrollador Full Stack Colombia',
          description: 'Desarrollador Full Stack freelance con 5+ años de experiencia en React, Next.js, Node.js e IA. Proyectos en Colombia y remoto para clientes de USA.',
          path: '/sobre-mi',
          locale: 'es',
          ogSubtitle: 'Desarrollador Full Stack | Colombia',
          keywords: [
            'desarrollador full stack colombia',
            'programador web bogotá',
            'ingeniero de software colombia',
            'desarrollador react colombia',
            'desarrollador web freelance colombia',
            'desarrollador next.js colombia',
            'desarrollador node.js colombia',
            'desarrollo web colombia remoto',
            'programador freelance bogotá',
          ],
        }
  );
}

const educationDataEs = [
  {
    title: 'Ingeniero de Software',
    institution: 'Politécnico Grancolombiano',
    duration: '2023 - 2026',
    description: 'Próximo a graduarme como Ingeniero de Software del Politécnico Grancolombiano, donde he desarrollado sólidas competencias en desarrollo de software, arquitectura de sistemas y metodologías ágiles.',
    category: 'Universidad',
    certificate: null,
  },
  {
    title: 'Tecnólogo ADSI (SENA)',
    institution: 'Servicio Nacional de Aprendizaje (SENA)',
    duration: 'Finalizado el 29 de noviembre de 2022',
    description: 'Cursé y aprobé el programa de formación profesional integral en Análisis y Desarrollo de Sistemas de Información, donde desarrollé competencias en análisis, diseño, desarrollo, implementación y mantenimiento de sistemas informáticos.',
    category: 'Formación Técnica (SENA)',
    certificate: '/images/education/sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png',
  },
  {
    title: 'Bootcamp en Desarrollo Web Full Stack',
    institution: 'Talento Tech Bogotá - Ministerio TIC',
    duration: '159 horas (Finalizado el 27 de agosto de 2024)',
    description: 'Participé en el bootcamp de nivel avanzado en Desarrollo Web Full Stack, enfocado en adquirir competencias prácticas en tecnologías modernas para el desarrollo de aplicaciones web completas.',
    category: 'Talento Tech Bogotá',
    certificate: '/images/education/talento-tech/desarrolloWebFullStack_page-0001.jpg',
  },
  {
    title: 'Full Stack Developer Certified Specialist',
    institution: 'ITCertificate',
    duration: 'Finalizado el 31 de octubre de 2024',
    description: 'Obtuve la certificación como especialista certificado en desarrollo web Full Stack, demostrando habilidades avanzadas en el desarrollo y gestión de aplicaciones web completas.',
    category: 'ITCertificate',
    certificate: '/images/education/ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg',
  },
];

const educationDataEn = [
  {
    title: 'Software Engineering',
    institution: 'Politécnico Grancolombiano',
    duration: '2023 - 2026',
    description: 'About to graduate as a Software Engineer from Politécnico Grancolombiano, where I built solid skills in software development, systems architecture, and agile methodologies.',
    category: 'University',
    certificate: null,
  },
  {
    title: 'ADSI Technologist (SENA)',
    institution: 'Servicio Nacional de Aprendizaje (SENA)',
    duration: 'Completed November 29, 2022',
    description: 'Completed the comprehensive professional training program in Information Systems Analysis and Development, building skills in analysis, design, development, implementation, and maintenance of software systems.',
    category: 'Technical Training (SENA)',
    certificate: '/images/education/sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png',
  },
  {
    title: 'Full Stack Web Development Bootcamp',
    institution: 'Talento Tech Bogotá - Ministerio TIC',
    duration: '159 hours (Completed August 27, 2024)',
    description: 'Took part in the advanced-level Full Stack Web Development bootcamp, focused on gaining hands-on skills in modern technologies for building complete web applications.',
    category: 'Talento Tech Bogotá',
    certificate: '/images/education/talento-tech/desarrolloWebFullStack_page-0001.jpg',
  },
  {
    title: 'Full Stack Developer Certified Specialist',
    institution: 'ITCertificate',
    duration: 'Completed October 31, 2024',
    description: 'Earned certification as a Full Stack Developer Certified Specialist, demonstrating advanced skills in building and managing complete web applications.',
    category: 'ITCertificate',
    certificate: '/images/education/ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg',
  },
];

const projectsEs = [
  {
    title: 'Gestor de Tareas Profesional — TODO App con Patrones Avanzados de React',
    description: 'Aplicación moderna y completa de gestión de tareas construida con React 18 y Zustand. Incluye sistema avanzado de recordatorios con alertas de audio, dashboard estadístico, subtareas anidadas, etiquetado por colores, notas enriquecidas, timer Pomodoro, persistencia en localStorage, temas claro/oscuro, animaciones suaves y diseño responsive Mobile-First.',
    technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Vercel'],
    demo: 'https://57-curso-react-patrones-render.vercel.app',
    repository: 'https://github.com/omarhernandezrey/57-curso-react-patrones-render',
  },
  {
    title: 'Shopi — E-Commerce Full Stack con Autenticación Profesional',
    description: 'Plataforma e-commerce completa construida con React 18, Context API, React Router v6 y Tailwind CSS. Incluye sistema de autenticación JWT con validaciones profesionales, carrito de compras persistente, catálogo dinámico integrado con API pública, gestión de órdenes, panel de cuenta de usuario, y backend escalable con Express, Prisma ORM y PostgreSQL.',
    technologies: ['React 18', 'TypeScript', 'Tailwind CSS 3', 'React Router v6', 'Context API', 'Express.js', 'Prisma ORM', 'PostgreSQL', 'JWT', 'Zod', 'Jest', 'Vite', 'Vercel'],
    demo: 'https://56-curso-react-practico-clase-21.vercel.app/',
    repository: 'https://github.com/omarhernandezrey/56-curso-react-practico-clase-21',
  },
  {
    title: 'Diccionario Dev — Diccionario Técnico Web en Español',
    description: 'Plataforma completa de aprendizaje para desarrollo web con más de 200 términos técnicos en español. Incluye búsqueda inteligente, preview interactivo de código, módulos de entrenamiento (quizzes, entrevistas en vivo), sistema de autenticación JWT, panel de administración, API REST documentada con OpenAPI, extensiones para navegador y VS Code. Desplegado en Vercel con PostgreSQL, Redis y arquitectura escalable.',
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Redis', 'Tailwind CSS 4', 'Zod', 'JWT', 'Vitest', 'OpenAPI', 'Vercel'],
    demo: 'https://diccionario-dev-xi.vercel.app/',
    repository: 'https://github.com/omarhernandezrey/diccionario-dev',
  },
];

const projectsEn = [
  {
    title: 'Professional Task Manager — TODO App with Advanced React Patterns',
    description: 'A modern, full-featured task management app built with React 18 and Zustand. Includes an advanced reminder system with audio alerts, a stats dashboard, nested subtasks, color tagging, rich notes, a Pomodoro timer, localStorage persistence, light/dark themes, smooth animations, and a Mobile-First responsive design.',
    technologies: ['React', 'JavaScript', 'HTML', 'CSS', 'Vercel'],
    demo: 'https://57-curso-react-patrones-render.vercel.app',
    repository: 'https://github.com/omarhernandezrey/57-curso-react-patrones-render',
  },
  {
    title: 'Shopi — Full Stack E-Commerce with Professional Authentication',
    description: 'A complete e-commerce platform built with React 18, Context API, React Router v6, and Tailwind CSS. Includes JWT authentication with professional-grade validation, a persistent shopping cart, a dynamic catalog integrated with a public API, order management, a user account panel, and a scalable backend with Express, Prisma ORM, and PostgreSQL.',
    technologies: ['React 18', 'TypeScript', 'Tailwind CSS 3', 'React Router v6', 'Context API', 'Express.js', 'Prisma ORM', 'PostgreSQL', 'JWT', 'Zod', 'Jest', 'Vite', 'Vercel'],
    demo: 'https://56-curso-react-practico-clase-21.vercel.app/',
    repository: 'https://github.com/omarhernandezrey/56-curso-react-practico-clase-21',
  },
  {
    title: 'Diccionario Dev — Spanish Technical Web Dictionary',
    description: 'A complete learning platform for web development with 200+ technical terms in Spanish. Includes smart search, interactive code previews, training modules (quizzes, live interviews), JWT authentication, an admin panel, an OpenAPI-documented REST API, and browser/VS Code extensions. Deployed on Vercel with PostgreSQL, Redis, and a scalable architecture.',
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Redis', 'Tailwind CSS 4', 'Zod', 'JWT', 'Vitest', 'OpenAPI', 'Vercel'],
    demo: 'https://diccionario-dev-xi.vercel.app/',
    repository: 'https://github.com/omarhernandezrey/diccionario-dev',
  },
];

const coreSkillsEs = [
  { name: 'HTML5', percentage: '95%', colorHex: '#FF6D00', description: 'Estructuras semánticas y optimizadas para SEO y accesibilidad.' },
  { name: 'CSS3/Sass', percentage: '92%', colorHex: '#2965F1', description: 'Diseños responsive, animaciones CSS y arquitectura escalable.' },
  { name: 'JavaScript', percentage: '98%', colorHex: '#F0DB4F', description: 'ES6+, patrones avanzados y optimización de performance.' },
  { name: 'TypeScript', percentage: '90%', colorHex: '#007ACC', description: 'Tipado estático para aplicaciones empresariales escalables.' },
  { name: 'React/Next.js', percentage: '96%', colorHex: '#61DAFB', description: 'Aplicaciones SSR, ISR y estáticas optimizadas.' },
  { name: 'Node.js', percentage: '88%', colorHex: '#68A063', description: 'APIs REST/GraphQL, microservicios y autenticación JWT.' },
  { name: 'Diseño UI/UX', percentage: '85%', colorHex: '#FF4081', description: 'Diseño de interfaces centrado en la experiencia de usuario.' },
  { name: 'Arquitectura en la Nube', percentage: '82%', colorHex: '#4285F4', description: 'Infraestructura escalable en AWS, GCP y Azure.' },
];

const coreSkillsEn = [
  { name: 'HTML5', percentage: '95%', colorHex: '#FF6D00', description: 'Semantic structures optimized for SEO and accessibility.' },
  { name: 'CSS3/Sass', percentage: '92%', colorHex: '#2965F1', description: 'Responsive designs, CSS animations, and scalable architecture.' },
  { name: 'JavaScript', percentage: '98%', colorHex: '#F0DB4F', description: 'ES6+, advanced patterns, and performance optimization.' },
  { name: 'TypeScript', percentage: '90%', colorHex: '#007ACC', description: 'Static typing for scalable enterprise applications.' },
  { name: 'React/Next.js', percentage: '96%', colorHex: '#61DAFB', description: 'SSR, ISR, and optimized static applications.' },
  { name: 'Node.js', percentage: '88%', colorHex: '#68A063', description: 'REST/GraphQL APIs, microservices, and JWT authentication.' },
  { name: 'UI/UX Design', percentage: '85%', colorHex: '#FF4081', description: 'User-centered interface design.' },
  { name: 'Cloud Architecture', percentage: '82%', colorHex: '#4285F4', description: 'Scalable infrastructure on AWS, GCP, and Azure.' },
];

const servicesEs = [
  { name: 'Desarrollo Web', icon: <Code2 size={20} />, href: '/servicios/desarrollo-web', description: 'Sitios web profesionales con Next.js y React. Diseño responsive, SEO incluido y panel de administración.' },
  { name: 'E-commerce', icon: <ShoppingCart size={20} />, href: '/servicios/e-commerce', description: 'Tiendas online completas con pagos integrados, gestión de inventario y panel intuitivo.' },
  { name: 'Automatización', icon: <Zap size={20} />, href: '/servicios/automatizacion', description: 'Eliminación de tareas repetitivas integrando tus herramientas favoritas.' },
  { name: 'SEO Técnico', icon: <Search size={20} />, href: '/servicios/seo-tecnico', description: 'Auditoría y optimización SEO completa. Core Web Vitals, Schema.org y ranking real en Google.' },
  { name: 'Landing Pages', icon: <Target size={20} />, href: '/servicios/landing-page', description: 'Páginas de aterrizaje optimizadas para conversión con A/B testing y análisis de comportamiento.' },
];

const servicesEn = [
  { name: 'Web Development', icon: <Code2 size={20} />, href: '/servicios/desarrollo-web', description: 'Professional websites with Next.js and React. Responsive design, SEO included, and an admin panel.' },
  { name: 'E-commerce', icon: <ShoppingCart size={20} />, href: '/servicios/e-commerce', description: 'Complete online stores with integrated payments, inventory management, and an intuitive panel.' },
  { name: 'Automation', icon: <Zap size={20} />, href: '/servicios/automatizacion', description: 'Eliminate repetitive tasks by integrating your favorite tools.' },
  { name: 'Technical SEO', icon: <Search size={20} />, href: '/servicios/seo-tecnico', description: 'Complete SEO audit and optimization. Core Web Vitals, Schema.org, and real Google rankings.' },
  { name: 'Landing Pages', icon: <Target size={20} />, href: '/servicios/landing-page', description: 'Conversion-optimized landing pages with A/B testing and behavior analysis.' },
];

const timelineEs = [
  {
    year: '2020 - 2022',
    title: 'Fundamentos y Formación Técnica',
    description: 'Inicié mi camino en desarrollo con el SENA. Cursé y aprobé el tecnólogo en Análisis y Desarrollo de Sistemas de Información (ADSI), construyendo bases sólidas en análisis, diseño y desarrollo de software. Comencé a ofrecer servicios freelance de desarrollo web.',
    icon: <GraduationCap size={20} />,
  },
  {
    year: '2023',
    title: 'Expansión a Desarrollo Web Moderno',
    description: 'Ingresé al Politécnico Grancolombiano para estudiar Ingeniería de Software. Inicié formación intensiva en React.js, Vite.js, TailwindCSS y JavaScript avanzado con Platzi. Comencé a construir proyectos full stack con tecnologías modernas.',
    icon: <Code2 size={20} />,
  },
  {
    year: '2024',
    title: 'Certificaciones y Bootcamps',
    description: 'Completé el Bootcamp Full Stack de Talento Tech (159 horas, Ministerio TIC). Obtuve certificación ITCertificate como Full Stack Developer Certified Specialist. Desarrollé proyectos complejos como Shopi (e-commerce full stack) y Diccionario Dev (plataforma de aprendizaje con 200+ términos, PostgreSQL y Redis).',
    icon: <Sparkles size={20} />,
  },
  {
    year: '2025 - Presente',
    title: 'Especialización Full Stack y Automatización',
    description: 'Enfoque en automatización de procesos empresariales y arquitecturas escalables. Próximo a graduarme como Ingeniero de Software. Desarrollo de soluciones full stack para clientes en Colombia y remoto USA, con stack React, Next.js, Node.js y PostgreSQL.',
    icon: <Briefcase size={20} />,
  },
];

const timelineEn = [
  {
    year: '2020 - 2022',
    title: 'Foundations & Technical Training',
    description: 'Started my development path with SENA. Completed the ADSI (Information Systems Analysis and Development) technologist program, building solid foundations in analysis, design, and software development. Began offering freelance web development services.',
    icon: <GraduationCap size={20} />,
  },
  {
    year: '2023',
    title: 'Expansion into Modern Web Development',
    description: 'Enrolled at Politécnico Grancolombiano to study Software Engineering. Started intensive training in React.js, Vite.js, TailwindCSS, and advanced JavaScript with Platzi. Began building full stack projects with modern technologies.',
    icon: <Code2 size={20} />,
  },
  {
    year: '2024',
    title: 'Certifications & Bootcamps',
    description: 'Completed the Talento Tech Full Stack Bootcamp (159 hours, Ministerio TIC). Earned ITCertificate certification as a Full Stack Developer Certified Specialist. Built complex projects like Shopi (full stack e-commerce) and Diccionario Dev (a learning platform with 200+ terms, PostgreSQL, and Redis).',
    icon: <Sparkles size={20} />,
  },
  {
    year: '2025 - Present',
    title: 'Full Stack Specialization & Automation',
    description: 'Focused on business process automation and scalable architectures. About to graduate as a Software Engineer. Building full stack solutions for clients in Colombia and remote in the US, with a React, Next.js, Node.js, and PostgreSQL stack.',
    icon: <Briefcase size={20} />,
  },
];

export default async function SobreMiPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const educationData = isEn ? educationDataEn : educationDataEs;
  const projects = isEn ? projectsEn : projectsEs;
  const coreSkills = isEn ? coreSkillsEn : coreSkillsEs;
  const services = isEn ? servicesEn : servicesEs;
  const timeline = isEn ? timelineEn : timelineEs;

  const pageUrl = isEn ? 'https://omarhernandezrey.com/en/sobre-mi' : 'https://omarhernandezrey.com/sobre-mi';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': isEn ? 'Home' : 'Inicio', 'item': isEn ? 'https://omarhernandezrey.com/en' : 'https://omarhernandezrey.com' },
      { '@type': 'ListItem', 'position': 2, 'name': isEn ? 'About Me' : 'Sobre Mí', 'item': pageUrl },
    ],
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${pageUrl}#person`,
    'name': OMAR_PROFILE.name,
    'url': OMAR_PROFILE.url,
    'image': OMAR_PROFILE.image,
    'sameAs': OMAR_PROFILE.sameAs,
    'jobTitle': OMAR_PROFILE.jobTitle,
    'telephone': OMAR_PROFILE.telephone,
    'description': OMAR_PROFILE.description,
    'knowsAbout': OMAR_PROFILE.knowsAbout,
    'alumniOf': [
      { '@type': 'CollegeOrUniversity', 'name': 'Politécnico Grancolombiano' },
      { '@type': 'EducationalOrganization', 'name': 'Servicio Nacional de Aprendizaje (SENA)' },
      { '@type': 'EducationalOrganization', 'name': 'Talento Tech Bogotá - Ministerio TIC' },
      { '@type': 'EducationalOrganization', 'name': 'Platzi' },
    ],
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': OMAR_PROFILE.addressLocality,
      'addressCountry': OMAR_PROFILE.addressCountry,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={personSchema} />

      <main className="flex-1 max-w-[90rem] mx-auto px-[var(--grid-margin)] pt-32 pb-16 space-y-24 md:space-y-32">

        {/* ===== HERO — grid editorial asimétrico ===== */}
        <header className="grid grid-cols-12 gap-[var(--grid-gutter)]">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <MapPin size={12} />
              Bogotá, Colombia
            </div>
            <h1 className="font-display italic text-6xl md:text-8xl font-medium text-white-custom tracking-tight leading-[0.95]">
              Omar<br />
              <span className="text-primary">Hernández Rey</span>
            </h1>
            <p className="font-display italic text-2xl md:text-3xl font-medium text-text-main/80">
              {isEn ? 'Full Stack Web Developer' : 'Desarrollador Web Full Stack'}
            </p>
            <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl leading-relaxed">
              {isEn
                ? "Freelance Full Stack Developer with 5+ years of experience building web solutions for businesses in Colombia and remote clients in the US. Specialized in React, Next.js, Node.js, and AI. Software Engineering student at Politécnico Grancolombiano."
                : 'Desarrollador Full Stack freelance con más de 5 años de experiencia construyendo soluciones web para negocios en Colombia y clientes remotos en USA. Especializado en React, Next.js, Node.js e Inteligencia Artificial. Ingeniero de Software en formación en el Politécnico Grancolombiano.'}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/servicios"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white-custom font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                {isEn ? 'View Services' : 'Ver Servicios'}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white-custom font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
              >
                {isEn ? 'View Projects' : 'Ver Proyectos'}
              </Link>
            </div>
          </div>

          {/* Panel lateral — datos rápidos, asimetría deliberada */}
          <div className="hidden lg:block lg:col-span-3 lg:col-start-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5 sticky top-32">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-semibold text-white-custom">{isEn ? 'Available for new projects' : 'Disponible para nuevos proyectos'}</span>
              </div>
              <div className="h-px w-full bg-white/10" />
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-mono-label text-[0.6rem] text-text-muted">{isEn ? 'Experience' : 'Experiencia'}</dt>
                  <dd className="text-white-custom">{isEn ? '5+ years' : '5+ años'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-mono-label text-[0.6rem] text-text-muted">{isEn ? 'Education' : 'Educación'}</dt>
                  <dd className="text-white-custom text-right">{isEn ? 'Software Eng. (2026)' : 'Ing. Software (2026)'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-mono-label text-[0.6rem] text-text-muted">{isEn ? 'Zone' : 'Zona'}</dt>
                  <dd className="text-white-custom text-right">{isEn ? 'CO · Remote US' : 'CO · Remoto USA'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        {/* ===== PROFESSIONAL EXPERIENCE ===== */}
        <section id="experiencia" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <Briefcase size={12} />
              {isEn ? '5+ Years of Experience' : '5+ Años de Experiencia'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? <>Professional<br />Experience</> : <>Experiencia<br />Profesional</>}
            </h2>
          </div>
          <div className="grid gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-10">
              <h3 className="text-2xl font-black text-white-custom italic mb-4">
                {isEn ? 'Freelance Web Developer' : 'Desarrollador Web Freelance'}
              </h3>
              <p className="text-text-muted leading-relaxed mb-6">
                {isEn
                  ? 'Since 2020, I\'ve been building custom web solutions for entrepreneurs and businesses. My core stack includes React, Next.js, TypeScript, and Node.js, with PostgreSQL and Supabase databases. I\'ve built e-commerce stores, landing pages, progressive web apps, and complex systems integrations.'
                  : 'Desde 2020, he estado construyendo soluciones web a medida para emprendedores y negocios. Mi stack principal incluye React, Next.js, TypeScript y Node.js, con bases de datos PostgreSQL y Supabase. He desarrollado e-commerce, landing pages, aplicaciones web progresivas e integraciones de sistemas complejos.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Prisma ORM'].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-text-muted">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-10">
              <h3 className="text-2xl font-black text-white-custom italic mb-4">
                {isEn ? 'Projects for Remote US Clients' : 'Proyectos para Clientes Remotos en USA'}
              </h3>
              <p className="text-text-muted leading-relaxed mb-6">
                {isEn
                  ? 'I\'ve collaborated with international clients building scalable full stack solutions. Experienced in effective remote communication, Git version control, technical documentation in English, and delivering projects on agreed timelines. Familiar with agile methodologies and async workflows.'
                  : 'He colaborado con clientes internacionales desarrollando soluciones full stack escalables. Experiencia en comunicación remota efectiva, control de versiones con Git, documentación técnica en inglés y entrega de proyectos en plazos acordados. Familiarizado con metodologías ágiles y flujos de trabajo asíncronos.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {['Git', 'GitHub', 'Jira', 'Slack', 'Vercel', 'REST APIs', 'JWT Auth', 'Zod'].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-text-muted">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== EDUCATION ===== */}
        <section id="educacion" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <GraduationCap size={12} />
              {isEn ? 'Academic Background' : 'Formación Académica'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? 'Education' : 'Educación'}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {educationData.map((edu, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">
                  {edu.category}
                </div>
                <h3 className="text-xl font-black text-white-custom italic leading-tight">
                  {edu.title}
                </h3>
                <p className="text-sm font-mono text-primary/80">
                  {edu.institution}
                </p>
                <p className="text-xs text-text-muted/60 font-mono">
                  {edu.duration}
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {edu.description}
                </p>
                {edu.certificate && (
                  <Link
                    href={edu.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mt-auto"
                  >
                    {isEn ? 'View certificate' : 'Ver certificado'}
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="text-center pt-2">
            <p className="text-text-muted/60 text-sm">
              {isEn
                ? <>55+ courses completed on Platzi, SENA, and other platforms.{' '}</>
                : <>Más de 55 cursos completados en Platzi, SENA y otras plataformas.{' '}</>}
              <Link href="/#education" className="text-primary font-bold hover:underline">
                {isEn ? 'View all certificates' : 'Ver todos los certificados'}
              </Link>
            </p>
          </div>
        </section>

        {/* ===== CORE TECHNOLOGIES ===== */}
        <section id="tecnologias" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <Code2 size={12} />
              {isEn ? 'Core Stack' : 'Stack Principal'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? <>Core<br />Technologies</> : <>Tecnologías<br />Principales</>}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {coreSkills.map((skill, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white-custom italic">
                    {skill.name}
                  </h3>
                  <span className="text-2xl font-black italic" style={{ color: skill.colorHex }}>
                    {skill.percentage}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: skill.percentage,
                      backgroundColor: skill.colorHex,
                    }}
                  />
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            {OMAR_PROFILE.knowsAbout.map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-mono text-text-muted hover:border-primary/30 hover:text-white-custom transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ===== FEATURED PROJECTS ===== */}
        <section id="proyectos" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <Sparkles size={12} />
              {isEn ? 'Featured Projects' : 'Proyectos Destacados'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? 'Projects' : 'Proyectos'}
            </h2>
          </div>
          <div className="grid gap-8">
            {projects.map((project, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-10 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white-custom italic leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-mono text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white-custom text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {isEn ? 'View Demo' : 'Ver Demo'}
                    <ExternalLink size={14} />
                  </Link>
                  <Link
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white-custom text-sm font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {isEn ? 'Source Code' : 'Código Fuente'}
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-2">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white-custom font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-sm"
            >
              {isEn ? 'View all projects' : 'Ver todos los proyectos'}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ===== SERVICES ===== */}
        <section id="servicios" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <Wrench size={12} />
              {isEn ? 'Services' : 'Servicios'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? <>What I Can<br />Do<br />For You</> : <>Lo Que<br />Puedo Hacer<br />Por Ti</>}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <Link
                key={i}
                href={service.href}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-primary/30 hover:bg-white/[0.05] transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-black text-white-custom italic group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-1">
                    {isEn ? 'Learn more' : 'Ver más'}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white-custom font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              {isEn ? 'View all services' : 'Ver todos los servicios'}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ===== TIMELINE ===== */}
        <section id="trayectoria" className="space-y-12">
          <div className="space-y-4">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              <BookOpen size={12} />
              {isEn ? 'Journey' : 'Trayectoria'}
            </div>
            <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
              {isEn ? <>My Path in<br />Development</> : <>Mi Camino en<br />el Desarrollo</>}
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-12">
              {timeline.map((event, i) => (
                <div key={i} className="relative pl-16 md:pl-20">
                  <div className="absolute left-5 md:left-7 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-primary font-bold">
                      {event.year}
                    </span>
                    <h3 className="text-xl font-black text-white-custom italic">
                      {event.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed max-w-2xl">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT CTA ===== */}
        <section id="contacto" className="space-y-12">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-10 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight">
                {isEn ? <>Let&apos;s Work<br />Together?</> : <>¿Trabajamos<br />Juntos?</>}
              </h2>
              <p className="text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
                {isEn
                  ? "If you have a project in mind, need a developer for your team, or want to automate your business, let's talk. I respond within 24 hours."
                  : 'Si tienes un proyecto en mente, necesitas un desarrollador para tu equipo o quieres automatizar tu negocio, hablemos. Respondo en menos de 24 horas.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white-custom font-bold rounded-xl hover:opacity-90 transition-opacity text-base"
              >
                <CheckCircle size={20} />
                {isEn ? 'Contact Me' : 'Contáctame'}
              </Link>
              <Link
                href="/calculadora"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white-custom font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-base"
              >
                {isEn ? 'Calculate budget' : 'Calcular presupuesto'}
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-text-muted/60">
              <a href={`tel:${OMAR_PROFILE.telephone}`} className="hover:text-primary transition-colors">
                {OMAR_PROFILE.telephone}
              </a>
              <span className="text-white/20">|</span>
              <a href={`mailto:contacto@omarhernandezrey.com`} className="hover:text-primary transition-colors">
                contacto@omarhernandezrey.com
              </a>
              <span className="text-white/20">|</span>
              <span>{OMAR_PROFILE.addressLocality}, {OMAR_PROFILE.addressCountry}</span>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/blog" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                {isEn ? 'Technical Blog' : 'Blog Técnico'}
              </Link>
              <span className="text-white/20">·</span>
              <Link href="/servicios" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                {isEn ? 'Services' : 'Servicios'}
              </Link>
              <span className="text-white/20">·</span>
              <Link href="/calculadora" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                {isEn ? 'Calculator' : 'Calculadora'}
              </Link>
              <span className="text-white/20">·</span>
              <Link href="/#projects" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                {isEn ? 'Projects' : 'Proyectos'}
              </Link>
              <span className="text-white/20">·</span>
              <a href={OMAR_PROFILE.sameAs[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                GitHub
              </a>
              <span className="text-white/20">·</span>
              <a href={OMAR_PROFILE.sameAs[1]} target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted/60 hover:text-primary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
