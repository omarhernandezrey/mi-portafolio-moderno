"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";

export default function BlogNewsletterCTA() {
  const isEn = useLocale() === 'en';
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isEn ? "Error subscribing" : "Error al suscribirse"));
      }
      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <section className="bg-background rounded-[32px] md:rounded-[60px] border border-white/5 p-8 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden text-center group hover:border-primary/20 transition-all duration-500">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />

      <div className="max-w-2xl mx-auto space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem] mb-6">
            Journal Subscription
          </div>
          <h2 className="font-display italic text-4xl md:text-5xl font-medium text-white-custom tracking-tight">
            {isEn ? (
              <>Get Technical Content <br /><span className="text-primary">Delivered Directly</span></>
            ) : (
              <>Recibe Contenido Técnico <br /><span className="text-primary">Directamente</span></>
            )}
          </h2>
          <p className="text-lg text-text-muted font-medium italic opacity-70 leading-relaxed max-w-lg mx-auto">
            {isEn
              ? 'Join the update protocol to receive in-depth analysis on the future of software development.'
              : 'Únase al protocolo de actualización para recibir análisis profundos sobre el futuro del desarrollo de software.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative group/form max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[24px] blur-lg opacity-10 group-focus-within/form:opacity-30 transition duration-500" />
          <div className="relative flex bg-card-bg/40 rounded-[24px] p-2 border border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group-focus-within/form:border-primary/20 transition-all">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isEn ? 'your-email@company.com' : 'su-email@compania.com'}
              className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 text-xs font-bold text-white-custom placeholder:text-text-muted/20 placeholder:italic"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-primary text-background px-8 py-3 rounded-[18px] font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100 shrink-0"
            >
              {status === "loading" ? (isEn ? "Sending..." : "Enviando...") : (isEn ? "Subscribe" : "Suscribirse")}
            </button>
          </div>
        </form>
        {status === "success" && (
          <p className="text-primary text-sm font-bold -mt-8">
            {isEn ? 'Successfully subscribed! Check your email.' : '¡Suscripción exitosa! Revisa tu correo.'}
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm font-bold -mt-8">
            {isEn ? 'Error subscribing. Please try again.' : 'Error al suscribirse. Inténtalo de nuevo.'}
          </p>
        )}
      </div>
    </section>
  );
}
