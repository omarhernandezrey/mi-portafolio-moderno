-- Migración para añadir industria a los leads para plantillas de propuesta
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS industry TEXT;
