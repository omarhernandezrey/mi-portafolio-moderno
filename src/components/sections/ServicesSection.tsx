/* components/sections/ServicesSection.tsx
   - Se reemplazó la apóstrofe sin escapar (`Let's`) por `Let&apos;s`
     para cumplir con la regla ESLint `react/no-unescaped-entities`.
   - Variables CSS hardcodeadas reemplazadas por sistema dinámico de paletas */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const services = [
  {
    title: "Frontend Development",
    description:
      "Creating modern, responsive user interfaces using technologies like React and Next.js.",
    icon: "/images/services/frontend.svg",
    features: [
      "React & Next.js",
      "TypeScript",
      "Responsive Design",
      "Performance Optimization",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Backend Development",
    description:
      "Building robust, scalable APIs with Node.js, Express, and SQL/NoSQL databases.",
    icon: "/images/services/backend.svg",
    features: [
      "Node.js & Express",
      "Database Design",
      "API Development",
      "Microservices",
    ],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "UI/UX Design",
    description:
      "Functional prototypes and design focused on enhancing user experience.",
    icon: "/images/services/design.svg",
    features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "DevOps Implementation",
    description: "Automating deployments and maintaining cloud infrastructure.",
    icon: "/images/services/devops.svg",
    features: [
      "CI/CD Pipelines",
      "Cloud Infrastructure",
      "Container Orchestration",
      "Monitoring",
    ],
    gradient: "from-orange-500 to-red-500",
  },
];

// --- Lógica de partículas flotantes tipo AboutSection ---
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

type FloatingElement = ReturnType<typeof createFloatingElements>[number];

export default function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  // Parallax para varias formas
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-screen py-32 px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)",
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
        {/* Blob naranja */}
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
            background: `linear-gradient(to top right, var(--primary-color), var(--accent-color), transparent)`,
          }}
          className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full opacity-30 blur-2xl"
        />
        {/* Línea diagonal luminosa */}
        <motion.div
          style={{
            y: y4,
            background: `linear-gradient(to right, var(--accent-color), rgba(255,255,255,0.1), transparent)`,
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

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        style={{ opacity }}
      >
        {/* Encabezado */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
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
            What I Offer
          </motion.span>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            My Services
          </h2>

          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-color)" }}
          >
            Comprehensive solutions tailored to bring your digital vision to
            life with cutting-edge technology and best practices
          </p>
        </motion.div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              {/* Tarjeta de servicio */}
              <motion.div
                className="relative h-full p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500"
                style={{
                  backgroundColor:
                    hoveredIndex === index
                      ? "var(--card-bg-color)"
                      : `color-mix(in srgb, var(--secondary-background-color) 40%, transparent)`,
                  borderColor:
                    hoveredIndex === index
                      ? "var(--accent-color)"
                      : `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
                  boxShadow:
                    hoveredIndex === index
                      ? `0 25px 50px color-mix(in srgb, var(--accent-color) 15%, transparent)`
                      : "none",
                }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Brillo */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
                    opacity: hoveredIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Contenido */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icono */}
                  <motion.div
                    className="flex justify-center mb-6"
                    animate={{ rotateY: hoveredIndex === index ? 360 : 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl p-4 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                        boxShadow:
                          hoveredIndex === index
                            ? `0 15px 30px color-mix(in srgb, var(--accent-color) 30%, transparent)`
                            : "none",
                      }}
                    >
                      <div
                        className="w-12 h-12"
                        style={{
                          maskImage: `url(${service.icon})`,
                          WebkitMaskImage: `url(${service.icon})`,
                          maskRepeat: "no-repeat",
                          WebkitMaskRepeat: "no-repeat",
                          maskPosition: "center",
                          WebkitMaskPosition: "center",
                          maskSize: "contain",
                          WebkitMaskSize: "contain",
                          backgroundColor: "var(--white-color)",
                        }}
                      />
                    </div>
                  </motion.div>

                  <h3
                    className="text-xl font-bold mb-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {service.title}
                  </h3>

                  <p
                    className="text-center mb-6 flex-grow text-sm leading-relaxed"
                    style={{ color: "var(--muted-color)" }}
                  >
                    {service.description}
                  </p>

                  {/* Lista de características (aparece al hover) */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      height: hoveredIndex === index ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.features.map((feature, fi) => (
                      <motion.div
                        key={fi}
                        className="flex items-center space-x-2 text-xs"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{
                          x: hoveredIndex === index ? 0 : -20,
                          opacity: hoveredIndex === index ? 1 : 0,
                        }}
                        transition={{ delay: fi * 0.1, duration: 0.3 }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "var(--accent-color)" }}
                        />
                        <span style={{ color: "var(--text-color)" }}>
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Línea inferior animada */}
                  <motion.div
                    className="w-full h-px mt-6"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, var(--accent-color) 50%, transparent 100%)",
                    }}
                    animate={{
                      scaleX: hoveredIndex === index ? 1 : 0,
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Acento en esquina */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--accent-color)" }}
                  animate={{
                    scale: hoveredIndex === index ? 1.5 : 1,
                    opacity: hoveredIndex === index ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Número flotante */}
              <motion.div
                className="absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--background-color)",
                }}
                animate={{
                  scale: hoveredIndex === index ? 1.2 : 1,
                  rotate: hoveredIndex === index ? 360 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                {index + 1}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA inferior */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              color: "var(--white-color)",
              boxShadow: `0 10px 30px color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 15px 40px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Apóstrofe escapada para ESLint */}
            Let&apos;s Work Together
          </motion.button>
        </motion.div>
      </motion.div>

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
    </section>
  );
}
