-- Migración completa para fixes de Mayo 2026
-- Aplicar en orden en Supabase SQL Editor

-- 1. Verificar y agregar columna industry a leads (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'industry'
    ) THEN
        ALTER TABLE leads ADD COLUMN industry TEXT;
        RAISE NOTICE 'Columna industry agregada a leads';
    ELSE
        RAISE NOTICE 'Columna industry ya existe en leads';
    END IF;
END $$;

-- 2. Verificar y agregar columna updated_at a leads (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE leads ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Columna updated_at agregada a leads';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe en leads';
    END IF;
END $$;

-- 3. Refrescar el caché de PostgREST (schema cache)
-- Esto es crucial para que la API de Supabase reconozca los cambios
NOTIFY pgrst, 'reload schema';

-- 4. Verificar columnas de la tabla leads
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;
