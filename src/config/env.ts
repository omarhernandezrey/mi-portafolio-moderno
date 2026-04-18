import { z } from "zod";

const serverSchema = z.object({
  GROQ_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CALCOM_INTERVIEW_URL: z.string().url(),
  NEXT_PUBLIC_CALCOM_CONSULT_URL: z.string().url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

export const serverEnv = (() => {
  if (typeof window !== "undefined") return {} as ServerEnv;
  
  const result = serverSchema.safeParse(process.env);
  
  if (!result.success) {
    return {
      GROQ_API_KEY: process.env.GROQ_API_KEY || "build_placeholder",
      SUPABASE_URL: process.env.SUPABASE_URL || "https://placeholder.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "build_placeholder",
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "build_placeholder",
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "000000000",
    } as ServerEnv;
  }
  
  return result.data;
})();

export const clientEnv = (() => {
  const data = {
    NEXT_PUBLIC_CALCOM_INTERVIEW_URL: process.env.NEXT_PUBLIC_CALCOM_INTERVIEW_URL || "https://cal.com",
    NEXT_PUBLIC_CALCOM_CONSULT_URL: process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL || "https://cal.com",
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "000",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://localhost",
  };

  const result = clientSchema.safeParse(data);
  
  if (!result.success) {
    return data as ClientEnv;
  }
  
  return result.data;
})();
