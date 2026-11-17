/**
 * @jest-environment jsdom
 */

/**
 * Página de Educación (T-11, copia el patrón de `admin-proyectos-page.test.tsx`
 * y `admin-skills-page.test.tsx`): tres pestañas (Categorías, Cursos,
 * Insignias), cada una con su propio CRUD + reorden + publicar/despublicar.
 * Lo específico de este módulo que se prueba aparte:
 * - el diálogo de borrar categoría dice cuántos cursos arrastra (cascade);
 * - el subir/bajar de un curso solo compara contra los de su misma
 *   categoría, no contra la lista completa.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';
import AdminEducacionPage from '@/app/admin/(dashboard)/educacion/page';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

const CAT_SENA = { id: 'cat-sena', slug: 'sena', name: { es: 'SENA' }, position: 0, is_published: true };
const CAT_PLATZI = { id: 'cat-platzi', slug: 'platzi', name: { es: 'Platzi' }, position: 1, is_published: true };

function curso(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'curso-1',
    category_id: CAT_SENA.id,
    slug: 'curso-1',
    title: { es: 'Desarrollo Web' },
    institution: null,
    duration: null,
    description: null,
    logo: null,
    certificate_url: null,
    is_new: false,
    position: 0,
    is_published: true,
    ...overrides,
  };
}

function insignia(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'badge-1',
    slug: 'credly-x',
    title: { es: 'Badge X' },
    institution: null,
    summary: null,
    logo: null,
    certificate_url: null,
    is_new: false,
    position: 0,
    is_published: true,
    ...overrides,
  };
}

/** Las tres cargas en paralelo del `cargar()` de la página, en el orden que las pide. */
function mockCargaInicial(categorias: unknown[] = [], cursos: unknown[] = [], insignias: unknown[] = []) {
  mockAdminFetch
    .mockResolvedValueOnce(categorias)
    .mockResolvedValueOnce(cursos)
    .mockResolvedValueOnce(insignias);
}

function renderPagina() {
  return render(
    <ToastProvider>
      <AdminEducacionPage />
    </ToastProvider>,
  );
}

function tabla() {
  return within(screen.getByRole('table'));
}

function irATab(nombre: string) {
  fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${nombre}`) }));
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('carga inicial', () => {
  it('carga las tres listas en paralelo y muestra la pestaña de categorías primero', async () => {
    mockCargaInicial([CAT_SENA], [curso()], [insignia()]);
    renderPagina();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('SENA')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/education-categories');
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/education-items');
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/badges');
  });

  it('un fallo de red muestra un estado de error con reintentar', async () => {
    mockAdminFetch.mockRejectedValueOnce(new Error('Error 500'));
    renderPagina();
    expect(await screen.findByText('No se pudo cargar la educación')).toBeInTheDocument();

    mockCargaInicial([CAT_SENA]);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('categorías — crear, editar, publicar, reordenar, borrar', () => {
  it('crea una categoría', async () => {
    mockCargaInicial([], [], []);
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(3));

    fireEvent.click(screen.getByRole('button', { name: 'Nueva categoría' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nueva categoría' });
    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'sena' } });
    fireEvent.change(within(dialogo).getByLabelText('Nombre (es)', { exact: false }), { target: { value: 'SENA' } });

    mockAdminFetch.mockResolvedValueOnce(CAT_SENA);
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('SENA')).toBeInTheDocument();
  });

  it('publicar/despublicar revierte si falla', async () => {
    mockCargaInicial([CAT_SENA], [], []);
    renderPagina();
    await screen.findByRole('table');

    const interruptor = tabla().getByRole('switch', { name: 'Publicar SENA' });
    expect(interruptor).toHaveAttribute('aria-checked', 'true');

    mockAdminFetch.mockRejectedValueOnce(new Error('falló'));
    fireEvent.click(interruptor);
    expect(interruptor).toHaveAttribute('aria-checked', 'false');
    await waitFor(() => expect(interruptor).toHaveAttribute('aria-checked', 'true'));
  });

  it('reordenar sube la segunda categoría a primera', async () => {
    mockCargaInicial([CAT_SENA, CAT_PLATZI], [], []);
    renderPagina();
    await screen.findByRole('table');

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(tabla().getByRole('button', { name: 'Subir Platzi' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/education-categories/reorder',
        expect.objectContaining({ body: JSON.stringify({ ids: [CAT_PLATZI.id, CAT_SENA.id] }) }),
      ),
    );
  });

  it('el diálogo de borrar dice cuántos cursos arrastra la categoría', async () => {
    mockCargaInicial([CAT_SENA], [curso({ id: 'c1' }), curso({ id: 'c2' })], []);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar SENA' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar categoría' });
    expect(within(confirmacion).getByText(/2 cursos/)).toBeInTheDocument();
  });

  it('confirmar el borrado manda el DELETE y quita también sus cursos de la lista de Cursos', async () => {
    mockCargaInicial([CAT_SENA], [curso({ id: 'c1' })], []);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar SENA' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar categoría' });
    mockAdminFetch.mockResolvedValueOnce({ success: true, itemsEliminados: 1 });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/education-categories/cat-sena', expect.objectContaining({ method: 'DELETE' })),
    );
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Editar SENA' })).not.toBeInTheDocument());

    irATab('Cursos');
    expect(screen.queryByText('Desarrollo Web')).not.toBeInTheDocument();
  });
});

describe('cursos — crear, editar, reordenar solo dentro de su categoría', () => {
  it('el botón «Nuevo curso» está deshabilitado sin categorías', async () => {
    mockCargaInicial([], [], []);
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(3));
    irATab('Cursos');
    expect(screen.getByRole('button', { name: 'Nuevo curso' })).toBeDisabled();
  });

  it('crea un curso eligiendo la categoría', async () => {
    mockCargaInicial([CAT_SENA], [], []);
    renderPagina();
    await screen.findByRole('table');
    irATab('Cursos');

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo curso' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo curso' });
    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'curso-1' } });
    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Desarrollo Web' } });

    mockAdminFetch.mockResolvedValueOnce(curso());
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('Desarrollo Web')).toBeInTheDocument();
  });

  it('subir/bajar compara solo contra cursos de la misma categoría', async () => {
    mockCargaInicial(
      [CAT_SENA, CAT_PLATZI],
      [
        curso({ id: 'c-sena', category_id: CAT_SENA.id, slug: 'curso-sena', title: { es: 'Curso SENA' }, position: 0 }),
        curso({ id: 'c-platzi', category_id: CAT_PLATZI.id, slug: 'curso-platzi', title: { es: 'Curso Platzi' }, position: 0 }),
      ],
      [],
    );
    renderPagina();
    await screen.findByRole('table');
    irATab('Cursos');

    // Es el único curso de su categoría: subir y bajar están deshabilitados,
    // aunque exista otro curso con la misma `position` en otra categoría.
    const filaCursoSena = tabla().getByRole('button', { name: 'Subir Curso SENA' });
    expect(filaCursoSena).toBeDisabled();
    expect(tabla().getByRole('button', { name: 'Bajar Curso SENA' })).toBeDisabled();
  });

  it('borrar un curso manda el DELETE y quita la fila', async () => {
    mockCargaInicial([CAT_SENA], [curso()], []);
    renderPagina();
    await screen.findByRole('table');
    irATab('Cursos');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar Desarrollo Web' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar curso' });
    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/education-items/curso-1', expect.objectContaining({ method: 'DELETE' })),
    );
  });
});

describe('insignias — crear, publicar, reordenar, borrar', () => {
  it('crea una insignia', async () => {
    mockCargaInicial([], [], []);
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(3));
    irATab('Insignias');

    fireEvent.click(screen.getByRole('button', { name: 'Nueva insignia' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nueva insignia' });
    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'credly-x' } });
    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Badge X' } });

    mockAdminFetch.mockResolvedValueOnce(insignia());
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(tabla().getByText('Badge X')).toBeInTheDocument();
  });

  it('cancelar un borrado no manda ningún DELETE', async () => {
    mockCargaInicial([], [], [insignia()]);
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(3));
    irATab('Insignias');
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar Badge X' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar insignia' });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tabla().getByText('Badge X')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledTimes(3);
  });
});
