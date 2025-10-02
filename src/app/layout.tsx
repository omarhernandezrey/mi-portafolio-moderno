import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // ✅ Solo este archivo
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

export const metadata: Metadata = {
  metadataBase: new URL('https://omarh-portafolio-web.vercel.app'),
  title: {
    default: "Omar Hernández | Desarrollador Full Stack React & Next.js",
    template: "%s | Omar Hernández - Desarrollador Full Stack"
  },
  description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas, rápidas y escalables. ¿Tienes un proyecto? ¡Hablemos!",
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
    "desarrollador freelance",
    "web development",
    "aplicaciones web",
    "desarrollo web moderno"
  ],
  authors: [
    { 
      name: "Omar Hernández",
      url: "https://omarh-portafolio-web.vercel.app"
    }
  ],
  creator: "Omar Hernández",
  publisher: "Omar Hernández",
  
  // Open Graph para LinkedIn, Facebook, etc.
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://omarh-portafolio-web.vercel.app",
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
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@omarhernandezrey",
    creator: "@omarhernandezrey",
    title: "Omar Hernández | Desarrollador Full Stack React & Next.js",
    description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas y escalables.",
    images: {
      url: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
      alt: "Omar Hernández - Desarrollador Full Stack especializado en React y Next.js",
    },
  },
  
  // Verificación y robots
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
    canonical: "https://omarh-portafolio-web.vercel.app",
  },
  
  // Información adicional
  category: "technology",
  classification: "Web Development Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Schema para SEO
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Hernández",
    url: "https://omarh-portafolio-web.vercel.app",
    image: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
    jobTitle: "Desarrollador Full Stack",
    description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript",
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Full Stack Development",
      "Web Development",
      "Frontend Development",
      "Backend Development"
    ],
    sameAs: [
      "https://twitter.com/omarhernandezrey",
      "https://github.com/omarhernandez",
      "https://linkedin.com/in/omarhernandez"
    ],
    worksFor: {
      "@type": "Organization",
      name: "Freelance"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Omar Hernández - Portafolio Web",
    url: "https://omarh-portafolio-web.vercel.app",
    description: "Portafolio profesional de Omar Hernández, Desarrollador Full Stack especializado en React y Next.js",
    author: {
      "@type": "Person",
      name: "Omar Hernández"
    },
    inLanguage: "es-ES",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://omarh-portafolio-web.vercel.app/#projects?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Omar Hernández",
      alternateName: "Omar H.",
      description: "Desarrollador Full Stack especializado en React, Next.js y TypeScript"
    }
  };

  return (
    <html lang="es">
      <head>
        {/* Meta viewport crítico para dispositivos móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Open Graph Meta Tags - Facebook, LinkedIn */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omarh-portafolio-web.vercel.app" />
        <meta property="og:title" content="Omar Hernández | Desarrollador Full Stack React & Next.js" />
        <meta property="og:description" content="Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas, rápidas y escalables. ¿Tienes un proyecto? ¡Hablemos!" />
        <meta property="og:image" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta property="og:image:secure_url" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Omar Hernández - Desarrollador Full Stack especializado en React y Next.js" />
        <meta property="og:site_name" content="Omar Hernández - Portafolio Web" />
        <meta property="og:locale" content="es_ES" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@omarhernandezrey" />
        <meta name="twitter:creator" content="@omarhernandezrey" />
        <meta name="twitter:title" content="Omar Hernández | Desarrollador Full Stack React & Next.js" />
        <meta name="twitter:description" content="Desarrollador Full Stack especializado en React, Next.js y TypeScript. Creo aplicaciones web modernas y escalables." />
        <meta name="twitter:image" content="https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg" />
        <meta name="twitter:image:alt" content="Omar Hernández - Desarrollador Full Stack especializado en React y Next.js" />
        
        {/* Meta tags adicionales */}
        <meta name="author" content="Omar Hernández" />
        <meta name="copyright" content="Omar Hernández" />
        
        {/* Verificación de dominio (completar después de registrar en GSC) */}
        <meta name="google-site-verification" content="" />
        
        {/* Tema de color para navegadores móviles */}
        <meta name="theme-color" content="#0070f3" />
        <meta name="msapplication-TileColor" content="#0070f3" />
        <meta name="msapplication-TileImage" content="/favicon.png" />

        {/* JSON-LD Structured Data */}
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
