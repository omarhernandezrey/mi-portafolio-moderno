/**
 * @jest-environment jsdom
 */

/**
 * T-30: `useReorderableResource` es la única fuente del cuarteto
 * crear/publicar/reordenar/borrar optimista que antes vivía copiado
 * carácter a carácter 3 veces en `contenido/page.tsx` y 3 veces más en
 * `educacion/page.tsx` (~350 líneas). Se prueba aislado de cualquier
 * página concreta.
 */
import { act, renderHook } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import { useReorderableResource } from '@/hooks/useReorderableResource';

interface Item {
  id: string;
  name: string;
  is_published: boolean;
}

function labels() {
  return {
    created: 'Creado.',
    updated: 'Actualizado.',
    deleted: 'Eliminado.',
    toggleError: 'Error al publicar.',
    reorderError: 'Error al reordenar.',
    deleteError: 'Error al eliminar.',
  };
}

function montar(initial: Item[]) {
  const showToast = jest.fn();
  let items = initial;
  const setItems = jest.fn((updater: Item[] | ((prev: Item[]) => Item[])) => {
    items = typeof updater === 'function' ? (updater as (prev: Item[]) => Item[])(items) : updater;
  });

  const resultado = renderHook(
    (props: { items: Item[] }) =>
      useReorderableResource<Item>({
        items: props.items,
        setItems,
        endpoint: '/api/admin/portfolio/cosas',
        showToast,
        labels: labels(),
      }),
    { initialProps: { items: initial } },
  );

  return { resultado, showToast, setItems, getItems: () => items };
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('useReorderableResource (T-30)', () => {
  it('crear: POST al endpoint, añade el resultado y avisa con el label de "created"', async () => {
    const creado = { id: 'x', name: 'Nuevo', is_published: false };
    mockAdminFetch.mockResolvedValueOnce(creado);
    const { resultado, showToast, setItems } = montar([]);

    await act(async () => {
      await resultado.result.current.crear({ name: 'Nuevo' });
    });

    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/cosas', {
      method: 'POST',
      body: JSON.stringify({ name: 'Nuevo' }),
    });
    expect(showToast).toHaveBeenCalledWith('Creado.', 'success');
    expect(setItems).toHaveBeenCalled();
  });

  it('togglePublicado: si el PATCH falla, revierte is_published y avisa el error', async () => {
    const item = { id: 'a', name: 'A', is_published: false };
    mockAdminFetch.mockRejectedValueOnce(new Error('caído'));
    const { resultado, showToast, getItems } = montar([item]);

    await act(async () => {
      await resultado.result.current.togglePublicado(item);
    });

    expect(getItems()[0].is_published).toBe(false); // revertido
    expect(showToast).toHaveBeenCalledWith('caído', 'error');
    expect(resultado.result.current.ocupados.has('a')).toBe(false); // liberado en el finally
  });

  it('mover "arriba" en el primer elemento no hace nada (sin PATCH)', async () => {
    const a = { id: 'a', name: 'A', is_published: true };
    const b = { id: 'b', name: 'B', is_published: true };
    const { resultado } = montar([a, b]);

    await act(async () => {
      await resultado.result.current.mover(a, 'arriba');
    });

    expect(mockAdminFetch).not.toHaveBeenCalled();
  });

  it('mover: si el reorder falla, revierte el array completo', async () => {
    const a = { id: 'a', name: 'A', is_published: true };
    const b = { id: 'b', name: 'B', is_published: true };
    mockAdminFetch.mockRejectedValueOnce(new Error('caído'));
    const { resultado, setItems, showToast } = montar([a, b]);

    await act(async () => {
      await resultado.result.current.mover(b, 'arriba');
    });

    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/cosas/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ['b', 'a'] }),
    });
    // Última llamada a setItems revierte al array original [a, b].
    const ultimaLlamada = setItems.mock.calls[setItems.mock.calls.length - 1][0];
    expect(ultimaLlamada).toEqual([a, b]);
    expect(showToast).toHaveBeenCalledWith('caído', 'error');
  });

  it('eliminar: DELETE al endpoint, quita el ítem y llama a onDone', async () => {
    const a = { id: 'a', name: 'A', is_published: true };
    mockAdminFetch.mockResolvedValueOnce(undefined);
    const { resultado, showToast } = montar([a]);
    const onDone = jest.fn();

    await act(async () => {
      await resultado.result.current.eliminar('a', onDone);
    });

    expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/portfolio/cosas/a', { method: 'DELETE' });
    expect(showToast).toHaveBeenCalledWith('Eliminado.', 'success');
    expect(onDone).toHaveBeenCalled();
  });

  it('eliminar: si falla, no llama a onDone y avisa el error', async () => {
    mockAdminFetch.mockRejectedValueOnce(new Error('no se pudo'));
    const { resultado, showToast } = montar([{ id: 'a', name: 'A', is_published: true }]);
    const onDone = jest.fn();

    await act(async () => {
      await resultado.result.current.eliminar('a', onDone);
    });

    expect(onDone).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('no se pudo', 'error');
  });
});
