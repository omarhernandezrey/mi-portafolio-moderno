"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react"; // ✅ Import añadido
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

// Carga diferida del carnet 3D con mejor manejo de errores
const Lanyard = dynamic(() => import("../ui/Lanyard"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[450px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" 
           style={{ borderColor: "var(--primary-color)" }}>
      </div>
    </div>
  )
});

// Tipado para los elementos flotantes
interface FloatingElement {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

// Función para crear elementos flotantes
const createFloatingElements = (count = 12) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 10 + 15,
    opacity: Math.random() * 0.4 + 0.1,
  }));

export default function AboutSection() {
  const { scrollYProgress } = useScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Efectos de parallax
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Inicializar elementos flotantes
  useEffect(() => {
    setIsClient(true);
    setFloatingElements(createFloatingElements());
  }, []);

  // Datos personales con iconos
  const personal = [
    { icon: FaUser, label: "Nombre", value: "Omar Hernández Rey" },
    { icon: FaCalendarAlt, label: "Fecha de Nacimiento", value: "14/02/1990" },
    { icon: FaMapMarkerAlt, label: "Ubicación", value: "Bogotá, Colombia" },
    { icon: FaPhoneAlt, label: "Teléfono", value: "(+57) 321 905 8278" },
    { icon: FaEnvelope, label: "Email", value: "hernandezreyomar@gmail.com" },
  ];

  // Enlaces sociales
  const socialLinks = [
    {
      icon: FaLinkedin,
      href: "https://linkedin.com/in/omarhernandezrey",
      label: "LinkedIn",
      color: "#0077B5"
    },
    {
      icon: FaGithub,
      href: "https://github.com/omarhernandezrey",
      label: "GitHub",
      color: "#333"
    },
  ];

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative min-h-screen py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)",
      }}
    >
      {/* Wave superior */}
      <div className="absolute top-0 left-0 w-full rotate-180 overflow-hidden leading-[0] z-0">
        <Image
          src="/images/wave-top.svg"
          alt="Wave Top"
          className="w-full h-auto"
          width={1920}
          height={200}
          priority
        />
      </div>

      {/* Fondo parallax moderno */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Círculo grande blur */}
        <motion.div
          style={{
            y: y1,
            backgroundColor: "var(--primary-color)",
          }}
          className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full opacity-30 blur-3xl"
        />
        {/* Blob acento */}
        <motion.div
          style={{
            y: y2,
            backgroundColor: "var(--accent-color)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
          className="absolute top-[30%] right-[-100px] w-[280px] h-[280px] opacity-40 blur-2xl rotate-12"
        />
        {/* Círculo degradado */}
        <motion.div
          style={{
            y: y3,
            background: "linear-gradient(to top right, var(--primary-color), var(--accent-color), transparent)",
          }}
          className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full opacity-30 blur-2xl"
        />
        {/* Línea diagonal luminosa */}
        <motion.div
          style={{
            y: y4,
            background: "linear-gradient(to right, var(--accent-color), rgba(255,255,255,0.1), transparent)",
          }}
          className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] opacity-40 rotate-[-20deg] blur-md"
        />
        {/* Círculo blanco suave */}
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-60px] right-[10%] w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-2xl"
        />
      </div>

      {/* Partículas animadas */}
      {isClient && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {floatingElements.map((el) => (
            <motion.div
              key={el.id}
              className="absolute rounded-full"
              style={{
                width: el.size,
                height: el.size,
                left: `${el.x}%`,
                top: `${el.y}%`,
                backgroundColor: "var(--accent-color)",
                opacity: el.opacity,
              }}
              animate={{
                y: [-40, 40, -40],
                x: [-20, 20, -20],
                opacity: [el.opacity * 0.3, el.opacity, el.opacity * 0.3],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: el.duration,
                repeat: Infinity,
                delay: el.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        {/* Header animado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
            style={{
              color: "var(--accent-color)",
              backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            Conóceme
          </motion.span>
          
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Sobre Mí
          </h2>
          
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-color)" }}
          >
            Desarrollador Full Stack apasionado por crear experiencias digitales que marquen la diferencia
          </p>
        </motion.div>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Columna izquierda - Información personal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center lg:items-start"
          >
            {/* Imagen de perfil */}
            <motion.div 
              className="relative w-64 h-80 mb-8 rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(45deg, var(--primary-color), var(--accent-color))",
                  padding: "4px",
                }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/profile-SN-fondo.png"
                    alt="Perfil Omar Hernández Rey"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            {/* Información personal */}
            <div className="w-full max-w-md">
              <h3 
                className="text-2xl font-bold mb-6 text-center lg:text-left"
                style={{ color: "var(--primary-color)" }}
              >
                Información Personal
              </h3>
              
              <ul className="space-y-4">
                {personal.map(({ icon: Icon, label, value }, index) => (
                  <motion.li 
                    key={label}
                    className="flex items-center gap-4 p-3 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 50%, transparent)`,
                      borderColor: `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      <Icon 
                        className="text-lg" 
                        style={{ color: "var(--background-color)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <span 
                        className="font-semibold block text-sm"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {label}:
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: "var(--text-color)" }}
                      >
                        {value}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Enlaces sociales */}
              <div className="mt-8">
                <h4 
                  className="text-lg font-semibold mb-4 text-center lg:text-left"
                  style={{ color: "var(--primary-color)" }}
                >
                  Conecta Conmigo
                </h4>
                <div className="flex justify-center lg:justify-start gap-4">
                  {socialLinks.map(({ icon: Icon, href, label, color }, index) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 80%, transparent)`,
                        border: `2px solid color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                      }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: color,
                        borderColor: color,
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      aria-label={`Visitar mi ${label}`}
                    >
                      <Icon 
                        className="text-xl" 
                        style={{ color: "var(--text-color)" }}
                      />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Carnet 3D */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-lg">
              <h3 
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: "var(--primary-color)" }}
              >
                Carnet Interactivo 3D
              </h3>
              
              <p 
                className="text-center mb-8 text-sm"
                style={{ color: "var(--muted-color)" }}
              >
                ¡Arrastra y experimenta con la física en tiempo real!
              </p>
              
              {/* Contenedor del Lanyard con borde animado */}
              <div
                className="relative rounded-3xl p-1 overflow-hidden"
                style={{
                  background: "linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--primary-color))",
                  backgroundSize: "200% 200%",
                  animation: "gradient-shift 3s ease infinite",
                }}
              >
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ backgroundColor: "var(--background-color)" }}
                >
                  {isClient && <Lanyard />}
                </div>
              </div>
              
              {/* Descripción adicional */}
              <div className="mt-6 text-center">
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-color)" }}
                >
                  Este carnet representa mi identidad como desarrollador. 
                  Utiliza física realista con React Three Fiber y Rapier para 
                  crear una experiencia interactiva única.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sección adicional - Descripción profesional */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div
            className="backdrop-blur-xl border rounded-3xl p-8 md:p-12"
            style={{
              backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 60%, transparent)`,
              borderColor: `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
            }}
          >
            <div className="text-center mb-8">
              <h3
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ color: "var(--primary-color)" }}
              >
                Mi Historia
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p 
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: "var(--text-color)" }}
                >
                  Soy un desarrollador web full stack con más de 3 años de experiencia 
                  creando soluciones digitales innovadoras. Mi pasión por la tecnología 
                  me lleva a estar en constante aprendizaje y evolución.
                </p>
                
                <p 
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: "var(--text-color)" }}
                >
                  Especializado en React, Next.js, Node.js y tecnologías modernas, 
                  me enfoco en crear experiencias de usuario excepcionales que 
                  combinan diseño atractivo con funcionalidad robusta.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Three.js'].map((tech, index) => (
                    <motion.span
                      key={tech}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--accent-color) 20%, transparent)`,
                        color: "var(--accent-color)",
                        border: `1px solid color-mix(in srgb, var(--accent-color) 30%, transparent)`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-48 h-48 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(from 0deg, var(--primary-color), var(--accent-color), var(--primary-color))`,
                    }}
                  >
                    <div
                      className="w-44 h-44 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--background-color)" }}
                    >
                      <div className="text-center">
                        <div
                          className="text-4xl font-bold mb-2"
                          style={{ color: "var(--primary-color)" }}
                        >
                          3+
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-color)" }}
                        >
                          Años de<br />Experiencia
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wave inferior */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0">
        <Image
          src="/images/wave-bottom.svg"
          alt="Wave Bottom"
          className="w-full h-auto"
          width={1920}
          height={200}
        />
      </div>

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}