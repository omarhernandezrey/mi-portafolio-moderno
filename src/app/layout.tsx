import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarLogic from "../components/ui/NavbarLogic";
import ClientProvider from "./ClientProvider";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "@/components/seo/JsonLd";
import { OMAR_PROFILE } from "@/data/omarProfile";
import { clientEnv } from "@/config/env";
// SEO: Bing & Google verification via env vars
const personData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://omarhernandezrey.com/#person",
      "name": OMAR_PROFILE.name,
      "url": OMAR_PROFILE.url,
      "image": OMAR_PROFILE.image,
      "sameAs": OMAR_PROFILE.sameAs,
      "jobTitle": OMAR_PROFILE.jobTitle,
      "worksFor": {
        "@type": "Organization",
        "@id": "https://omarhernandezrey.com/#organization",
      },
      "description": OMAR_PROFILE.description,
      "knowsAbout": OMAR_PROFILE.knowsAbout,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": OMAR_PROFILE.addressLocality,
        "addressCountry": OMAR_PROFILE.addressCountry,
      },
    },
    {
      "@type": "Organization",
      "@id": "https://omarhernandezrey.com/#organization",
      "name": "Omar Hernández Rey — Desarrollo Web Freelance",
      "url": "https://omarhernandezrey.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://omarhernandezrey.com/favicon.png",
      },
      "founder": {
        "@type": "Person",
        "@id": "https://omarhernandezrey.com/#person",
      },
      "sameAs": OMAR_PROFILE.sameAs,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": OMAR_PROFILE.telephone,
        "contactType": "customer service",
        "availableLanguage": ["Spanish", "English"],
      },
      "description": "Servicios profesionales de desarrollo web, chatbots con IA, e-commerce y automatización para Colombia y LATAM.",
      "areaServed": ["CO", "US", "MX", "AR", "CL", "PE"],
    },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omarhernandezrey.com"),
  title: {
    template: "%s | Omar Hernández Rey",
    default: "Omar Hernández Rey | Desarrollador Full Stack — Colombia & USA Remote",
  },
  description:
    "Desarrollo webs y apps con React & Next.js. Atiendo clientes en Colombia y USA. Proyectos desde $500 USD. Consulta gratis, respuesta en 24h.",
  verification: {
    google: clientEnv.NEXT_PUBLIC_GSC_VERIFICATION,
    other: {
      'msvalidate.01': "9FF4E37C09A3144997A2E471BF6A2723",
    },
  },
  keywords: [
    "desarrollador web freelance colombia",
    "contratar desarrollador web colombia",
    "programador freelance colombia",
    "desarrollador full stack colombia",
    "full stack developer colombia",
    "react developer colombia",
    "next.js developer colombia",
    "hire developer colombia remote",
    "software developer colombia",
    "ingeniero de software colombia",
    "desarrollador web bogota",
    "chatbot ia colombia",
    "e-commerce colombia",
    "aplicaciones web colombia",
  ],
  authors: [{ name: "Omar Hernández Rey" }],
  creator: "Omar Hernández Rey",
  alternates: {
    canonical: 'https://omarhernandezrey.com',
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://omarhernandezrey.com",
    siteName: "Omar Hernández Rey Portfolio",
    title: "Omar Hernández Rey | Full Stack Developer",
    description: "Desarrollo web moderno con React, Next.js y Node.js",
    images: [
      {
        url: "https://omarhernandezrey.com/api/og?title=Omar%20Hern%C3%A1ndez%20Rey&subtitle=Full%20Stack%20Web%20Developer",
        secureUrl: "https://omarhernandezrey.com/api/og?title=Omar%20Hern%C3%A1ndez%20Rey&subtitle=Full%20Stack%20Web%20Developer",
        width: 1200,
        height: 630,
        alt: "Omar Hernández Rey | Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Hernández Rey | Full Stack Developer",
    description: "Desarrollador Web Full Stack creando soluciones digitales",
    images: ["https://omarhernandezrey.com/api/og?title=Omar%20Hern%C3%A1ndez%20Rey&subtitle=Full%20Stack%20Web%20Developer"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://omarhernandezrey.com" />
        <link rel="alternate" type="application/rss+xml" title="Omar Hernández Rey | Blog" href="/feed.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={personData} />
        <ClientProvider>
          <NavbarLogic />
          {children}
          <Analytics />
        </ClientProvider>
      </body>
    </html>
  );
}
