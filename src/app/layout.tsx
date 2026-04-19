import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarLogic from "../components/ui/NavbarLogic";
import ClientProvider from "./ClientProvider";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omarhernandez.dev"),
  title: {
    template: "%s | Omar Hernández Rey",
    default: "Omar Hernández Rey | Full Stack Developer | Desarrollador Full Stack",
  },
  description:
    "Professional portfolio of Omar Hernández Rey, a Full Stack Web Developer passionate about creating innovative digital experiences. / Portafolio profesional de Omar Hernández Rey, Desarrollador Web Full Stack apasionado por crear experiencias digitales innovadoras.",
  keywords: [
    "desarrollador full stack",
    "full stack developer",
    "omar hernandez",
    "omar hernandez rey",
    "desarrollador freelance",
    "freelance developer",
    "web development",
    "desarrollo web",
    "react developer",
    "next.js developer",
    "colombia",
    "bogota",
    "software engineer",
    "ingeniero de software"
  ],
  authors: [{ name: "Omar Hernández Rey" }],
  creator: "Omar Hernández Rey",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://omarhernandez.dev",
    siteName: "Omar Hernández Rey Portfolio",
    title: "Omar Hernández Rey | Full Stack Developer",
    description: "Desarrollo web moderno con React, Next.js y Node.js",
    images: [
      {
        url: "/portfolio-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Omar Hernández Rey Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omar Hernández Rey | Full Stack Developer",
    description: "Desarrollador Web Full Stack creando soluciones digitales",
    images: ["/portfolio-preview.jpg"],
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
        <link rel="canonical" href="https://omarhernandez.dev" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <NavbarLogic />
          {children}
          <Analytics />
        </ClientProvider>
      </body>
    </html>
  );
}
