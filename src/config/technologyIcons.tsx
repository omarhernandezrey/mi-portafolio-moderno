// technologyIcons.tsx
import {
  FaReact,
  FaNodeJs,
  FaCss3Alt,
  FaHtml5,
  FaJs,
  FaBoxOpen,
  FaCode,
  FaRobot,
  FaGraduationCap,
  FaGithub,
  FaMicrophone,
  FaLock,
} from "react-icons/fa";
import { 
  SiTailwindcss, 
  SiTypescript, 
  SiVercel, 
  SiAxios,
  SiPrisma,
  SiPostgresql,
  SiRedis,
  SiZod,
  SiVitest,
  SiThreedotjs,
  SiNetlify,
  SiExpress,
  SiJest,
  SiVite,
} from "react-icons/si";
import { MdPhoneIphone } from "react-icons/md";
import { BsFiletypeScss } from "react-icons/bs";
import { DiResponsive } from "react-icons/di";
import { RiNextjsFill, RiTailwindCssFill } from "react-icons/ri";
import { GrStorage } from "react-icons/gr";
import { PiGridNineFill } from "react-icons/pi";
import { FaCloudSun } from "react-icons/fa6";
import { JSX } from "react";

// Mapa de tecnologías a íconos
const technologyIcons: Record<string, JSX.Element> = {
  React: (
    <FaReact style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  JavaScript: (
    <FaJs style={{ color: "#fbbf24", width: "48px", height: "48px" }} />
  ),
  TypeScript: (
    <SiTypescript style={{ color: "#2563eb", width: "48px", height: "48px" }} />
  ),
  TailwindCSS: (
    <SiTailwindcss
      style={{ color: "#14b8a6", width: "48px", height: "48px" }}
    />
  ),
  NodeJS: (
    <FaNodeJs style={{ color: "#22c55e", width: "48px", height: "48px" }} />
  ),
  CSS: (
    <FaCss3Alt style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  HTML: <FaHtml5 style={{ color: "#f97316", width: "48px", height: "48px" }} />,
  NextJS: (
    <RiNextjsFill style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  Vercel: <SiVercel style={{ color: "#000", width: "48px", height: "48px" }} />,
  SCSS: (
    <BsFiletypeScss
      style={{ color: "#ec4899", width: "48px", height: "48px" }}
    />
  ),
  Flexbox: (
    <FaBoxOpen style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  "Mobile-First Design": (
    <MdPhoneIphone
      style={{ color: "#6b7280", width: "48px", height: "48px" }}
    />
  ),
  "Responsive Design": (
    <DiResponsive style={{ color: "#6b7280", width: "48px", height: "48px" }} />
  ),
  HTML5: (
    <FaHtml5 style={{ color: "#f97316", width: "48px", height: "48px" }} />
  ),
  CSS3: (
    <FaCss3Alt style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  "Next.js": (
    <RiNextjsFill style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  "Tailwind CSS": (
    <RiTailwindCssFill
      style={{ color: "#14b8a6", width: "48px", height: "48px" }}
    />
  ),
  localStorage: (
    <GrStorage style={{ color: "#6b7280", width: "48px", height: "48px" }} />
  ),
  "CSS Grid": (
    <PiGridNineFill
      style={{ color: "#6b7280", width: "48px", height: "48px" }}
    />
  ),
  "APIs REST": (
    <FaCloudSun style={{ color: "#f59e0b", width: "48px", height: "48px" }} />
  ),
  Fetch: (
    <FaCloudSun style={{ color: "#38bdf8", width: "48px", height: "48px" }} />
  ),
  Axios: (
    <SiAxios style={{ color: "#4b5563", width: "48px", height: "48px" }} />
  ),

  // Nuevas tecnologías agregadas
  "Next.js 14": (
    <RiNextjsFill style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  "React 18": (
    <FaReact style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  "Prisma ORM": (
    <SiPrisma style={{ color: "#2d3748", width: "48px", height: "48px" }} />
  ),
  Prisma: (
    <SiPrisma style={{ color: "#2d3748", width: "48px", height: "48px" }} />
  ),
  PostgreSQL: (
    <SiPostgresql style={{ color: "#336791", width: "48px", height: "48px" }} />
  ),
  Redis: (
    <SiRedis style={{ color: "#dc2626", width: "48px", height: "48px" }} />
  ),
  "Tailwind CSS 4": (
    <SiTailwindcss style={{ color: "#14b8a6", width: "48px", height: "48px" }} />
  ),
  Zod: (
    <SiZod style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  JWT: (
    <FaCode style={{ color: "#fb923c", width: "48px", height: "48px" }} />
  ),
  Vitest: (
    <SiVitest style={{ color: "#6d9f00", width: "48px", height: "48px" }} />
  ),
  OpenAPI: (
    <FaCloudSun style={{ color: "#85ea2d", width: "48px", height: "48px" }} />
  ),
  "Three.js": (
    <SiThreedotjs style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  Rapier: (
    <FaRobot style={{ color: "#f59e0b", width: "48px", height: "48px" }} />
  ),
  "@react-three/fiber": (
    <FaReact style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  "@react-three/drei": (
    <FaReact style={{ color: "#14b8a6", width: "48px", height: "48px" }} />
  ),
  "@react-three/rapier": (
    <FaReact style={{ color: "#f59e0b", width: "48px", height: "48px" }} />
  ),
  "Web Components": (
    <FaCode style={{ color: "#6366f1", width: "48px", height: "48px" }} />
  ),
  "Vercel, netlify": (
    <SiVercel style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  Netlify: (
    <SiNetlify style={{ color: "#00c7b7", width: "48px", height: "48px" }} />
  ),
  "React Router v6": (
    <FaReact style={{ color: "#f97316", width: "48px", height: "48px" }} />
  ),
  "Context API": (
    <FaReact style={{ color: "#3b82f6", width: "48px", height: "48px" }} />
  ),
  Zustand: (
    <FaCode style={{ color: "#8b5cf6", width: "48px", height: "48px" }} />
  ),
  "Express.js": (
    <SiExpress style={{ color: "#000", width: "48px", height: "48px" }} />
  ),
  Bcryptjs: (
    <FaLock style={{ color: "#059669", width: "48px", height: "48px" }} />
  ),
  Jest: (
    <SiJest style={{ color: "#15803d", width: "48px", height: "48px" }} />
  ),
  Vite: (
    <SiVite style={{ color: "#646cff", width: "48px", height: "48px" }} />
  ),
  "Tailwind CSS 3": (
    <SiTailwindcss style={{ color: "#14b8a6", width: "48px", height: "48px" }} />
  ),

  // Intereses personales
  "Platzi Learning": (
    <FaGraduationCap
      style={{ color: "#c084fc", width: "48px", height: "48px" }}
    />
  ),
  "Open Source": (
    <FaGithub style={{ color: "#a3a3a3", width: "48px", height: "48px" }} />
  ),
  "Tech Conferences": (
    <FaMicrophone style={{ color: "#ef4444", width: "48px", height: "48px" }} />
  ),
  "AI & ML": (
    <FaRobot style={{ color: "#fcd34d", width: "48px", height: "48px" }} />
  ),
  Coding: (
    <FaCode style={{ color: "#6ee7b7", width: "48px", height: "48px" }} />
  ),
};

export default technologyIcons;
