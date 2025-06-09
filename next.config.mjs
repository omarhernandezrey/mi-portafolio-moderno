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
};

export default nextConfig;
