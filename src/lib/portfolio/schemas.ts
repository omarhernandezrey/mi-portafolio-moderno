/**
 * Validación compartida de los módulos de edición de contenido (T-09 a T-12).
 *
 * El mismo esquema valida el cuerpo que llega a la API y el formulario del
 * panel: un campo que cambia de forma en un sitio y no en el otro es la
 * fuente más común de "funciona en la API pero el formulario no lo manda
 * bien" (o al revés). T-09 (proyectos) establece el patrón; T-10, T-11 y T-12
 * añaden su propio esquema aquí mismo, no en un archivo nuevo.
 */
import { z } from 'zod';

/** Slug de URL: minúsculas, dígitos y guiones, sin empezar/terminar en guion. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Falta el slug')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'El slug solo admite minúsculas, números y guiones');

/** `{es, en}` donde español es obligatorio (es el idioma de origen) e inglés opcional. */
export const localizedRequiredSchema = z.object({
  es: z.string().trim().min(1, 'Falta el texto en español'),
  en: z.string().trim().optional(),
});

export const localizedOptionalSchema = z
  .object({
    es: z.string().trim().optional(),
    en: z.string().trim().optional(),
  })
  .nullable()
  .optional();

/** URL vacía permitida; si no está vacía, debe ser una URL http(s) real. Sin `.default()`: lo añade cada esquema de creación, no este. */
const urlOrVacioSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Debe ser una URL http(s) o quedar vacío');

// ── Proyectos (T-09) ─────────────────────────────────────────────────────

/**
 * Forma compartida entre crear y actualizar, SIN `.default()` en ningún
 * campo. `.partial()` sobre un campo con `.default()` no lo omite cuando
 * falta en el cuerpo: lo rellena con el valor por omisión igual, así que un
 * PATCH que no toca `technologies` lo habría vaciado a `[]`, y uno que no
 * toca `is_published` lo habría vuelto a publicar. Los valores por omisión
 * viven solo en `projectCreateSchema`, donde "falta en el cuerpo" sí debe
 * convertirse en ese valor.
 */
const camposProyecto = {
  slug: slugSchema,
  title: localizedRequiredSchema,
  description: localizedRequiredSchema,
  /** Nombres TAL CUAL: coinciden literalmente con las claves de technologyIcons.tsx. */
  technologies: z.array(z.string().trim().min(1)),
  repository: urlOrVacioSchema,
  demo: urlOrVacioSchema,
  category: localizedOptionalSchema,
  image_url: z.string().trim().nullable().optional(),
  is_published: z.boolean(),
};

export const projectCreateSchema = z.object({
  ...camposProyecto,
  technologies: camposProyecto.technologies.default([]),
  repository: camposProyecto.repository.default(''),
  demo: camposProyecto.demo.default(''),
  is_published: camposProyecto.is_published.default(true),
});

export const projectUpdateSchema = z.object(camposProyecto).partial();

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// ── Skills (T-10) ────────────────────────────────────────────────────────

/** Hex vacío permitido; si no está vacío, deben ser 6 dígitos hex. Sin `.default()`, por la misma razón que `urlOrVacioSchema`. */
const hexOrVacioSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || /^#[0-9a-fA-F]{6}$/.test(v), 'Debe ser un color hex de 6 dígitos (p. ej. #00cba9) o quedar vacío');

const camposSkill = {
  slug: slugSchema,
  name: localizedRequiredSchema,
  /** Entero 0-100; el "%" lo añade la vista, no la base de datos (igual que `repository.ts`). */
  percentage: z.number().int().min(0).max(100),
  /** Dato del contenido (el color de esa tecnología), no un token de la interfaz: por eso admite cualquier hex, no los tokens del panel. */
  color_hex: hexOrVacioSchema,
  /** Ruta dentro de `public/`, p. ej. `/images/logos/react.svg`. Vacío si no tiene logo. */
  icon: z.string().trim(),
  description: localizedOptionalSchema,
  category: localizedOptionalSchema,
  is_published: z.boolean(),
};

export const skillCreateSchema = z.object({
  ...camposSkill,
  color_hex: camposSkill.color_hex.default(''),
  icon: camposSkill.icon.default(''),
  is_published: camposSkill.is_published.default(true),
});

export const skillUpdateSchema = z.object(camposSkill).partial();

export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;

/** Reordenar: el array completo de ids en el orden deseado; position se reescribe 0..n-1. */
export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Falta la lista de ids'),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
