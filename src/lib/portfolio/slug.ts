/**
 * Slugs deterministas del contenido del portafolio.
 *
 * Vivía dentro de `seed/build.ts`, pero ese módulo importa los 9 módulos de
 * contenido completos (proyectos, skills, educación…) solo para construir el
 * seed — nada que un componente de cliente deba arrastrar a su bundle por
 * usar `slugificar` en una `key` de React (T-07). Aquí no depende de nada.
 */

/**
 * Slug determinista a partir de un texto en español: sin tildes, en
 * minúsculas, con guiones. Determinista a propósito: el seed se ejecuta más
 * de una vez y el `on conflict (slug)` solo funciona si el slug no cambia.
 */
export function slugificar(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // quita diacríticos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'sin-titulo'
  );
}

/**
 * Desambigua slugs repetidos con un sufijo numérico. Hace falta: entre 172
 * ítems de educación hay títulos que se repiten entre instituciones.
 *
 * El orden de llamada decide quién se queda el slug limpio, así que se
 * recorre siempre el contenido en su orden original.
 */
export function creadorDeSlugs() {
  const usados = new Map<string, number>();
  return (texto: string): string => {
    const base = slugificar(texto);
    const vistas = usados.get(base) ?? 0;
    usados.set(base, vistas + 1);
    return vistas === 0 ? base : `${base}-${vistas + 1}`;
  };
}
