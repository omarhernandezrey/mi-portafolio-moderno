-- Migración para añadir columna updated_at a leads (requerida para LeadActions)
-- Fecha: 2026-05-13
-- Issue: Los botones de Control de Pipeline no funcionaban porque intentaban actualizar updated_at

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Opcional: Crear trigger para actualizar updated_at automáticamente
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';
-- 
-- DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
-- CREATE TRIGGER update_leads_updated_at
--     BEFORE UPDATE ON leads
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();
