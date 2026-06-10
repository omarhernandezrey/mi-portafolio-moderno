import { Metadata } from 'next';

// Páginas de visualización de certificados: contenido thin (imágenes), sin
// valor de búsqueda propio. Fuera del índice y del sitemap.
export const metadata: Metadata = {
  title: 'Certificados | Omar Hernández Rey',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
