/** @type {import('next').NextConfig} */
/* ───────── Config global ───────── */
const nextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
      "react-icons",
    ],
  },
  webpack(config) {
    /* SVG → React */
    config.module.rules.push({ test: /\.svg$/, use: ["@svgr/webpack"] });
    /* GLB/GLTF como recurso */
    config.module.rules.push({ test: /\.(glb|gltf)$/, type: "asset/resource" });
    return config;
  },
};
export default nextConfig;
