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
        hostname: 'omarh-portafolio-web.vercel.app',
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

export default nextConfig;
