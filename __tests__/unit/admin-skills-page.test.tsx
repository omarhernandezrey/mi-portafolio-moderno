/**
 * @jest-environment jsdom
 */

/**
 * Página de Skills (T-10, copia el patrón de `admin-proyectos-page.test.tsx`
 * de T-09): crear, editar, publicar/despublicar, reordenar, cancelar un
 * borrado y confirmar un borrado. Igual que allí, casi todo se ancla a
 * `within(tabla())` porque `DataTable` pinta el mismo dato dos veces
 * (tarjetas de móvil + tabla de escritorio) y jsdom no aplica el CSS que
 * oculta una de las dos según el ancho.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';
import AdminSkillsPage from '@/app/admin/(dashboard)/skills/page';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

function skill(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 's1',
    slug: 'react',
    name: { es: 'React' },
    percentage: 90,
    color_hex: '#61dafb',
    icon: '/images/logos/react.svg',
    description: null,
    category: { es: 'Frontend' },
    position: 0,
    is_published: true,
    ...overrides,
  };
}

function renderPagina() {
  return render(
    <ToastProvider>
      <AdminSkillsPage />
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
  it('muestra las skills devueltas por la API', async () => {
    mockAdminFetch.mockResolvedValueOnce([skill()]);
    renderPagina();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('React')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/skills');
  });

  it('un fallo de red muestra un estado de error con botón de reintentar, distinto de "sin skills"', async () => {
    mockAdminFetch.mockRejectedValueOnce(new Error('Error 500'));
    renderPagina();

    expect(await screen.findByText('No se pudieron cargar las skills')).toBeInTheDocument();
    expect(screen.queryByText('Sin skills todavía')).not.toBeInTheDocument();

    mockAdminFetch.mockResolvedValueOnce([skill()]);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});

describe('crear skill', () => {
  it('abre el diálogo, envía el formulario y añade la fila nueva', async () => {
    mockAdminFetch.mockResolvedValueOnce([]);
    renderPagina();
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Nueva skill' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nueva skill' });

    fireEvent.change(within(dialogo).getByLabelText('Slug', { exact: false }), { target: { value: 'vue' } });
    fireEvent.change(within(dialogo).getByLabelText('Nombre (es)', { exact: false }), { target: { value: 'Vue' } });
    fireEvent.change(within(dialogo).getByLabelText('Nivel', { exact: false }), { target: { value: '80' } });

    mockAdminFetch.mockResolvedValueOnce(skill({ id: 's-vue', slug: 'vue', name: { es: 'Vue' }, percentage: 80 }));
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/skills',
        expect.objectContaining({ method: 'POST', body: expect.stringContaining('"slug":"vue"') }),
      ),
    );

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(tabla().getByText('Vue')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('editar skill', () => {
  it('precarga los valores y envía un PATCH', async () => {
    mockAdminFetch.mockResolvedValueOnce([skill()]);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Editar React' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Editar skill' });
    expect(within(dialogo).getByLabelText('Nombre (es)', { exact: false })).toHaveValue('React');
    expect(within(dialogo).getByLabelText('Nivel', { exact: false })).toHaveValue(90);

    fireEvent.change(within(dialogo).getByLabelText('Nivel', { exact: false }), { target: { value: '95' } });

    mockAdminFetch.mockResolvedValueOnce(skill({ percentage: 95 }));
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/skills/s1', expect.objectContaining({ method: 'PATCH' })),
    );
  });
});

describe('publicar / despublicar', () => {
  it('cambia el switch, llama al PATCH y revierte si falla', async () => {
    mockAdminFetch.mockResolvedValueOnce([skill({ is_published: true })]);
    renderPagina();
    await screen.findByRole('table');

    const interruptor = tabla().getByRole('switch', { name: 'Publicar React' });
    expect(interruptor).toHaveAttribute('aria-checked', 'true');

    mockAdminFetch.mockRejectedValueOnce(new Error('falló la red'));
    fireEvent.click(interruptor);

    expect(interruptor).toHaveAttribute('aria-checked', 'false');
    await waitFor(() => expect(interruptor).toHaveAttribute('aria-checked', 'true'));
  });
});

describe('reordenar', () => {
  it('subir la segunda fila la pone primera y manda el nuevo orden completo', async () => {
    mockAdminFetch.mockResolvedValueOnce([
      skill({ id: 's1', slug: 'react', name: { es: 'React' }, position: 0 }),
      skill({ id: 's2', slug: 'vue', name: { es: 'Vue' }, position: 1 }),
    ]);
    renderPagina();
    await screen.findByRole('table');

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(tabla().getByRole('button', { name: 'Subir Vue' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith(
        '/api/admin/portfolio/skills/reorder',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ ids: ['s2', 's1'] }) }),
      ),
    );
  });
});

describe('borrar', () => {
  it('cancelar no manda ningún DELETE y conserva la fila', async () => {
    mockAdminFetch.mockResolvedValueOnce([skill()]);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar React' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar skill' });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tabla().getByText('React')).toBeInTheDocument();
    expect(mockAdminFetch).toHaveBeenCalledTimes(1);
  });

  it('confirmar manda el DELETE y quita la fila', async () => {
    mockAdminFetch.mockResolvedValueOnce([skill()]);
    renderPagina();
    await screen.findByRole('table');

    fireEvent.click(tabla().getByRole('button', { name: 'Eliminar React' }));
    const confirmacion = await screen.findByRole('dialog', { name: 'Eliminar skill' });

    mockAdminFetch.mockResolvedValueOnce({ success: true });
    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/skills/s1', expect.objectContaining({ method: 'DELETE' })),
    );
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Editar React' })).not.toBeInTheDocument());
  });
});
