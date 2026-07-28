"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { clientEnv } from "@/config/env";

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const tooltipTimer = setTimeout(() => setShowTooltip(true), 1000);
      const hideTooltipTimer = setTimeout(() => setShowTooltip(false), 6000);
      return () => {
        clearTimeout(tooltipTimer);
        clearTimeout(hideTooltipTimer);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Tooltip */}
      {showTooltip && (
        <div className="mb-3 px-4 py-2.5 bg-white text-gray-900 rounded-xl shadow-xl text-sm font-medium animate-bounce relative">
          ¿Hablemos por WhatsApp? 💬
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white rotate-45 shadow-sm" />
        </div>
      )}

      {/* Botón WhatsApp */}
      <a
        href={`https://wa.me/${clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Omar, vi tu portafolio y me interesa trabajar contigo. ¿Podemos hablar?")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-2xl hover:shadow-[#25D366]/30 hover:scale-110 transition-all duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={32} className="text-white group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
}
