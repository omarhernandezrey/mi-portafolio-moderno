import { HfInference } from '@huggingface/inference';
import { serverEnv } from '@/config/env';
import { supabaseServer } from '@/lib/supabaseServer';

const hf = new HfInference(serverEnv.HF_TOKEN);
const MODEL = 'sentence-transformers/all-mpnet-base-v2'; // Genera vectores de 768 dimensiones

/**
 * Genera el embedding de un texto usando HuggingFace (Gratis)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const output = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    });
    return output as number[];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Busca proyectos similares en la base de datos vectorial
 */
export async function searchProjects(query: string, limit = 3) {
  try {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabaseServer.rpc('match_projects', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('RAG search error:', error);
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
