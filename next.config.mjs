/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  
  // Configuración experimental para turbopack
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Configuración de webpack para SVGs
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;