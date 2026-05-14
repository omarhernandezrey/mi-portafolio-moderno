-- Schema de Supabase para el Chatbot (Generado automáticamente)
-- Fecha: 2026-04-24

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Tablas
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id text NOT NULL,
    visitor_name text,
    visitor_email text,
    visitor_phone text,
    intent text,
    summary text,
    language text DEFAULT 'es'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    consent_at timestamp with time zone,
    variant text
);

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id),
    type text CHECK (type IN ('client', 'recruiter', 'other')),
    name text,
    email text,
    phone text,
    company text,
    budget text,
    timeline text,
    service_requested text,
    notes text,
    status text DEFAULT 'new'::text,
    industry text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    provider text NOT NULL,
    latency_ms integer,
    status text,
    error_message text,
    http_status integer,
    session_id text
);

CREATE TABLE IF NOT EXISTS public.project_embeddings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id text NOT NULL,
    content text NOT NULL,
    embedding vector(1536), -- Ajustado a 1536 para OpenAI/estándar
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_session ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_embeddings ENABLE ROW LEVEL SECURITY;

-- Políticas (Solo service_role por defecto)
-- Nota: Si necesitas acceso anon/authenticated, añadir políticas específicas aquí.
