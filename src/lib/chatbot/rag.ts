import { InferenceClient } from '@huggingface/inference';
import { serverEnv } from '@/config/env';
import { supabaseServer } from '@/lib/supabaseServer';

const MODEL = 'sentence-transformers/all-mpnet-base-v2';

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!serverEnv.HF_TOKEN) return null;
  try {
    const hf = new InferenceClient(serverEnv.HF_TOKEN);
    const output = await hf.featureExtraction({ model: MODEL, inputs: text });
    return output as number[];
  } catch {
    // HF unavailable — RAG disabled gracefully, chat continues without project context
    return null;
  }
}

/**
 * Busca proyectos similares en la base de datos vectorial.
 * Retorna [] sin lanzar errores si HF o Supabase no están disponibles.
 */
export async function searchProjects(query: string, limit = 3) {
  try {
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    const { data, error } = await supabaseServer.rpc('match_projects', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Indexa un proyecto en la base de datos vectorial
 */
export async function indexProject(projectId: string, content: string, metadata: Record<string, unknown> = {}) {
  try {
    const embedding = await generateEmbedding(content);

    const { error } = await supabaseServer.from('project_embeddings').upsert({
      project_id: projectId,
      content: content,
      embedding: embedding,
      metadata: metadata,
    }, { onConflict: 'project_id' }); // Requiere que project_id sea unique o manejarlo distinto

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error indexing project ${projectId}:`, error);
    return false;
  }
}
