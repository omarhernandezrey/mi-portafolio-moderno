/**
 * @jest-environment jsdom
 */

/**
 * T-29: la tabla de Comunidad exige 720px de ancho mínimo — a 375px solo se
 * podía leer con scroll horizontal de página. Ahora hay una variante de
 * tarjetas para pantallas angostas, con los mismos datos y acciones.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        range: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown[]; error: null; count: number }) => void) =>
          resolve({
            data: [
              {
                id: 'post-1',
                author_role: 'owner',
                author_name: 'Omar',
                lang: 'es',
                category: 'Avances',
                title: 'Nuevo release',
                body: 'Descripción del post',
                status: 'published',
                pinned: false,
                likes_count: 3,
                comments_count: 1,
                created_at: '2026-11-17T00:00:00Z',
              },
            ],
            error: null,
            count: 1,
          }),
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

import AdminFeedPage from '@/app/admin/(dashboard)/feed/page';

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminFeedPage — variante móvil de la tabla (T-29)', () => {
  it('muestra la publicación como tarjeta, fuera de la tabla con min-w-[720px]', async () => {
    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    const { container } = render(<ToastProvider>{jsx}</ToastProvider>);

    // La tarjeta móvil está fuera del contenedor con `lg:hidden`...
    const mobil = container.querySelector('.lg\\:hidden');
    expect(mobil).not.toBeNull();
    expect(mobil?.textContent).toContain('Nuevo release');

    // ...y la tabla real (720px mínimo) queda en su propio contenedor `lg:block`.
    const tabla = screen.getByRole('table');
    expect(tabla.className).toContain('min-w-[720px]');
    expect(tabla.closest('.lg\\:block')).not.toBeNull();
  });
});
