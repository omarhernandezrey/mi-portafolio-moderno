import { z } from "zod";

const serverSchema = z.object({
  GROQ_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(4),
  ADMIN_SECRET: z.string().min(10),
  CRON_SECRET: z.string().min(10),
  HF_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),
  // FASE 27 — proveedores LLM de respaldo (todos opcionales)
  OPENROUTER_API_KEY: z.string().optional(),
  CEREBRAS_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().optional(),
  LLM_PROVIDER_CHAIN: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_MISTRAL_API_KEY: z.string().optional(),
  NVIDIA_KIMI_API_KEY: z.string().optional(),
  NVIDIA_NEMOTRON_API_KEY: z.string().optional(),
  NVIDIA_LLAMA4_API_KEY: z.string().optional(),
  NVIDIA_MISTRAL_NEMOTRON_API_KEY: z.string().optional(),
  NVIDIA_PHI4_API_KEY: z.string().optional(),
  NVIDIA_GEMMA3_API_KEY: z.string().optional(),
  NVIDIA_DRACARYS_API_KEY: z.string().optional(),
  NVIDIA_SOLAR_API_KEY: z.string().optional(),
  DEV_TO_API_KEY: z.string().optional(),
  HASHNODE_TOKEN: z.string().optional(),
  HASHNODE_PUBLICATION_ID: z.string().optional(),
});

export const serverEnv = {
  get GROQ_API_KEY() { return process.env.GROQ_API_KEY || ""; },
  get SUPABASE_URL() { return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""; },
  get SUPABASE_ANON_KEY() { return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ""; },
  get TELEGRAM_BOT_TOKEN() { return process.env.TELEGRAM_BOT_TOKEN || ""; },
  get TELEGRAM_CHAT_ID() { return process.env.TELEGRAM_CHAT_ID || ""; },
  get TELEGRAM_BOT_USERNAME() { return process.env.TELEGRAM_BOT_USERNAME || ""; },
  get TELEGRAM_WEBHOOK_SECRET() { return process.env.TELEGRAM_WEBHOOK_SECRET || ""; },
  get ADMIN_PASSWORD() { return process.env.ADMIN_PASSWORD || ""; },
  get ADMIN_SECRET() { return process.env.ADMIN_SECRET || ""; },
  get CRON_SECRET() { return process.env.CRON_SECRET || ""; },
  get HF_TOKEN() { return process.env.HF_TOKEN || ""; },
  get RESEND_API_KEY() { return process.env.RESEND_API_KEY || ""; },
  get NOTION_API_KEY() { return process.env.NOTION_API_KEY || ""; },
  get NOTION_DATABASE_ID() { return process.env.NOTION_DATABASE_ID || ""; },

  // FASE 27 — multi-provider failover
  get OPENROUTER_API_KEY() { return process.env.OPENROUTER_API_KEY || ""; },
  get CEREBRAS_API_KEY() { return process.env.CEREBRAS_API_KEY || ""; },
  get MISTRAL_API_KEY() { return process.env.MISTRAL_API_KEY || ""; },
  get DEEPSEEK_API_KEY() { return process.env.DEEPSEEK_API_KEY || ""; },
  get CLOUDFLARE_ACCOUNT_ID() { return process.env.CLOUDFLARE_ACCOUNT_ID || ""; },
  get CLOUDFLARE_API_TOKEN() { return process.env.CLOUDFLARE_API_TOKEN || ""; },
  get OLLAMA_BASE_URL() { return process.env.OLLAMA_BASE_URL || "http://localhost:11434"; },
  get OLLAMA_MODEL() { return process.env.OLLAMA_MODEL || "llama3.2:3b"; },
  get LLM_PROVIDER_CHAIN() { return process.env.LLM_PROVIDER_CHAIN || ""; },
  get NVIDIA_API_KEY() { return process.env.NVIDIA_API_KEY || ""; },
  get NVIDIA_MISTRAL_API_KEY() { return process.env.NVIDIA_MISTRAL_API_KEY || ""; },
  get NVIDIA_KIMI_API_KEY() { return process.env.NVIDIA_KIMI_API_KEY || ""; },
  get NVIDIA_NEMOTRON_API_KEY() { return process.env.NVIDIA_NEMOTRON_API_KEY || ""; },
  get NVIDIA_LLAMA4_API_KEY() { return process.env.NVIDIA_LLAMA4_API_KEY || ""; },
  get NVIDIA_MISTRAL_NEMOTRON_API_KEY() { return process.env.NVIDIA_MISTRAL_NEMOTRON_API_KEY || ""; },
  get NVIDIA_PHI4_API_KEY() { return process.env.NVIDIA_PHI4_API_KEY || ""; },
  get NVIDIA_GEMMA3_API_KEY() { return process.env.NVIDIA_GEMMA3_API_KEY || ""; },
  get NVIDIA_DRACARYS_API_KEY() { return process.env.NVIDIA_DRACARYS_API_KEY || ""; },
  get NVIDIA_SOLAR_API_KEY() { return process.env.NVIDIA_SOLAR_API_KEY || ""; },

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
  get NEXT_PUBLIC_PAYMENT_NEQUI_URL() { return process.env.NEXT_PUBLIC_PAYMENT_NEQUI_URL || ""; },
  get NEXT_PUBLIC_PAYMENT_NEQUI_QR() { return process.env.NEXT_PUBLIC_PAYMENT_NEQUI_QR || ""; },
  get NEXT_PUBLIC_PAYMENT_MP_URL() { return process.env.NEXT_PUBLIC_PAYMENT_MP_URL || ""; },
  get NEXT_PUBLIC_PAYMENT_BINANCE_ID() { return process.env.NEXT_PUBLIC_PAYMENT_BINANCE_ID || ""; },

  // SEO verification (Google Search Console & Bing Webmaster)
  get NEXT_PUBLIC_GSC_VERIFICATION() { return process.env.NEXT_PUBLIC_GSC_VERIFICATION || ""; },
  get NEXT_PUBLIC_BING_VERIFICATION() { return process.env.NEXT_PUBLIC_BING_VERIFICATION || ""; },
};
