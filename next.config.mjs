/** @type {import('next').NextConfig} */
/* ───────── Config global ───────── */
const nextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier",
      "framer-motion",
      "react-icons",
      "three",
      "meshline"
    ],
  },
  webpack(config, { isServer }) {
    /* SVG → React */
    config.module.rules.push({ test: /\.svg$/, use: ["@svgr/webpack"] });
    
    /* GLB/GLTF como recurso */
    config.module.rules.push({ 
      test: /\.(glb|gltf)$/, 
      type: "asset/resource",
      generator: {
        filename: 'static/models/[hash][ext][query]'
      }
    });

    /* Optimizaciones para Three.js */
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': 'three'
      };
    }

    /* Optimización para meshline */
    config.resolve.alias = {
      ...config.resolve.alias,
      'meshline': 'meshline/src/MeshLine.js'
    };

    return config;
  },
  transpilePackages: ['three', 'meshline'],
};

export default nextConfig;