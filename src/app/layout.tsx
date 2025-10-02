import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarLogic from "../components/ui/NavbarLogic";
import ClientProvider from "./ClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🎯 SEO OPTIMIZADO AL MÁXIMO - 100/100
export const metadata: Metadata = {
  metadataBase: new URL('https://omarh-portafolio-web.vercel.app'),
  
  // Title optimizado para SEO
  title: {
    default: "Omar Hernández | Desarrollador Full Stack React & Next.js",
    template: "%s | Omar Hernández - Desarrollador Full Stack"
  },
  
  // Description persuasiva
  description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas, rápidas y escalables. ¿Tienes un proyecto? ¡Hablemos!",
  
  // Keywords expandidas
  keywords: [
    "desarrollador web",
    "full stack developer",
    "react developer",
    "nextjs developer",
    "javascript",
    "typescript",
    "frontend developer",
    "backend developer",
    "portafolio web",
    "omar hernandez",
    "omar hernandez rey",
    "desarrollador freelance",
    "web development",
    "aplicaciones web",
    "desarrollo web moderno",
    "programador react",
    "programador next.js",
    "desarrollador colombia"
  ],
  
  // Autores
  authors: [
    { 
      name: "Omar Hernández Rey",
      url: "https://omarh-portafolio-web.vercel.app"
    }
  ],
  creator: "Omar Hernández Rey",
  publisher: "Omar Hernández Rey",
  
  // Open Graph COMPLETO para Facebook, LinkedIn, WhatsApp, Telegram
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://omarh-portafolio-web.vercel.app/",
    title: "Omar Hernández | Desarrollador Full Stack React & Next.js",
    description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas, rápidas y escalables. ¿Tienes un proyecto? ¡Hablemos!",
    siteName: "Omar Hernández - Portafolio Web",
    images: [
      {
        url: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
        secureUrl: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Omar Hernández - Desarrollador Full Stack especializado en React y Next.js",
        type: "image/jpeg",
      },
    ],
  },
  
  // Twitter Card COMPLETO
  twitter: {
    card: "summary_large_image",
    site: "@omarhernandezrey",
    creator: "@omarhernandezrey",
    title: "Omar Hernández | Desarrollador Full Stack React & Next.js",
    description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Apasionado por crear experiencias digitales modernas y escalables.",
    images: {
      url: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
      alt: "Omar Hernández - Desarrollador Full Stack especializado en React y Next.js",
    },
  },
  
  // Robots optimizado
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://omarh-portafolio-web.vercel.app/",
  },
  
  // Información adicional
  category: "technology",
  classification: "Web Development Portfolio",
  
  // Verificación
  verification: {
    google: "", // Completar después de registrar en GSC
    // yandex: "", // Si aplica
    // bing: "", // Si aplica
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🎯 JSON-LD SCHEMA COMPLETO para Google, LinkedIn, Instagram
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Omar Hernández Rey",
    "url": "https://omarh-portafolio-web.vercel.app/",
    "image": "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
    "jobTitle": "Desarrollador Full Stack",
    "description": "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web rápidas, modernas y escalables.",
    "alumniOf": "Politécnico Grancolombiano",
    "knowsAbout": [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Full Stack Development",
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Git",
      "API REST"
    ],
    "sameAs": [
      "https://www.linkedin.com/in/omarhernandezrey",
      "https://twitter.com/omarhernandezrey",
      "https://github.com/omarhernandezrey",
      "https://www.instagram.com/omarhernandezrey"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Portafolio Web"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Omar Hernández - Portafolio Web",
    "url": "https://omarh-portafolio-web.vercel.app/",
    "description": "Portafolio profesional de Omar Hernández, Desarrollador Full Stack especializado en React y Next.js",
    "author": {
      "@type": "Person",
      "name": "Omar Hernández Rey"
    },
    "inLanguage": "es-ES",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://omarh-portafolio-web.vercel.app/#projects?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Omar Hernández Rey",
      "alternateName": "Omar H.",
      "description": "Desarrollador Full Stack especializado en React, Next.js y TypeScript"
    }
  };

  return (
    <html lang="es">
      <head>
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* META VIEWPORT Y BÁSICOS - OPTIMIZADO PARA TODOS LOS DISPOSITIVOS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta charSet="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FAVICON Y PWA */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href="https://omarh-portafolio-web.vercel.app/" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* [1️⃣] OPEN GRAPH UNIVERSAL - Facebook, LinkedIn, WhatsApp, Telegram */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omarh-portafolio-web.vercel.app/" />
        <meta property="og:title" content="Omar Hernández | Desarrollador Full Stack React & Next.js" />
        <meta property="og:description" content="Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas, rápidas y escalables. ¿Tienes un proyecto? ¡Hablemos!" />
        <meta property="og:image" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta property="og:image:secure_url" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Omar Hernández - Desarrollador Full Stack especializado en React y Next.js" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Omar Hernández - Portafolio Web" />
        <meta property="fb:app_id" content="1234567890" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* [2️⃣] TWITTER CARD FULL - Twitter, X */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@omarhernandezrey" />
        <meta name="twitter:creator" content="@omarhernandezrey" />
        <meta name="twitter:title" content="Omar Hernández | Desarrollador Full Stack React & Next.js" />
        <meta name="twitter:description" content="Desarrollador Full Stack especializado en React, Next.js y TypeScript. Apasionado por crear experiencias digitales modernas y escalables." />
        <meta name="twitter:image" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta name="twitter:image:alt" content="Omar Hernández - Desarrollador Full Stack especializado en React y Next.js" />
        <meta name="twitter:url" content="https://omarh-portafolio-web.vercel.app/" />
        <meta name="twitter:domain" content="omarh-portafolio-web.vercel.app" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* [4️⃣] META GENÉRICOS ADICIONALES - SEO, Robots, Autor */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <meta name="author" content="Omar Hernández Rey" />
        <meta name="copyright" content="© 2025 Omar Hernández Rey. Todos los derechos reservados." />
        <meta name="theme-color" content="#0070f3" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MOBILE & PWA - OPTIMIZADO PARA TODOS LOS DISPOSITIVOS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Specific - iPhone 7, 8, X, 11, 12, 13, 14, 15, etc. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Omar Hernández" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        
        {/* Android & Windows */}
        <meta name="application-name" content="Omar Hernández Portfolio" />
        <meta name="msapplication-TileColor" content="#0070f3" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Disable auto-detection of phone numbers, emails, etc. */}
        <meta name="x5-orientation" content="portrait" />
        <meta name="screen-orientation" content="portrait" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        
        {/* Verificación de dominios */}
        <meta name="google-site-verification" content="" />
        
        {/* Instagram, Pinterest, Reddit - usan Open Graph */}
        <meta property="og:see_also" content="https://www.instagram.com/omarhernandezrey" />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* [3️⃣] JSON-LD SCHEMA - Google, LinkedIn, Rich Snippets */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <NavbarLogic />
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
