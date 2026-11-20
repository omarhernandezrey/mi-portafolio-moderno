/**
 * @jest-environment jsdom
 */

/**
 * Página de Proyectos (T-09, establece el patrón que copian T-10 a T-12):
 * crear, editar, publicar/despublicar, reordenar, cancelar un borrado y
 * confirmar un borrado. `adminFetch` se simula; `AdminApiError` es la clase
 * real (el diálogo hace `instanceof` sobre ella para mostrar errores de
 * campo), así que el mock del módulo conserva esa exportación.
 *
 * `DataTable` pinta el mismo dato dos veces (tarjetas de móvil + tabla de
 * escritorio) y jsdom no aplica el CSS que oculta una de las dos según el
 * ancho: las consultas que antes buscaban "el botón Eliminar" a secas
 * encontraban dos. Por eso casi todo aquí se ancla a `within(tabla())`, la
 * única copia que el marcado no duplica.
 *
 * Editar/Eliminar viven detrás de `RowActionsMenu` (menú «⋮», ver
 * src/components/admin/ui/RowActionsMenu.tsx): su panel usa `anchor` de
 * Headless UI (floating-ui) para no quedar recortado por el
 * `overflow-hidden` de las esquinas redondeadas de `DataTable` — y se
 * renderiza en un portal, así que las consultas van por `screen`, no por
 * `within(tabla())`. floating-ui observa el tamaño del disparador con
 * `ResizeObserver` incluso con el menú cerrado; jsdom no lo implementa.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui/Toast';
import AdminProyectosPage from '@/app/admin/(dashboard)/proyectos/page';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  // @ts-expect-error — jsdom no implementa ResizeObserver; floating-ui lo usa.
  global.ResizeObserver = ResizeObserverMock;
});

// `userEvent` y no `fireEvent.click`: el MenuButton de Headless UI abre en
// `pointerdown`, no en `click`, y solo `userEvent` emite la secuencia real.
async function abrirMenuDe(nombre: string) {
  await userEvent.click(tabla().getByRole('button', { name: `Más acciones para ${nombre}` }));
  return within(await screen.findByRole('menu'));
}

function proyecto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'p1',
    slug: 'portafolio',
    title: { es: 'Portafolio' },
    description: { es: 'Mi sitio' },
    technologies: ['React'],
    repository: '',
    demo: '',
    category: null,
    image_url: null,
    demo_embeddable: true,
    demo_checked_at: null,
    position: 0,
    is_published: true,
    ...overrides,
  };
}

function renderPagina() {
  return render(
    <ToastProvider>
      <AdminProyectosPage />
    </ToastProvider>,
  );
}

function tabla() {
  return within(screen.getByRole('table'));
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('carga inicial', () => {
  it('muestra los proyectos devueltos por la API', async () => {
    mockAdminFetch.mockResolvedValueOnce([proyecto()]);
    renderPagina();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('Portafolio')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/projects');
  });

  it('un fallo de red muestra un estado de error distinto del de "sin proyectos", con botón de reintentar', async () => {
    mockAdminFetch.mockRejectedValueOnce(new Error('Error 500'));
    renderPagina();

    expect(await screen.findByText('No se pudieron cargar los proyectos')).toBeInTheDocument();
    expect(screen.queryByText('Sin proyectos todavía')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    mockAdminFetch.mockResolvedValueOnce([proyecto()]);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('No se pudieron cargar los proyectos')).not.toBeInTheDocument();
  });
});

describe('crear proyecto', () => {
  it('abre el diálogo, envía el formulario y añade la fila nueva', async () => {
    mockAdminFetch.mockResolvedValueOnce([]); // carga inicial, sin proyectos
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo proyecto' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuevo proyecto' });

    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'nuevo' } });
    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Nuevo proyecto' } });
    fireEvent.change(within(dialogo).getByLabelText('Descripción (es)', { exact: false }), { target: { value: 'Una descripción' } });

    mockAdminFetch.mockResolvedValueOnce(proyecto({ id: 'p-nuevo', slug: 'nuevo', title: { es: 'Nuevo proyecto' } }));
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/projects',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"slug":"nuevo"'),
        }),
      ),
    );

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('Nuevo proyecto')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('editar proyecto', () => {
  it('precarga los valores del proyecto y envía un PATCH', async () => {
    mockAdminFetch.mockResolvedValueOnce([proyecto()]);
    renderPagina();
    await screen.findByRole('table');

    const menu = await abrirMenuDe('Portafolio');
    fireEvent.click(menu.getByRole('menuitem', { name: 'Editar' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Editar proyecto' });
    expect(within(dialogo).getByLabelText('Título (es)', { exact: false })).toHaveValue('Portafolio');

    fireEvent.change(within(dialogo).getByLabelText('Título (es)', { exact: false }), { target: { value: 'Portafolio v2' } });

    mockAdminFetch.mockResolvedValueOnce(proyecto({ title: { es: 'Portafolio v2' } }));
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/projects/p1',
        expect.objectContaining({ method: 'PATCH' }),
      ),
    );
    await waitFor(() => expect(tabla().getByText('Portafolio v2')).toBeInTheDocument());
  });
});

describe('publicar / despublicar', () => {
  it('cambia el switch, llama al PATCH y revierte si falla', async () => {
    mockAdminFetch.mockResolvedValueOnce([proyecto({ is_published: true })]);
    renderPagina();
    await screen.findByRole('table');

    const interruptor = tabla().getByRole('switch', { name: 'Publicar Portafolio' });
    expect(interruptor).toHaveAttribute('aria-checked', 'true');

    mockAdminFetch.mockRejectedValueOnce(new Error('falló la red'));
    fireEvent.click(interruptor);

    // Optimista: se ve despublicado de inmediato...
    expect(interruptor).toHaveAttribute('aria-checked', 'false');
    // ...y se revierte cuando el PATCH falla.
    await waitFor(() => expect(interruptor).toHaveAttribute('aria-checked', 'true'));
  });
});

describe('reordenar', () => {
  it('subir la segunda fila la pone primera y manda el nuevo orden completo', async () => {
    mockAdminFetch.mockResolvedValueOnce([
      proyecto({ id: 'p1', slug: 'uno', title: { es: 'Uno' }, position: 0 }),
      proyecto({ id: 'p2', slug: 'dos', title: { es: 'Dos' }, position: 1 }),
    ]);
    renderPagina();
    await screen.findByRole('table');

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(tabla().getByRole('button', { name: 'Subir Dos' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/projects/reorder',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ ids: ['p2', 'p1'] }) }),
      ),
    );
  });
});

describe('borrar', () => {
  it('cancelar no manda ningún DELETE y conserva la fila', async () => {
    mockAdminFetch.mockResolvedValueOnce([proyecto()]);
    renderPagina();
    await screen.findByRole('table');

    const menu = await abrirMenuDe('Portafolio');
    fireEvent.click(menu.getByRole('menuitem', { name: 'Eliminar' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar proyecto' });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tabla().getByText('Portafolio')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledTimes(1); // solo la carga inicial
  });

  it('confirmar manda el DELETE y quita la fila', async () => {
    mockAdminFetch.mockResolvedValueOnce([proyecto()]);
    renderPagina();
    await screen.findByRole('table');

    const menu = await abrirMenuDe('Portafolio');
    fireEvent.click(menu.getByRole('menuitem', { name: 'Eliminar' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar proyecto' });

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/projects/p1', expect.objectContaining({ method: 'DELETE' })),
    );
    // "Portafolio" también aparece en el overline "Portafolio" de la
    // cabecera: lo específico del proyecto borrado es el disparador del
    // menú de acciones de su fila.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Más acciones para Portafolio' })).not.toBeInTheDocument(),
    );
  });
});
