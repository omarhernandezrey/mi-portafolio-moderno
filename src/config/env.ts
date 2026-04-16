import { z } from "zod";

const serverSchema = z.object({
  GOOGLE_API_KEY: z.string().min(20),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  TELEGRAM_BOT_TOKEN: z.string().min(20),
  TELEGRAM_CHAT_ID: z.string().min(3),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CALCOM_INTERVIEW_URL: z.string().url(),
  NEXT_PUBLIC_CALCOM_CONSULT_URL: z.string().url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^\d{10,15}$/),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const serverEnv = (() => {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv solo puede usarse en el servidor para proteger tus claves.");
  }
  
  const result = serverSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Error en variables de entorno del SERVIDOR:", result.error.format());
    throw new Error("Faltan variables de entorno críticas en el servidor.");
  }
  
  return result.data;
})();

export const clientEnv = (() => {
  const data = {
    NEXT_PUBLIC_CALCOM_INTERVIEW_URL: process.env.NEXT_PUBLIC_CALCOM_INTERVIEW_URL,
    NEXT_PUBLIC_CALCOM_CONSULT_URL: process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  const result = clientSchema.safeParse(data);
  
  if (!result.success) {
    console.error("❌ Error en variables de entorno del CLIENTE:", result.error.format());
    // En el cliente no lanzamos error fatal para no romper la web, pero avisamos
  }
  
  return data as z.infer<typeof clientSchema>;
})();
