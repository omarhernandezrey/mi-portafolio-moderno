"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { track } from "@vercel/analytics";
import { useNotyf } from "@/components/ui/NotyfProvider";
import { clientEnv } from "@/config/env";

const serviceOptions = [
  { value: "", label: "Selecciona un servicio" },
  { value: "landing-page", label: "Landing Page" },
  { value: "sitio-web", label: "Sitio Web Completo" },
  { value: "e-commerce", label: "Tienda Online" },
  { value: "app-web", label: "Aplicación Web" },
  { value: "seo", label: "SEO Técnico" },
  { value: "automatizacion", label: "Automatización" },
  { value: "otro", label: "Otro" },
];

const budgetOptions = [
  { value: "", label: "¿Cuál es tu presupuesto?" },
  { value: "<1500", label: "Menos de $1,500 USD" },
  { value: "1500-6000", label: "$1,500 - $6,000 USD" },
  { value: "6000-25000", label: "$6,000 - $25,000 USD" },
  { value: "25000+", label: "Más de $25,000 USD" },
];

const timelineOptions = [
  { value: "", label: "¿Cuándo lo necesitas?" },
  { value: "urgent", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "2-3months", label: "En 2-3 meses" },
  { value: "flexible", label: "Sin prisa" },
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

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isSending, setIsSending] = useState(false);
  const { t } = useTranslation();
  const notyf = useNotyf();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  const [selectedService, setSelectedService] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");

  /* -------------------- parallax scroll effect -------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const formData = new FormData(form.current!);
      const response = await fetch('/api/contact/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('user_name'),
          email: formData.get('user_email'),
          message: formData.get('message'),
          service: selectedService,
          budget: selectedBudget,
          timeline: selectedTimeline,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error del servidor');
      }

      notyf.success("Mensaje enviado correctamente 🎉");
      track('contact_form_submitted');
      form.current?.reset();
      setSelectedService("");
      setSelectedBudget("");
      setSelectedTimeline("");
    } catch (error) {
      console.error("Error al enviar:", error);
      const msg = error instanceof Error ? error.message : "Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.";
      notyf.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen py-32 px-2 sm:px-4 overflow-hidden"
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
      <div className="relative z-10 container mx-auto max-w-full sm:max-w-4xl px-2 sm:px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="font-mono-label inline-flex items-center gap-2 px-4 py-2 mb-6 text-[0.65rem] rounded-full border"
            style={{
              color: "var(--accent-color)",
              backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
            {t("contact.badge")}
          </motion.span>

          <h2
            className="font-display italic text-4xl md:text-5xl lg:text-6xl font-medium mb-6"
            style={{ color: "var(--text-color)" }}
          >
            {t("contact.title")}
          </h2>

          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-color)" }}
          >
{t("contact.description")}
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
            className="backdrop-blur-xl border rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden"
            style={{
              backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 60%, transparent)`,
              borderColor: `color-mix(in srgb, var(--muted-color) 20%, transparent)`,
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            {/* Brillo sutil en la tarjeta */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
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
                  placeholder={t("contact.form.name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent"
                  style={{
                    borderColor:
                      focusedField === "name"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "name"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: "var(--text-color)",
                    boxShadow:
                      focusedField === "name"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                  required
                />
                {focusedField === "name" && (
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
                  placeholder={t("contact.form.email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent"
                  style={{
                    borderColor:
                      focusedField === "email"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "email"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: "var(--text-color)",
                    boxShadow:
                      focusedField === "email"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                  required
                />
                {focusedField === "email" && (
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

              {/* Campo Servicio */}
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <select
                  name="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  onFocus={() => setFocusedField("service")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent appearance-none"
                  style={{
                    borderColor:
                      focusedField === "service"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "service"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: selectedService ? "var(--text-color)" : "var(--muted-color)",
                    boxShadow:
                      focusedField === "service"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                >
                  {serviceOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-background text-text-color">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-color)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </motion.div>

              {/* Campo Presupuesto */}
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <select
                  name="budget"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  onFocus={() => setFocusedField("budget")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent appearance-none"
                  style={{
                    borderColor:
                      focusedField === "budget"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "budget"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: selectedBudget ? "var(--text-color)" : "var(--muted-color)",
                    boxShadow:
                      focusedField === "budget"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                >
                  {budgetOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-background text-text-color">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-color)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </motion.div>

              {/* Campo Timeline */}
              <motion.div
                className="relative md:col-span-2"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <select
                  name="timeline"
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                  onFocus={() => setFocusedField("timeline")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent appearance-none"
                  style={{
                    borderColor:
                      focusedField === "timeline"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "timeline"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: selectedTimeline ? "var(--text-color)" : "var(--muted-color)",
                    boxShadow:
                      focusedField === "timeline"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                >
                  {timelineOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-background text-text-color">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-color)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </motion.div>

              {/* Campo Mensaje - Ocupa 2 columnas */}
              <motion.div
                className="relative md:col-span-2"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <textarea
                  name="message"
                  placeholder={t("contact.form.message")}
                  rows={5}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 rounded-xl border transition-all duration-300 bg-transparent resize-none"
                  style={{
                    borderColor:
                      focusedField === "message"
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                    backgroundColor:
                      focusedField === "message"
                        ? `color-mix(in srgb, var(--accent-color) 5%, transparent)`
                        : `color-mix(in srgb, var(--background-color) 50%, transparent)`,
                    color: "var(--text-color)",
                    boxShadow:
                      focusedField === "message"
                        ? `0 0 20px color-mix(in srgb, var(--accent-color) 20%, transparent)`
                        : "none",
                  }}
                  required
                />
                {focusedField === "message" && (
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
              <motion.div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <motion.button
                  type="submit"
                  disabled={isSending}
                  whileHover={{ scale: isSending ? 1 : 1.05 }}
                  whileTap={{ scale: isSending ? 1 : 0.95 }}
                  className="relative w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isSending
                      ? `color-mix(in srgb, var(--accent-color) 50%, transparent)`
                      : `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                    color: "var(--white-color)",
                    boxShadow: isSending
                      ? "none"
                      : `0 15px 35px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
                  }}
                >
                  {!isSending && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-3">
                    {isSending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        {t("contact.form.sending")}
                      </>
                    ) : (
                      <>
                        {t("contact.form.send")}
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

                {/* Alternativa WhatsApp */}
                <a
                  href={`https://wa.me/${clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Omar, vi tu portafolio y me interesa trabajar contigo. ¿Podemos hablar?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#25D366",
                    color: "var(--white-color)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Directo
                </a>
              </motion.div>

              {/* Mensaje de confianza */}
              <div className="md:col-span-2 text-center mt-4">
                <p className="text-xs" style={{ color: "var(--muted-color)" }}>
                  Respondo en menos de 24 horas. Sin compromiso.
                </p>
              </div>
            </form>
          </div>
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
