'use client';

import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { adminFetch } from '@/lib/admin/client-fetch';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ShowToast = (message: string, type?: ToastType, duration?: number) => void;

interface ResourceLabels {
  created: string;
  updated: string;
  deleted: string;
  toggleError: string;
  reorderError: string;
  deleteError: string;
}

interface UseReorderableResourceOptions<T extends { id: string }> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  /** Base REST, p. ej. `/api/admin/portfolio/services` (sin `/reorder` ni `/:id`). */
  endpoint: string;
  showToast: ShowToast;
  labels: ResourceLabels;
}

/**
 * T-30: `contenido/page.tsx` y `educacion/page.tsx` repetían, por cada uno
 * de sus 3 recursos, el mismo cuarteto crear/publicar/reordenar/borrar
 * optimista — ~350 líneas copiadas carácter a carácter entre los dos
 * archivos (solo cambiaba el nombre del recurso). Este hook es la única
 * fuente de esa lógica; cada página solo aporta sus datos y sus textos.
 *
 * El array completo (`items`/`setItems`) sigue viviendo en la página,
 * porque ahí se carga junto con los demás recursos en un solo
 * `Promise.all` — el hook no hace su propio fetch inicial.
 */
export function useReorderableResource<T extends { id: string; is_published?: boolean }>({
  items,
  setItems,
  endpoint,
  showToast,
  labels,
}: UseReorderableResourceOptions<T>) {
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  const marcarOcupado = useCallback((id: string, ocupado: boolean) => {
    setOcupados((prev) => {
      const next = new Set(prev);
      if (ocupado) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const crear = useCallback(
    async <V,>(body: V): Promise<T> => {
      const creado = await adminFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
      setItems((prev) => [...prev, creado]);
      showToast(labels.created, 'success');
      return creado;
    },
    [endpoint, labels.created, setItems, showToast],
  );

  const actualizar = useCallback(
    async <V,>(id: string, body: V): Promise<T> => {
      const actualizado = await adminFetch<T>(`${endpoint}/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setItems((prev) => prev.map((x) => (x.id === actualizado.id ? { ...x, ...actualizado } : x)));
      showToast(labels.updated, 'success');
      return actualizado;
    },
    [endpoint, labels.updated, setItems, showToast],
  );

  const togglePublicado = useCallback(
    async (item: T) => {
      const anterior = Boolean(item.is_published);
      marcarOcupado(item.id, true);
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_published: !anterior } : x)));
      try {
        await adminFetch(`${endpoint}/${item.id}`, { method: 'PATCH', body: JSON.stringify({ is_published: !anterior }) });
      } catch (err) {
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_published: anterior } : x)));
        showToast(err instanceof Error ? err.message : labels.toggleError, 'error');
      } finally {
        marcarOcupado(item.id, false);
      }
    },
    [endpoint, labels.toggleError, marcarOcupado, setItems, showToast],
  );

  const mover = useCallback(
    async (item: T, direccion: 'arriba' | 'abajo') => {
      const idx = items.findIndex((x) => x.id === item.id);
      const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
      if (idx < 0 || destino < 0 || destino >= items.length) return;
      const anterior = items;
      const nuevo = [...items];
      [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
      setItems(nuevo);
      marcarOcupado(item.id, true);
      try {
        await adminFetch(`${endpoint}/reorder`, { method: 'PATCH', body: JSON.stringify({ ids: nuevo.map((x) => x.id) }) });
      } catch (err) {
        setItems(anterior);
        showToast(err instanceof Error ? err.message : labels.reorderError, 'error');
      } finally {
        marcarOcupado(item.id, false);
      }
    },
    [endpoint, items, labels.reorderError, marcarOcupado, setItems, showToast],
  );

  const eliminar = useCallback(
    async (id: string, onDone?: () => void) => {
      marcarOcupado(id, true);
      try {
        await adminFetch(`${endpoint}/${id}`, { method: 'DELETE' });
        setItems((prev) => prev.filter((x) => x.id !== id));
        showToast(labels.deleted, 'success');
        onDone?.();
      } catch (err) {
        showToast(err instanceof Error ? err.message : labels.deleteError, 'error');
      } finally {
        marcarOcupado(id, false);
      }
    },
    [endpoint, labels.deleted, labels.deleteError, marcarOcupado, setItems, showToast],
  );

  return { ocupados, marcarOcupado, crear, actualizar, togglePublicado, mover, eliminar };
}
