import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  ADMIN_ALLOWED_EMAILS: z.string().optional(),
  CRON_SECRET: z.string().min(10),
  RESEND_API_KEY: z.string().optional(),
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),
  DEV_TO_API_KEY: z.string().optional(),
  HASHNODE_TOKEN: z.string().optional(),
  HASHNODE_PUBLICATION_ID: z.string().optional(),
});

export const serverEnv = {
  get SUPABASE_URL() { return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""; },
  get SUPABASE_ANON_KEY() { return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ""; },
  get TELEGRAM_BOT_TOKEN() { return process.env.TELEGRAM_BOT_TOKEN || ""; },
  get TELEGRAM_CHAT_ID() { return process.env.TELEGRAM_CHAT_ID || ""; },
  get TELEGRAM_BOT_USERNAME() { return process.env.TELEGRAM_BOT_USERNAME || ""; },
  get TELEGRAM_WEBHOOK_SECRET() { return process.env.TELEGRAM_WEBHOOK_SECRET || ""; },
  /** Lista opcional separada por comas. Si está vacía, cualquier usuario con rol en user_roles puede entrar. */
  get ADMIN_ALLOWED_EMAILS() { return process.env.ADMIN_ALLOWED_EMAILS || ""; },
  get CRON_SECRET() { return process.env.CRON_SECRET || ""; },
  get RESEND_API_KEY() { return process.env.RESEND_API_KEY || ""; },
  get NOTION_API_KEY() { return process.env.NOTION_API_KEY || ""; },
  get NOTION_DATABASE_ID() { return process.env.NOTION_DATABASE_ID || ""; },

  // Auto-submit keys
  get DEV_TO_API_KEY() { return process.env.DEV_TO_API_KEY || ""; },
  get HASHNODE_TOKEN() { return process.env.HASHNODE_TOKEN || ""; },
  get HASHNODE_PUBLICATION_ID() { return process.env.HASHNODE_PUBLICATION_ID || ""; },

  // SEO verification keys
  get INDEXNOW_API_KEY() { return process.env.INDEXNOW_API_KEY || ""; },

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
  get IS_DEV() { return process.env.NODE_ENV !== "production"; },
  get NEXT_PUBLIC_SUPABASE_URL() { return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""; },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""; },
  get NEXT_PUBLIC_CALCOM_INTERVIEW_URL() { return process.env.NEXT_PUBLIC_CALCOM_INTERVIEW_URL || ""; },
  get NEXT_PUBLIC_CALCOM_CONSULT_URL() { return process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL || ""; },
  get NEXT_PUBLIC_WHATSAPP_NUMBER() { return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""; },
  get NEXT_PUBLIC_SITE_URL() { return process.env.NEXT_PUBLIC_SITE_URL || ""; },
  
  // URLs de Pago
  get NEXT_PUBLIC_PAYMENT_PAYPAL_URL() { return process.env.NEXT_PUBLIC_PAYMENT_PAYPAL_URL || ""; },
  get NEXT_PUBLIC_PAYMENT_WOMPI_URL() { return process.env.NEXT_PUBLIC_PAYMENT_WOMPI_URL || ""; },
  get NEXT_PUBLIC_PAYMENT_NEQUI_QR() { return process.env.NEXT_PUBLIC_PAYMENT_NEQUI_QR || ""; },

  // SEO verification (Google Search Console & Bing Webmaster)
  get NEXT_PUBLIC_GSC_VERIFICATION() { return process.env.NEXT_PUBLIC_GSC_VERIFICATION || ""; },
  get NEXT_PUBLIC_BING_VERIFICATION() { return process.env.NEXT_PUBLIC_BING_VERIFICATION || ""; },
};
