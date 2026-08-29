/**
 * Forma canónica de un lead. Vivía en `src/lib/chatbot/parser.ts` (eliminado
 * junto con el chatbot); se movió aquí porque lo usan el formulario de
 * contacto (`contactBridge.ts`) y el CRM de Notion (`notion.ts`).
 */
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
