/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes
  images: {
    domains: ["localhost"],
    unoptimized: false,
  },

  // Puedes agregar aquí configuración para turbopack si lo necesitas en el futuro

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
