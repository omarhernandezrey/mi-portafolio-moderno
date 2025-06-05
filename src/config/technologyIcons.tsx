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
} from "react-icons/fa";
import { SiTailwindcss, SiTypescript, SiVercel, SiAxios } from "react-icons/si";
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
