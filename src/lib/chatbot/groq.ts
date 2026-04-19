// DEPRECATED (FASE 27): la lógica vive en `./llm.ts` con failover multi-proveedor.
// Este archivo se mantiene como reexport delgado para no romper imports antiguos.
export { generateReply } from './llm';
