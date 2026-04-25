-- Actualización de la tabla subscribers para la newsletter
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Crear índice para el token de confirmación
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(confirmation_token);
