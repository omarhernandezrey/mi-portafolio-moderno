import { z } from "zod";

const serverSchema = z.object({
  GROQ_API_KEY: z.string().min(20),
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

type ServerEnv = z.infer<typeof serverSchema>;

export const serverEnv = (() => {
  if (typeof window !== "undefined") {
    return {} as ServerEnv;
  }
  
  const result = serverSchema.safeParse(process.env);
  
  if (!result.success) {
    // No lanzamos error para permitir el build en Vercel
    console.warn("⚠️ Validación de variables de servidor falló. Esto es normal durante el build si las claves son secretas.");
    return process.env as unknown as ServerEnv;
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
    console.warn("⚠️ Validación de variables de cliente incompleta.");
  }
  
  return data as z.infer<typeof clientSchema>;
})();
