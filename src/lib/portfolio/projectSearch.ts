/**
 * Búsqueda y paginación de `ProjectsSection` (T-07), sacadas a un módulo sin
 * React ni `next-intl`: importar el componente en un test arrastra la cadena
 * `useTranslation` → `I18nContext` → `next-intl` (ESM), que Jest no puede
 * transformar. Aquí no hay nada de eso, así que se puede probar en aislado.
 */

interface ProyectoLocalizado {
  title: string;
  description: string;
  technologies: string[];
}

/**
 * ¿Coincide el proyecto con la búsqueda? Título + descripción + tecnologías,
 * sin distinguir mayúsculas. Misma regla de siempre.
 */
export function coincideConBusqueda(p: ProyectoLocalizado, termino: string): boolean {
  return `${p.title} ${p.description} ${p.technologies.join(' ')}`
    .toLowerCase()
    .includes(termino.toLowerCase());
}

/** La página 1 es el primer tramo de `porPagina`; igual que el cálculo que reemplaza. */
export function paginar<T>(items: readonly T[], pagina: number, porPagina: number): T[] {
  const inicio = (pagina - 1) * porPagina;
  return items.slice(inicio, inicio + porPagina);
}
