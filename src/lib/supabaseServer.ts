import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/config/env";

// Validamos la URL antes de inicializar para evitar que Vercel detenga el build
const supabaseUrl = serverEnv.SUPABASE_URL && serverEnv.SUPABASE_URL.startsWith('http') 
  ? serverEnv.SUPABASE_URL 
  : "https://placeholder-for-build.supabase.co";

const supabaseKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);
