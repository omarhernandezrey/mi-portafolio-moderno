-- Migración para el sistema de onboarding
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS onboarding_token TEXT,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS brief_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS contract_url TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Crear índice para el token de onboarding
CREATE INDEX IF NOT EXISTS idx_leads_onboarding_token ON leads(onboarding_token);

-- Habilitar RLS (service_role only por ahora)
-- Nota: El API se encargará de las validaciones de token.
