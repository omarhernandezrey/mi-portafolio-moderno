/**
 * Registro de iconos: cadena → componente.
 *
 * ¿POR QUÉ EXISTE ESTE ARCHIVO?
 *
 * El contenido del portafolio se está migrando a Supabase (migración
 * `supabase/migrations/20261112_portfolio_content.sql`). Varios arrays que
 * vivían inline dentro de componentes llevaban el icono como JSX:
 *
 *   { name: "React", icon: <FaReact />, ... }          // TechMarquee
 *   { year: '2024', icon: <Sparkles size={20} />, ... } // timeline de sobre-mi
 *
 * JSX no es serializable: no cabe en una columna de Postgres. Por eso las
 * tablas `portfolio_technologies` y `portfolio_timeline` guardan `icon_key`,
 * una CADENA, y es el código el que la resuelve contra este registro.
 *
 * CONTRATO, para que un icono no desaparezca en silencio:
 *
 * 1. La clave es el NOMBRE DEL COMPONENTE tal cual se importa. Si el array
 *    original decía `<Sparkles size={20} />`, la clave es `"Sparkles"` y
 *    resuelve a `Sparkles`. Sin alias, sin minúsculas, sin slugs.
 *
 * 2. Aquí se guarda el COMPONENTE, no un elemento ya construido. Las props de
 *    presentación (`size`, `strokeWidth`, color) las sigue poniendo el
 *    componente que renderiza, exactamente como antes de la extracción. Así el
 *    marquee sigue pintando `<FaReact />` sin props y el timeline
 *    `<Sparkles size={20} />`: mismo render, distinta procedencia del dato.
 *
 * 3. `PortfolioIconKey` es la unión literal de las claves de este registro, así
 *    que un `iconKey` mal escrito en los módulos de datos NO compila. El test
 *    `__tests__/unit/portfolio-source.test.ts` comprueba además, en runtime,
 *    que toda clave usada por los datos resuelve a un componente no nulo.
 *
 * 4. Este registro es independiente de `src/config/technologyIcons.tsx`, que
 *    mapea NOMBRE DE TECNOLOGÍA → elemento ya estilizado (se usa en las
 *    tarjetas de proyecto). Aquí la clave es el nombre del componente. Los dos
 *    conviven a propósito: `technologyIcons` resuelve por coincidencia literal
 *    de nombres como "Mobile-First Design" o "@react-three/fiber", que no son
 *    nombres de componentes.
 */
import type { ComponentType, CSSProperties } from 'react';
import {
  Briefcase,
  BrainCircuit,
  Code2,
  Coffee,
  Globe,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  FaCss3Alt,
  FaDocker,
  FaGitAlt,
  FaHtml5,
  FaJava,
  FaJs,
  FaMapMarkerAlt,
  FaNodeJs,
  FaPhoneAlt,
  FaPython,
  FaReact,
  FaUser,
} from 'react-icons/fa';
import {
  SiAngular,
  SiCircleci,
  SiExpo,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlutter,
  SiGithubactions,
  SiGitlab,
  SiJenkins,
  SiJest,
  SiJetpackcompose,
  SiKotlin,
  SiMongodb,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiPostgresql,
  SiPrisma,
  SiRailway,
  SiRedis,
  SiSpringboot,
  SiStorybook,
  SiSupabase,
  SiSwagger,
  SiTailwindcss,
  SiTypeorm,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVuedotjs,
  SiWebpack,
} from 'react-icons/si';
import { TbBrandThreejs } from 'react-icons/tb';

/**
 * Props comunes a los dos proveedores que usa el portafolio: `react-icons`
 * (IconBaseProps) y `lucide-react` (LucideProps). Solo lo que los datos
 * extraídos necesitaban pasar.
 */
export interface PortfolioIconProps {
  readonly size?: number | string;
  readonly strokeWidth?: number | string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export type PortfolioIconComponent = ComponentType<PortfolioIconProps>;

/**
 * Mapa clave → componente.
 *
 * `satisfies` (y no una anotación `Record<string, …>`) para que TypeScript
 * conserve las claves literales: de ahí sale `PortfolioIconKey`.
 */
export const portfolioIconRegistry = {
  // ── lucide-react: timeline de /sobre-mi e intereses de AboutSection ──────
  Briefcase,
  BrainCircuit,
  Code2,
  Coffee,
  Globe,
  GraduationCap,
  Sparkles,

  // ── react-icons/fa: datos personales de AboutSection y marquee ───────────
  FaCss3Alt,
  FaDocker,
  FaGitAlt,
  FaHtml5,
  FaJava,
  FaJs,
  FaMapMarkerAlt,
  FaNodeJs,
  FaPhoneAlt,
  FaPython,
  FaReact,
  FaUser,

  // ── react-icons/si + tb: marquee de tecnologías ──────────────────────────
  SiAngular,
  SiCircleci,
  SiExpo,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlutter,
  SiGithubactions,
  SiGitlab,
  SiJenkins,
  SiJest,
  SiJetpackcompose,
  SiKotlin,
  SiMongodb,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiPostgresql,
  SiPrisma,
  SiRailway,
  SiRedis,
  SiSpringboot,
  SiStorybook,
  SiSupabase,
  SiSwagger,
  SiTailwindcss,
  SiTypeorm,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVuedotjs,
  SiWebpack,
  TbBrandThreejs,
} satisfies Record<string, PortfolioIconComponent>;

/** Unión literal de las claves válidas. Un `iconKey` con typo no compila. */
export type PortfolioIconKey = keyof typeof portfolioIconRegistry;

/** Número de claves del registro. Lo usa el test. */
export const PORTFOLIO_ICON_REGISTRY_COUNT =
  Object.keys(portfolioIconRegistry).length;

/**
 * Resuelve una clave a su componente.
 *
 * Acepta `string` a propósito: el `icon_key` que llegue de la base de datos es
 * una cadena cualquiera y puede no estar en el registro. Devuelve `null` en vez
 * de lanzar, para que una clave desconocida deje el hueco del icono vacío en
 * lugar de tumbar la página.
 */
export function resolveIcon(key: string): PortfolioIconComponent | null {
  if (!Object.prototype.hasOwnProperty.call(portfolioIconRegistry, key)) {
    return null;
  }
  return (portfolioIconRegistry as Record<string, PortfolioIconComponent>)[key];
}
