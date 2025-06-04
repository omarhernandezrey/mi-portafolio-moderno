"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import { motion, useScroll, useTransform } from "framer-motion";

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

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);

  /* -------------------- parallax scroll effect -------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .sendForm(
        "service_i3ofsgh", // Tu Service ID
        "template_3z8v0rn", // Tu Template ID
        form.current!,
        "x2atfK6sd3q0ZLUMV" // Tu Public Key
      )
      .then(
        () => {
          alert("Mensaje enviado correctamente 🎉");
          setIsSending(false);
          form.current?.reset();
        },
        (error) => {
          console.error("Error al enviar:", error);
          alert("Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.");
          setIsSending(false);
        }
      );
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen py-32 px-4 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)',
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
            backgroundColor: 'var(--primary-color)',
          }}
          className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full opacity-30 blur-3xl"
        />
        {/* Blob naranja */}
        <motion.div
          style={{ 
            y: y2,
            backgroundColor: 'var(--accent-color)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
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

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
            style={{
              color: 'var(--accent-color)',
              backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            Conectemos
          </motion.span>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              background: `linear-gradient(135deg, var(--white-color) 0%, var(--text-color) 50%, var(--muted-color) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Contáctame
          </h2>

          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted-color)' }}
          >
            ¿Listo para dar vida a tus ideas? Conversemos sobre tu próximo proyecto desde Bogotá, Colombia
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div
            className="backdrop-blur-xl border rounded-3xl p-8 md:p-12 relative overflow-hidden"
            style={{
              backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 60%, transparent)`,
              borderColor: `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
          >
            {/* Brillo sutil en la tarjeta */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
              }}
            />

            <form
              ref={form}
              onSubmit={sendEmail}
              className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Campo Nombre */}
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="text"
                  name="user_name"
                  placeholder="Tu Nombre"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent"
                  style={{
                    borderColor: focusedField === 'name' 
                      ? 'var(--accent-color)' 
                      : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor: focusedField === 'name' 
                      ? `color-mix(in srgb, var(--accent-color) 5%, transparent)` 
                      : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: 'var(--text-color)',
                    boxShadow: focusedField === 'name' 
                      ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)` 
                      : 'none',
                  }}
                  required
                />
                {focusedField === 'name' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
                    }}
                  />
                )}
              </motion.div>

              {/* Campo Email */}
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <input
                  type="email"
                  name="user_email"
                  placeholder="Tu Correo Electrónico"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent"
                  style={{
                    borderColor: focusedField === 'email' 
                      ? 'var(--accent-color)' 
                      : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor: focusedField === 'email' 
                      ? `color-mix(in srgb, var(--accent-color) 5%, transparent)` 
                      : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: 'var(--text-color)',
                    boxShadow: focusedField === 'email' 
                      ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)` 
                      : 'none',
                  }}
                  required
                />
                {focusedField === 'email' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
                    }}
                  />
                )}
              </motion.div>

              {/* Campo Mensaje - Ocupa 2 columnas */}
              <motion.div
                className="relative md:col-span-2"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <textarea
                  name="message"
                  placeholder="Cuéntame sobre tu proyecto..."
                  rows={6}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent resize-none"
                  style={{
                    borderColor: focusedField === 'message' 
                      ? 'var(--accent-color)' 
                      : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor: focusedField === 'message' 
                      ? `color-mix(in srgb, var(--accent-color) 5%, transparent)` 
                      : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: 'var(--text-color)',
                    boxShadow: focusedField === 'message' 
                      ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)` 
                      : 'none',
                  }}
                  required
                />
                {focusedField === 'message' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5"
                    style={{
                      background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
                    }}
                  />
                )}
              </motion.div>

              {/* Botón de Enviar */}
              <motion.div className="md:col-span-2 flex justify-center mt-6">
                <motion.button
                  type="submit"
                  disabled={isSending}
                  whileHover={{ scale: isSending ? 1 : 1.05 }}
                  whileTap={{ scale: isSending ? 1 : 0.95 }}
                  className="relative px-12 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSending 
                      ? `color-mix(in srgb, var(--accent-color) 50%, transparent)` 
                      : `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                    color: 'var(--white-color)',
                    boxShadow: isSending 
                      ? 'none' 
                      : `0 15px 35px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
                  }}
                >
                  {/* Efecto de brillo al hover */}
                  {!isSending && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-3">
                    {isSending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensaje
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Información de contacto adicional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { 
              icon: "📧", 
              title: "Email", 
              value: "hernandezreyomar@gmail.com",
              href: "mailto:hernandezreyomar@gmail.com",
            },
            { 
              icon: "📱", 
              title: "Phone", 
              value: "+57 321 905 2878",
              href: "tel:+573219052878",
            },
            { 
              icon: "📍", 
              title: "Location", 
              value: "Bogotá, Colombia",
              href: "https://maps.google.com/?q=Bogotá,Colombia",
            },
          ].map((contact, idx) => (
            <motion.a
              key={idx}
              href={contact.href}
              target={contact.title === "Location" ? "_blank" : "_self"}
              rel={contact.title === "Location" ? "noopener noreferrer" : ""}
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                boxShadow: `0 15px 30px color-mix(in srgb, var(--accent-color) 25%, transparent)`
              }}
              whileTap={{ scale: 0.98 }}
              className="block text-center p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 cursor-pointer group relative"
              style={{
                backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 30%, transparent)`,
                borderColor: `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
              }}
            >
              <motion.div 
                className="text-3xl mb-3 transition-transform duration-300"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {contact.icon}
              </motion.div>
              <h4 
                className="font-bold mb-2 transition-colors duration-300" 
                style={{ color: 'var(--white-color)' }}
              >
                {contact.title}
              </h4>
              <motion.p 
                style={{ color: 'var(--muted-color)' }}
                whileHover={{ color: 'var(--accent-color)' }}
                className="transition-colors duration-300 group-hover:font-medium"
              >
                {contact.value}
              </motion.p>
              
              {/* Indicador visual de acción */}
              <motion.div
                className="w-full h-0.5 mt-3 rounded-full"
                style={{ backgroundColor: 'var(--accent-color)' }}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Partícula decorativa */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-0"
                style={{ backgroundColor: 'var(--accent-color)' }}
                whileHover={{ 
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Línea decorativa inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 0%, var(--accent-color) 50%, transparent 100%)`,
          opacity: 0.4,
        }}
      />

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