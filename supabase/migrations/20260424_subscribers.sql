-- Migración para la tabla de suscriptores (Lead Magnets)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- e.g., 'checklist-pdf', 'guia-precios-pdf'
  consent_at TIMESTAMPTZ DEFAULT now(),
  followup_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexar por email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Habilitar RLS (service_role only por ahora, ya que el API se encarga de insertar)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
