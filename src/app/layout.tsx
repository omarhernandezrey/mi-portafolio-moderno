import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // ✅ Solo este archivo
import NavbarLogic from "../components/ui/NavbarLogic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omar Hernández - Desarrollador Web Full Stack",
  description: "Desarrollador Web especializado en React, Next.js y tecnologías modernas. Explora mi portafolio con proyectos innovadores y soluciones web completas.",
  keywords: "desarrollador web, full stack, react, nextjs, javascript, typescript, portafolio, omar hernandez",
  authors: [{ name: "Omar Hernández" }],
  creator: "Omar Hernández",
  publisher: "Omar Hernández",
  
  // Open Graph para LinkedIn, Facebook, etc.
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://omarh-portafolio-web.vercel.app",
    title: "Omar Hernández - Desarrollador Web Full Stack",
    description: "Desarrollador Web especializado en React, Next.js y tecnologías modernas. Explora mi portafolio con proyectos innovadores y soluciones web completas.",
    siteName: "Portafolio Omar Hernández",
    images: [
      {
        url: "https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Portafolio de Omar Hernández - Desarrollador Web",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Omar Hernández - Desarrollador Web Full Stack",
    description: "Desarrollador Web especializado en React, Next.js y tecnologías modernas. Explora mi portafolio con proyectos innovadores.",
    creator: "@omarhernandezrey",
    images: ["https://omarh-portafolio-web.vercel.app/portfolio-preview.jpg"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Meta viewport crítico para dispositivos móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        
        {/* Meta tags adicionales para LinkedIn */}
        <meta name="linkedin:owner" content="Omar Hernández" />
        <meta name="linkedin:creator" content="@omarhernandezrey" />
        
        {/* Verificación de dominio (opcional) */}
        <meta name="google-site-verification" content="" />
        
        {/* Tema de color para navegadores móviles */}
        <meta name="theme-color" content="#0070f3" />
        <meta name="msapplication-TileColor" content="#0070f3" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarLogic />
        {children}
      </body>
    </html>
  );
}
