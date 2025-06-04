'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import technologyIcons from '../../config/technologyIcons';
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

/* ──────────────────────────────────────────────────────────
   Función para crear partículas aleatorias (solo en cliente) */
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

const AboutSection: React.FC = () => {
  /* Estado para partículas flotantes (solo cliente) */
  const [floatingElements, setFloatingElements] = useState<
    ReturnType<typeof createFloatingElements>
  >([]);

  /* Estado para hover en intereses */
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);

  /* Referencia a la sección para animaciones de scroll */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /* Mapear progreso de scroll a transformaciones */
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  /* Parallax para varias formas */
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  /* Datos de intereses y enlaces */
  const interests = [
    'Platzi Learning',
    'Open Source',
    'AI & ML',
    'Coding',
    'Tech Conferences',
  ];
  const interestLinks: Record<string, string> = {
    'Platzi Learning': 'https://platzi.com/',
    'Open Source': 'https://opensource.org/',
    'AI & ML': 'https://ai.google/',
    'Coding': 'https://www.codecademy.com/',
    'Tech Conferences': 'https://www.techconferences.co/',
  };

  /* Datos personales */
  const personalData = [
    { icon: FaUser, label: 'Nombre', value: 'Omar Hernández Rey' },
    { icon: FaCalendarAlt, label: 'Fecha de Nacimiento', value: '14 de febrero de 1990' },
    { icon: FaMapMarkerAlt, label: 'Dirección', value: 'Carrera 2N #39D-16 Sur, Bogotá' },
    { icon: FaPhoneAlt, label: 'Teléfono', value: '(+57) 3219058278' },
  ];

  /* Efecto: genera partículas tras montar (evita discrepancia SSR/CSR) */
  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen py-32 px-4 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)',
      }}
    >
      {/* Fondo parallax moderno */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Círculo grande blur */}
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full opacity-30 blur-3xl"
          style={{
            backgroundColor: 'var(--primary-color)',
            y: y1,
          }}
        />
        {/* Blob naranja */}
        <motion.div
          className="absolute top-[30%] right-[-100px] w-[280px] h-[280px] opacity-40 blur-2xl rotate-12"
          style={{
            backgroundColor: 'var(--accent-color)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            y: y2,
          }}
        />
        {/* Círculo degradado inferior */}
        <motion.div
          className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full opacity-30 blur-2xl"
          style={{
            background: `linear-gradient(to top right, var(--primary-color), var(--accent-color), transparent)`,
            y: y3,
          }}
        />
        {/* Línea degradada superior */}
        <motion.div
          className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] opacity-40 rotate-[-20deg] blur-md"
          style={{
            background: `linear-gradient(to right, var(--accent-color), rgba(255,255,255,0.1), transparent)`,
            y: y4,
          }}
        />
        {/* Círculo blanco inferior */}
        <div
          className="absolute bottom-[-60px] right-[10%] w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-2xl"
        />
      </div>

      {/* ───────── Partículas animadas de fondo ───────── */}
      <div className="absolute inset-0 opacity-20">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
              backgroundColor: 'var(--accent-color)',
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
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ───────── Formas parallax ───────── */}
      <motion.div className="absolute inset-0 opacity-10" style={{ y }}>
        <div
          className="absolute top-32 left-20 w-40 h-40 rounded-full"
          style={{ backgroundColor: 'var(--primary-color)' }}
        />
        <div
          className="absolute top-60 right-32 w-28 h-28 rounded-full"
          style={{ backgroundColor: 'var(--accent-color)' }}
        />
        <div
          className="absolute bottom-40 left-1/3 w-48 h-48 rounded-full"
          style={{ backgroundColor: 'var(--primary-color)' }}
        />
      </motion.div>

      {/* ───────── Wave superior ───────── */}
      <motion.div
        className="absolute top-0 left-0 w-full overflow-hidden z-0"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/images/wave-top.svg"
          alt="Wave Top"
          className="w-full h-auto rotate-180"
          width={1920}
          height={200}
          priority
        />
      </motion.div>

      {/* ───────── Contenido principal ───────── */}
      <motion.div className="relative z-10 mx-auto max-w-6xl" style={{ opacity }}>
        {/* Grid principal (foto + texto) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Foto + botón CV */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            viewport={{ once: true }}
          >
            {/* Marco animado */}
            <div className="group relative w-[240px] h-[300px] mb-6">
              <div 
                className="absolute inset-0 border-2 rounded-lg transform translate-x-4 -translate-y-4 transition-all duration-500 group-hover:translate-x-6 group-hover:-translate-y-6"
                style={{ borderColor: 'var(--accent-color)' }}
              />
              <div 
                className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl border-2 transition-all duration-500 group-hover:scale-105 flex items-center justify-center"
                style={{ 
                  borderColor: 'var(--accent-color)',
                  backgroundColor: 'var(--primary-color)'
                }}
              >
                <Image
                  src="/images/profile-SN-fondo.png"
                  alt="Foto de perfil"
                  className="object-cover w-full h-full"
                  width={240}
                  height={300}
                  priority
                />
              </div>
            </div>

            {/* Botón de descarga de CV */}
            <motion.a
              href="/files/CV-Omar-Hernandez-Rey.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="relative inline-flex items-center justify-center gap-3 px-8 py-4 mt-6 font-semibold text-lg rounded-full shadow-xl backdrop-blur-lg border-2"
              style={{
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                color: 'var(--white-color)',
                borderColor: 'var(--accent-color)',
                boxShadow: `0 10px 30px color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 15px 40px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {/* Icono animado */}
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M12 4v8"
                />
              </motion.svg>
              Download CV
            </motion.a>
          </motion.div>

          {/* Texto "Sobre mí" */}
          <motion.div
            className="flex flex-col space-y-8"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            viewport={{ once: true }}
          >
            {/* Encabezado */}
            <div>
              <motion.span
                className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
                style={{
                  color: 'var(--accent-color)',
                  backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
                  borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
                }}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Conóceme
              </motion.span>

              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                style={{
                  background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Sobre mí
              </h2>
            </div>

            {/* Descripción */}
            <motion.p
              className="text-lg leading-relaxed text-justify"
              style={{
                color: 'var(--muted-color)',
                textAlign: 'justify',
                textJustify: 'inter-word',
                hyphens: 'auto',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              ¡Hola! Soy{' '}
              <strong className="font-normal" style={{ color: 'var(--text-color)' }}>
                Omar Hernández Rey
              </strong>
              , un{' '}
              <strong className="font-normal" style={{ color: 'var(--primary-color)' }}>
                Desarrollador Web Full Stack
              </strong>{' '}
              con experiencia tanto en{' '}
              <strong className="font-normal" style={{ color: 'var(--accent-color)' }}>Front-End</strong> como
              en{' '}
              <strong className="font-normal" style={{ color: 'var(--accent-color)' }}>Back-End</strong>. Estoy
              a punto de graduarme en{' '}
              <strong className="font-normal" style={{ color: 'var(--primary-color)' }}>
                Ingeniería de Software
              </strong>{' '}
              del{' '}
              <strong className="font-normal" style={{ color: 'var(--primary-color)' }}>
                Politécnico Grancolombiano
              </strong>{' '}
              y continuo aprendiendo con cursos de{' '}
              <strong className="font-normal" style={{ color: 'var(--accent-color)' }}>Platzi</strong> sobre
              tecnologías web, DevOps y más.
            </motion.p>

            {/* Datos personales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {personalData.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  {/* Icono circular */}
                  <motion.span
                    className="w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      boxShadow: `0 10px 25px color-mix(in srgb, var(--accent-color) 30%, transparent)`,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <item.icon size={18} />
                  </motion.span>

                  {/* Texto */}
                  <div className="flex-1">
                    <p
                      className="uppercase text-xs font-semibold tracking-wider mb-1"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      {item.label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ───────── Sección de intereses ───────── */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Encabezado */}
          <div className="text-center mb-16">
            <motion.span
              className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
              style={{
                color: 'var(--accent-color)',
                backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              }}
              whileHover={{ scale: 1.05 }}
            >
              Pasiones
            </motion.span>

            <h3
              className="text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{
                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Mis Intereses
            </h3>
          </div>

          {/* Tarjetas de intereses */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {interests.map((interest, index) => (
              <motion.a
                key={interest}
                href={interestLinks[interest] || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center justify-center text-center p-6 h-36 rounded-3xl border backdrop-blur-xl transition-all duration-500"
                style={{
                  backgroundColor: hoveredInterest === interest 
                    ? 'var(--card-bg-color)' 
                    : `color-mix(in srgb, var(--secondary-background-color) 40%, transparent)`,
                  borderColor: hoveredInterest === interest
                    ? 'var(--accent-color)'
                    : `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
                  boxShadow: hoveredInterest === interest
                    ? `0 25px 50px color-mix(in srgb, var(--accent-color) 15%, transparent)`
                    : 'none',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100,
                }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredInterest(interest)}
                onHoverEnd={() => setHoveredInterest(null)}
                whileHover={{ scale: 1.05, rotateY: 5 }}
              >
                {/* Glow */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                    opacity: hoveredInterest === interest ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Contenido */}
                <div className="relative z-10 flex flex-col items-center h-full justify-center">
                  <motion.div
                    className="text-3xl mb-3"
                    style={{ color: 'var(--primary-color)' }}
                    animate={{
                      scale: hoveredInterest === interest ? 1.2 : 1,
                      rotate: hoveredInterest === interest ? 5 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {technologyIcons[interest] || <span>★</span>}
                  </motion.div>
                  <span
                    className="text-sm font-medium transition-colors duration-300"
                    style={{
                      color: hoveredInterest === interest
                        ? 'var(--primary-color)'
                        : 'var(--muted-color)',
                    }}
                  >
                    {interest}
                  </span>
                </div>

                {/* Puntero decorativo */}
                <motion.div
                  className="absolute top-3 right-3 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                  animate={{
                    scale: hoveredInterest === interest ? 1.5 : 1,
                    opacity: hoveredInterest === interest ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Wave inferior */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-48 overflow-hidden leading-[0] z-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Image
          src="/images/wave-bottom.svg"
          alt="Wave Bottom"
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full"
        />
      </motion.div>

      {/* Línea degradada inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 0%, var(--accent-color) 50%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
    </section>
  );
};

export default AboutSection;