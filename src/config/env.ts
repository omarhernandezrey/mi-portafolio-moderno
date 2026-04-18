import { z } from "zod";

const serverSchema = z.object({
  GROQ_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
});

export const serverEnv = {
  get GROQ_API_KEY() { return process.env.GROQ_API_KEY || ""; },
  get SUPABASE_URL() { return process.env.SUPABASE_URL || ""; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ""; },
  get TELEGRAM_BOT_TOKEN() { return process.env.TELEGRAM_BOT_TOKEN || ""; },
  get TELEGRAM_CHAT_ID() { return process.env.TELEGRAM_CHAT_ID || ""; },
  
  // Función para validar solo cuando sea necesario
  validate() {
    if (typeof window !== "undefined") return;
    const result = serverSchema.safeParse(process.env);
    if (!result.success) {
      console.error("❌ Faltan variables de entorno en el servidor:", result.error.format());
    }
  }
};

export const clientEnv = {
  get NEXT_PUBLIC_CALCOM_INTERVIEW_URL() { return process.env.NEXT_PUBLIC_CALCOM_INTERVIEW_URL || ""; },
  get NEXT_PUBLIC_CALCOM_CONSULT_URL() { return process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL || ""; },
  get NEXT_PUBLIC_WHATSAPP_NUMBER() { return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""; },
  get NEXT_PUBLIC_SITE_URL() { return process.env.NEXT_PUBLIC_SITE_URL || ""; },
};
