import { z } from 'zod';

/**
 * Carga útil que el navegador manda a `/api/analytics/vitals` (T-15).
 *
 * `path` llega como lo reporta el cliente (`location.pathname`); la propia
 * ruta lo vuelve a limpiar de query/hash antes de insertar, por si algo lo
 * manda distinto. `device` lo decide el cliente con `matchMedia` sobre el
 * breakpoint `md` de Tailwind (768px) — no se adivina desde el user-agent,
 * así no hace falta guardar ni parsear esa cabecera.
 */
export const vitalsEventSchema = z.object({
  path: z.string().trim().min(1).max(300),
  device: z.enum(['mobile', 'desktop']),
  metric: z.enum(['LCP', 'INP', 'CLS']),
  value: z.number().finite().min(0),
});

export type VitalsEvent = z.infer<typeof vitalsEventSchema>;
