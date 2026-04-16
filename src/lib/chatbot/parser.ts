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

/**
 * Extrae un bloque de texto entre marcadores específicos
 */
const extractBlock = (text: string, startMarker: string, endMarker: string = '<<<END>>>'): string | null => {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return null;

  const contentStart = startIdx + startMarker.length;
  const endIdx = text.indexOf(endMarker, contentStart);
  if (endIdx === -1) return null;

  return text.substring(contentStart, endIdx).trim();
};

/**
 * Parsea un bloque JSON de forma segura
 */
const parseSafeJSON = <T>(jsonStr: string | null): T | null => {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
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

/**
 * Elimina todos los bloques estructurados de la respuesta para que no sean visibles al usuario
 */
export const cleanReply = (text: string): string => {
  return text
    .replace(/<<<LEAD>>>[\s\S]*?<<<END>>>/g, '')
    .replace(/<<<HANDOFF>>>[\s\S]*?<<<END>>>/g, '')
    .replace(/<<<CALCOM>>>[\s\S]*?<<<END>>>/g, '')
    .trim();
};
