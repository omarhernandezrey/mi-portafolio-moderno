export interface Lead {
  type: 'client' | 'recruiter' | 'other';
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service_requested: string | null;
  budget: string | null;
  timeline: string | null;
  notes: string;
}

export interface Handoff {
  summary: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Calcom {
  type: 'consult' | 'interview';
}

// Normaliza variaciones de <<<END>>> que los LLMs generan (<<<END>, <<<END>>, <<<END>>>)
const normalizeEndMarkers = (text: string): string =>
  text.replace(/<<<END>{1,3}/g, '<<<END>>>');

const extractBlock = (text: string, startMarker: string): string | null => {
  const normalized = normalizeEndMarkers(text);
  const startIdx = normalized.indexOf(startMarker);
  if (startIdx === -1) return null;

  const contentStart = startIdx + startMarker.length;
  const endIdx = normalized.indexOf('<<<END>>>', contentStart);
  if (endIdx === -1) {
    // Fallback: extraer todo el JSON entre { } después del marcador
    const afterMarker = normalized.substring(contentStart).trim();
    const match = afterMarker.match(/^\{[\s\S]*?\}/);
    return match ? match[0] : null;
  }

  return normalized.substring(contentStart, endIdx).trim();
};

/**
 * Parsea un bloque JSON de forma segura
 */
const parseSafeJSON = <T>(jsonStr: string | null): T | null => {
  if (!jsonStr) return null;
  try {
    // Limpiamos posibles caracteres invisibles o espacios al inicio/final del bloque
    const cleaned = jsonStr.trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    // Si falla el primer intento, intentamos extraer solo lo que parece un objeto JSON {}
    try {
      const matches = jsonStr.match(/\{[\s\S]*\}/);
      if (matches) {
        return JSON.parse(matches[0]) as T;
      }
    } catch (e) {
      console.error('Final attempt to parse JSON failed:', e);
    }
    console.error('Error parsing chatbot JSON block:', error);
    return null;
  }
};

export const extractLead = (text: string): Lead | null => {
  return parseSafeJSON<Lead>(extractBlock(text, '<<<LEAD>>>'));
};

export const extractHandoff = (text: string): Handoff | null => {
  return parseSafeJSON<Handoff>(extractBlock(text, '<<<HANDOFF>>>'));
};

export const extractCalcom = (text: string): Calcom | null => {
  return parseSafeJSON<Calcom>(extractBlock(text, '<<<CALCOM>>>'));
};

export const cleanReply = (text: string): string => {
  const normalized = normalizeEndMarkers(text);
  return normalized
    .replace(/<<<LEAD>>>[\s\S]*?<<<END>>>/g, '')
    .replace(/<<<HANDOFF>>>[\s\S]*?<<<END>>>/g, '')
    .replace(/<<<CALCOM>>>[\s\S]*?<<<END>>>/g, '')
    .trim();
};
