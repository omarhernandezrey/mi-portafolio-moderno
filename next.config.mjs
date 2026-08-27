import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes optimizada para Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'omarhernandezrey.com',
      },
      {
        protocol: 'https',
        hostname: 'ozftxfwkhomnbvicjtae.supabase.co',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
    qualities: [60, 75, 85, 95],
  },

  // Optimización para build en Vercel
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },

  // Redirects 301 para rutas retiradas (evitar 404 en URLs ya indexadas)
  async redirects() {
    return [
      {
        source: '/blog/chatbot-ia-negocio-colombia',
        destination: '/blog',
        permanent: true,
      },
      // Consolidación de /privacidad + /privacy en una sola ruta localizada
      {
        source: '/privacy',
        destination: '/en/privacidad',
        permanent: true,
      },
      // Posts en inglés que vivían sin prefijo /en/ (inconsistente con hreflang)
      {
        source: '/blog/build-mvp-nextjs-30-days-process',
        destination: '/en/blog/build-mvp-nextjs-30-days-process',
        permanent: true,
      },
      {
        source: '/blog/freelance-developer-vs-agency-web-project',
        destination: '/en/blog/freelance-developer-vs-agency-web-project',
        permanent: true,
      },
      {
        source: '/blog/why-hire-colombian-developer-2026',
        destination: '/en/blog/why-hire-colombian-developer-2026',
        permanent: true,
      },
    ];
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuración de webpack para SVGs
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Configuración de Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default withNextIntl(nextConfig);
