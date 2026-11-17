/**
 * NAV_ITEMS y la matriz de permisos (T-08): introducir el campo `area` no
 * debe mover ningún destino existente de URL ni cambiar a quién se le
 * muestra. Solo el contenido de `/admin` cambia (pasa a ser el resumen del
 * portafolio); todos los demás destinos, antes agrupados sin áreas, ahora
 * viven bajo `area: 'negocio'` con sus mismos roles.
 */
import { ADMIN_API_PERMISSIONS, ADMIN_PATH_PERMISSIONS, NAV_ITEMS, canAccessAdminPath, minRoleForApiRequest } from '@/lib/admin/permissions';

const DESTINOS_DE_NEGOCIO_INTACTOS: ReadonlyArray<{ href: string; roles: readonly string[] }> = [
  { href: '/admin/leads', roles: ['owner', 'assistant', 'viewer'] },
  { href: '/admin/tickets', roles: ['owner', 'assistant', 'viewer'] },
  { href: '/admin/feed', roles: ['owner', 'assistant', 'viewer'] },
  { href: '/admin/timer', roles: ['owner', 'assistant'] },
  { href: '/admin/invoices', roles: ['owner'] },
  { href: '/admin/reports/time', roles: ['owner'] },
  { href: '/admin/subscribers', roles: ['owner'] },
  { href: '/admin/webhooks', roles: ['owner'] },
  { href: '/admin/logs', roles: ['owner'] },
  { href: '/admin/audit', roles: ['owner'] },
  { href: '/admin/security', roles: ['owner'] },
  { href: '/admin/docs', roles: ['owner', 'assistant'] },
];

describe('NAV_ITEMS', () => {
  it('ningún destino de Negocio perdió su URL ni cambió de rol al introducir `area`', () => {
    for (const destino of DESTINOS_DE_NEGOCIO_INTACTOS) {
      const item = NAV_ITEMS.find((i) => i.href === destino.href);
      expect(item).toBeDefined();
      expect(item?.area).toBe('negocio');
      expect(item?.roles).toEqual(destino.roles);
    }
  });

  it('cada destino de Negocio está exactamente una vez (sin duplicados tras el reordenamiento)', () => {
    const hrefsDeNegocio = NAV_ITEMS.filter((i) => i.area === 'negocio').map((i) => i.href);
    expect(new Set(hrefsDeNegocio).size).toBe(hrefsDeNegocio.length);
    expect(hrefsDeNegocio.length).toBe(DESTINOS_DE_NEGOCIO_INTACTOS.length + 1); // + el "Resumen" de Negocio
  });

  it('`/admin` (Portafolio) y `/admin/negocio` son dos "Resumen" distintos, uno por área, visibles a los tres roles', () => {
    const resumenPortafolio = NAV_ITEMS.find((i) => i.href === '/admin');
    const resumenNegocio = NAV_ITEMS.find((i) => i.href === '/admin/negocio');

    expect(resumenPortafolio?.area).toBe('portfolio');
    expect(resumenNegocio?.area).toBe('negocio');
    expect(resumenPortafolio?.roles).toEqual(['owner', 'assistant', 'viewer']);
    expect(resumenNegocio?.roles).toEqual(['owner', 'assistant', 'viewer']);
  });

  it('el filtrado por rol no cambió: un viewer sigue sin ver los destinos solo-owner ni solo-owner/assistant', () => {
    const paraViewer = NAV_ITEMS.filter((i) => i.roles.includes('viewer'));
    const hrefsParaViewer = paraViewer.map((i) => i.href);

    expect(hrefsParaViewer).toContain('/admin/leads');
    expect(hrefsParaViewer).toContain('/admin/tickets');
    expect(hrefsParaViewer).not.toContain('/admin/invoices');
    expect(hrefsParaViewer).not.toContain('/admin/webhooks');
    expect(hrefsParaViewer).not.toContain('/admin/timer');
  });
});

describe('NAV_ITEMS — Proyectos (T-09)', () => {
  it('«Proyectos» vive en el área portfolio, grupo core, visible a los tres roles', () => {
    const proyectos = NAV_ITEMS.find((i) => i.href === '/admin/proyectos');
    expect(proyectos).toBeDefined();
    expect(proyectos?.area).toBe('portfolio');
    expect(proyectos?.group).toBe('core');
    expect(proyectos?.roles).toEqual(['owner', 'assistant', 'viewer']);
  });
});

describe('NAV_ITEMS — Skills (T-10)', () => {
  it('«Skills» vive en el área portfolio, grupo core, visible a los tres roles', () => {
    const skills = NAV_ITEMS.find((i) => i.href === '/admin/skills');
    expect(skills).toBeDefined();
    expect(skills?.area).toBe('portfolio');
    expect(skills?.group).toBe('core');
    expect(skills?.roles).toEqual(['owner', 'assistant', 'viewer']);
  });
});

describe('NAV_ITEMS — Educación (T-11)', () => {
  it('«Educación» vive en el área portfolio, grupo core, visible a los tres roles', () => {
    const educacion = NAV_ITEMS.find((i) => i.href === '/admin/educacion');
    expect(educacion).toBeDefined();
    expect(educacion?.area).toBe('portfolio');
    expect(educacion?.group).toBe('core');
    expect(educacion?.roles).toEqual(['owner', 'assistant', 'viewer']);
  });
});

describe('permisos de API de /api/admin/portfolio (T-09)', () => {
  it('cualquier rol admin puede leer; solo owner puede escribir', () => {
    expect(minRoleForApiRequest('/api/admin/portfolio/projects', 'GET')).toBe('viewer');
    expect(minRoleForApiRequest('/api/admin/portfolio/projects', 'POST')).toBe('owner');
    expect(minRoleForApiRequest('/api/admin/portfolio/projects/abc', 'PATCH')).toBe('owner');
    expect(minRoleForApiRequest('/api/admin/portfolio/projects/abc', 'DELETE')).toBe('owner');
  });

  it('el mismo prefijo cubre /skills (T-10) sin necesitar una entrada nueva', () => {
    expect(minRoleForApiRequest('/api/admin/portfolio/skills', 'GET')).toBe('viewer');
    expect(minRoleForApiRequest('/api/admin/portfolio/skills', 'POST')).toBe('owner');
  });

  it('el mismo prefijo cubre education-categories/education-items/badges (T-11) sin entradas nuevas', () => {
    for (const recurso of ['education-categories', 'education-items', 'badges']) {
      expect(minRoleForApiRequest(`/api/admin/portfolio/${recurso}`, 'GET')).toBe('viewer');
      expect(minRoleForApiRequest(`/api/admin/portfolio/${recurso}`, 'POST')).toBe('owner');
    }
  });

  it('el prefijo /api/admin/portfolio está antes que el catch-all /api/admin', () => {
    const portfolio = ADMIN_API_PERMISSIONS.find((p) => p.prefix === '/api/admin/portfolio');
    const catchAll = ADMIN_API_PERMISSIONS.find((p) => p.prefix === '/api/admin');
    expect(portfolio).toBeDefined();
    expect(ADMIN_API_PERMISSIONS.indexOf(portfolio!)).toBeLessThan(ADMIN_API_PERMISSIONS.indexOf(catchAll!));
  });
});

describe('canAccessAdminPath con /admin/negocio', () => {
  it('cualquier rol admin (viewer en adelante) puede entrar a /admin/negocio', () => {
    expect(canAccessAdminPath('/admin/negocio', 'viewer')).toBe(true);
    expect(canAccessAdminPath('/admin/negocio', 'assistant')).toBe(true);
    expect(canAccessAdminPath('/admin/negocio', 'owner')).toBe(true);
  });

  it('el prefijo /admin/negocio está antes que el catch-all /admin, con el mismo rol mínimo', () => {
    const negocio = ADMIN_PATH_PERMISSIONS.find((p) => p.prefix === '/admin/negocio');
    const catchAll = ADMIN_PATH_PERMISSIONS.find((p) => p.prefix === '/admin');
    const indiceNegocio = ADMIN_PATH_PERMISSIONS.indexOf(negocio!);
    const indiceCatchAll = ADMIN_PATH_PERMISSIONS.indexOf(catchAll!);

    expect(negocio?.minRole).toBe('viewer');
    expect(indiceNegocio).toBeLessThan(indiceCatchAll);
  });
});
