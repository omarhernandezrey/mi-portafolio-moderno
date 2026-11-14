/**
 * Guardarraíl de los tipos generados de la base de datos.
 *
 * `src/types/database.types.ts` se genera contra el Supabase real, pero pasa por
 * un copiado manual hasta el repositorio, y ahí se cuela el error humano: en la
 * primera versión de este archivo el enum `user_role` quedó escrito como
 * `["owner","assistant","viewid"]`. Compilaba igual, porque `Constants` es un
 * valor, no un tipo, y nadie lo habría notado hasta un fallo en producción.
 *
 * Este test cruza los tipos generados con las dos fuentes que ya viven en el
 * repositorio —la migración del portafolio y la matriz de roles del panel— para
 * que un error de transcripción falle aquí.
 *
 * Al regenerar los tipos, si este test falla: se revisa el copiado, no el test.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Constants, type Database } from '@/types/database.types';
import { ADMIN_ROLES } from '@/lib/admin/roles';
import { PORTFOLIO_TABLES, type PortfolioTableName } from '@/lib/portfolio/types';

const RAIZ = join(__dirname, '..', '..');
const migracion = readFileSync(
  join(RAIZ, 'supabase/migrations/20261112_portfolio_content.sql'),
  'utf8',
);

describe('enum user_role', () => {
  it('coincide con los roles que usa el panel', () => {
    // Si el enum de la base y la matriz de permisos se separan, un rol válido
    // en la base deja de tener permisos definidos, o al revés.
    expect([...Constants.public.Enums.user_role].sort()).toEqual(
      [...ADMIN_ROLES].sort(),
    );
  });

  it('no contiene valores malformados', () => {
    for (const rol of Constants.public.Enums.user_role) {
      expect(rol).toMatch(/^(owner|assistant|viewer)$/);
    }
  });
});

describe('las tablas del portafolio están en los tipos generados', () => {
  const tablas = Object.keys(PORTFOLIO_TABLES) as PortfolioTableName[];

  it('las 9 tablas de T-04 existen en Database["public"]["Tables"]', () => {
    // Comprobación en tiempo de compilación: si una tabla falta en los tipos
    // generados, esta asignación no compila.
    type TablasGeneradas = keyof Database['public']['Tables'];
    const presentes: Record<PortfolioTableName, TablasGeneradas> = {
      portfolio_projects: 'portfolio_projects',
      portfolio_skills: 'portfolio_skills',
      portfolio_education_categories: 'portfolio_education_categories',
      portfolio_education_items: 'portfolio_education_items',
      portfolio_badges: 'portfolio_badges',
      portfolio_services: 'portfolio_services',
      portfolio_technologies: 'portfolio_technologies',
      portfolio_timeline: 'portfolio_timeline',
      portfolio_profile: 'portfolio_profile',
    };
    expect(Object.keys(presentes).sort()).toEqual([...tablas].sort());
  });
});

describe('la migración aplicada en Supabase es la del repositorio', () => {
  it('el año del timeline es jsonb, no text', () => {
    // El 4.º hito tiene el año traducido; una columna text perdería un idioma.
    expect(migracion).toContain('year jsonb not null');
    expect(migracion).not.toContain('year text not null');
  });

  it('revoca escritura a anon y authenticated', () => {
    // TRUNCATE no pasa por RLS: el permiso se revoca, no se confía en RLS.
    expect(migracion).toMatch(
      /revoke insert, update, delete, truncate on public\.%I from anon, authenticated/,
    );
  });

  it('la función de updated_at fija search_path', () => {
    // Sin esto el linter de Supabase la marca como «search path mutable».
    expect(migracion).toContain("set search_path = ''");
  });
});
