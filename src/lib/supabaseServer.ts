import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/config/env";

export const supabaseServer = createClient(
  serverEnv.SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
