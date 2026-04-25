-- Habilitar extensión pgvector (requiere Supabase con pgvector disponible)
create extension if not exists vector;

-- Tabla real usada por el RAG del chatbot
-- Nota: el spec original pedía `knowledge_chunks` con dim 384 (@xenova/transformers).
-- La implementación real usa HuggingFace API con modelo all-mpnet-base-v2 (dim 768).
create table if not exists project_embeddings (
  id           uuid primary key default gen_random_uuid(),
  project_id   text not null unique,
  content      text not null,
  embedding    vector(768),
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

-- Índice HNSW para búsqueda por similitud coseno (eficiente en producción)
create index if not exists project_embeddings_embedding_idx
  on project_embeddings
  using hnsw (embedding vector_cosine_ops);

-- Función RPC usada por rag.ts para buscar proyectos relevantes
create or replace function match_projects(
  query_embedding vector(768),
  match_threshold float,
  match_count     int
)
returns table (
  id         uuid,
  project_id text,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable
as $$
  select
    pe.id,
    pe.project_id,
    pe.content,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) as similarity
  from project_embeddings pe
  where 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;
