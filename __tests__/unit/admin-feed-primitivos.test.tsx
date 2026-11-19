/**
 * @jest-environment jsdom
 */

/**
 * T-30: Comunidad (feed) migra a los primitivos que ignoraba — `Pagination`,
 * `StatusBadge`, `AdminButtonLink` — y gana una variante de tarjetas para
 * no depender de scroll horizontal de página a 375px (su tabla exige
 * 720px de ancho mínimo).
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

describe('AdminFeedPage — primitivos del sistema (T-30)', () => {
  it('el estatus se pinta en español vía StatusBadge, no un badge clonado', async () => {
    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    render(<ToastProvider>{jsx}</ToastProvider>);

    const insignias = screen.getAllByText('Publicado');
    expect(insignias.length).toBeGreaterThan(0); // tarjeta móvil + fila de tabla
  });

  it('«Nueva publicación» y «Ver comentarios» usan AdminButtonLink (mismas clases que el resto del panel)', async () => {
    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    render(<ToastProvider>{jsx}</ToastProvider>);

    const nueva = screen.getByRole('link', { name: /Nueva/ });
    expect(nueva.className).toContain('rounded-xl');
    const comentarios = screen.getByRole('link', { name: 'Ver comentarios' });
    expect(comentarios.className).toContain('rounded-xl');
  });

  it('la tarjeta móvil (lg:hidden) muestra la publicación fuera de la tabla de 720px', async () => {
    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    const { container } = render(<ToastProvider>{jsx}</ToastProvider>);

    const movil = container.querySelector('.lg\\:hidden');
    expect(movil?.textContent).toContain('Nuevo release');

    const tabla = screen.getByRole('table');
    expect(tabla.className).toContain('min-w-[720px]');
    expect(tabla.closest('.lg\\:block')).not.toBeNull();
  });
});
