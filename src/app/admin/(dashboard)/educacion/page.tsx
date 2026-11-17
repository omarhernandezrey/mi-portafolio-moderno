'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Award, FolderPlus, GraduationCap, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog, Tabs, TabPanel } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { EducationCategoryFormDialog, type CategoryFormValues } from '@/components/admin/portfolio/EducationCategoryFormDialog';
import { EducationItemFormDialog, type ItemFormValues } from '@/components/admin/portfolio/EducationItemFormDialog';
import { BadgeFormDialog, type BadgeFormValues } from '@/components/admin/portfolio/BadgeFormDialog';

interface CategoryRow {
  id: string;
  slug: string;
  name: { es?: string; en?: string };
  position: number;
  is_published: boolean;
}

interface ItemRow {
  id: string;
  category_id: string;
  slug: string;
  title: { es?: string; en?: string };
  institution: { es?: string; en?: string } | null;
  duration: { es?: string; en?: string } | null;
  description: { es?: string; en?: string } | null;
  logo: string | null;
  certificate_url: string | null;
  is_new: boolean;
  position: number;
  is_published: boolean;
}

interface BadgeRow {
  id: string;
  slug: string;
  title: { es?: string; en?: string };
  institution: { es?: string; en?: string } | null;
  summary: { es?: string; en?: string } | null;
  logo: string | null;
  certificate_url: string | null;
  is_new: boolean;
  position: number;
  is_published: boolean;
}

export default function AdminEducacionPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'categorias' | 'cursos' | 'insignias'>('categorias');

  const [categorias, setCategorias] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  const [dialogCategoria, setDialogCategoria] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<CategoryRow | null>(null);
  const [borrandoCategoria, setBorrandoCategoria] = useState<CategoryRow | null>(null);

  const [dialogItem, setDialogItem] = useState(false);
  const [editandoItem, setEditandoItem] = useState<ItemRow | null>(null);
  const [borrandoItem, setBorrandoItem] = useState<ItemRow | null>(null);

  const [dialogBadge, setDialogBadge] = useState(false);
  const [editandoBadge, setEditandoBadge] = useState<BadgeRow | null>(null);
  const [borrandoBadge, setBorrandoBadge] = useState<BadgeRow | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErrorCarga('');
    try {
      const [cats, its, bds] = await Promise.all([
        adminFetch<CategoryRow[]>('/api/admin/portfolio/education-categories'),
        adminFetch<ItemRow[]>('/api/admin/portfolio/education-items'),
        adminFetch<BadgeRow[]>('/api/admin/portfolio/badges'),
      ]);
      setCategorias(Array.isArray(cats) ? cats : []);
      setItems(Array.isArray(its) ? its : []);
      setBadges(Array.isArray(bds) ? bds : []);
    } catch (err) {
      setErrorCarga(err instanceof Error ? err.message : 'No se pudo cargar la educación.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function marcarOcupado(id: string, ocupado: boolean) {
    setOcupados((prev) => {
      const next = new Set(prev);
      if (ocupado) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const categoriasOrdenadas = useMemo(() => [...categorias].sort((a, b) => a.position - b.position), [categorias]);
  const categoriaPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);
  const itemsOrdenados = useMemo(
    () =>
      categoriasOrdenadas.flatMap((cat) =>
        items.filter((i) => i.category_id === cat.id).sort((a, b) => a.position - b.position),
      ),
    [categoriasOrdenadas, items],
  );

  // ── Categorías ───────────────────────────────────────────────────────────

  async function handleSubmitCategoria(values: CategoryFormValues) {
    if (editandoCategoria) {
      const r = await adminFetch<CategoryRow>(`/api/admin/portfolio/education-categories/${editandoCategoria.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setCategorias((prev) => prev.map((c) => (c.id === r.id ? { ...c, ...r } : c)));
      showToast('Categoría actualizada.', 'success');
    } else {
      const r = await adminFetch<CategoryRow>('/api/admin/portfolio/education-categories', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setCategorias((prev) => [...prev, r]);
      showToast('Categoría creada.', 'success');
    }
    setDialogCategoria(false);
    setEditandoCategoria(null);
  }

  async function handleTogglePublicadoCategoria(categoria: CategoryRow) {
    const anterior = categoria.is_published;
    marcarOcupado(categoria.id, true);
    setCategorias((prev) => prev.map((c) => (c.id === categoria.id ? { ...c, is_published: !anterior } : c)));
    try {
      await adminFetch(`/api/admin/portfolio/education-categories/${categoria.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !anterior }),
      });
    } catch (err) {
      setCategorias((prev) => prev.map((c) => (c.id === categoria.id ? { ...c, is_published: anterior } : c)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(categoria.id, false);
    }
  }

  async function handleMoverCategoria(categoria: CategoryRow, direccion: 'arriba' | 'abajo') {
    const idx = categoriasOrdenadas.findIndex((c) => c.id === categoria.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= categoriasOrdenadas.length) return;

    const anterior = categorias;
    const nuevo = [...categoriasOrdenadas];
    [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
    setCategorias(nuevo);
    marcarOcupado(categoria.id, true);

    try {
      await adminFetch('/api/admin/portfolio/education-categories/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevo.map((c) => c.id) }),
      });
    } catch (err) {
      setCategorias(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(categoria.id, false);
    }
  }

  async function handleConfirmarBorradoCategoria() {
    if (!borrandoCategoria) return;
    const id = borrandoCategoria.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/education-categories/${id}`, { method: 'DELETE' });
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.category_id !== id));
      showToast('Categoría eliminada.', 'success');
      setBorrandoCategoria(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Cursos (ítems de educación) ──────────────────────────────────────────

  async function handleSubmitItem(values: ItemFormValues) {
    if (editandoItem) {
      const r = await adminFetch<ItemRow>(`/api/admin/portfolio/education-items/${editandoItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setItems((prev) => prev.map((i) => (i.id === r.id ? { ...i, ...r } : i)));
      showToast('Curso actualizado.', 'success');
    } else {
      const r = await adminFetch<ItemRow>('/api/admin/portfolio/education-items', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setItems((prev) => [...prev, r]);
      showToast('Curso creado.', 'success');
    }
    setDialogItem(false);
    setEditandoItem(null);
  }

  async function handleTogglePublicadoItem(item: ItemRow) {
    const anterior = item.is_published;
    marcarOcupado(item.id, true);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_published: !anterior } : i)));
    try {
      await adminFetch(`/api/admin/portfolio/education-items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !anterior }),
      });
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_published: anterior } : i)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(item.id, false);
    }
  }

  /** `position` es por categoría: el subir/bajar opera solo dentro de la categoría del ítem. */
  async function handleMoverItem(item: ItemRow, direccion: 'arriba' | 'abajo') {
    const delaCategoria = items.filter((i) => i.category_id === item.category_id).sort((a, b) => a.position - b.position);
    const idx = delaCategoria.findIndex((i) => i.id === item.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= delaCategoria.length) return;

    const anterior = items;
    const nuevaSubcategoria = [...delaCategoria];
    [nuevaSubcategoria[idx], nuevaSubcategoria[destino]] = [nuevaSubcategoria[destino], nuevaSubcategoria[idx]];
    const idsNuevoOrden = new Map(nuevaSubcategoria.map((i, pos) => [i.id, pos]));
    setItems((prev) => prev.map((i) => (idsNuevoOrden.has(i.id) ? { ...i, position: idsNuevoOrden.get(i.id)! } : i)));
    marcarOcupado(item.id, true);

    try {
      await adminFetch('/api/admin/portfolio/education-items/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevaSubcategoria.map((i) => i.id) }),
      });
    } catch (err) {
      setItems(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(item.id, false);
    }
  }

  async function handleConfirmarBorradoItem() {
    if (!borrandoItem) return;
    const id = borrandoItem.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/education-items/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Curso eliminado.', 'success');
      setBorrandoItem(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Insignias ────────────────────────────────────────────────────────────

  async function handleSubmitBadge(values: BadgeFormValues) {
    if (editandoBadge) {
      const r = await adminFetch<BadgeRow>(`/api/admin/portfolio/badges/${editandoBadge.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setBadges((prev) => prev.map((b) => (b.id === r.id ? { ...b, ...r } : b)));
      showToast('Insignia actualizada.', 'success');
    } else {
      const r = await adminFetch<BadgeRow>('/api/admin/portfolio/badges', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setBadges((prev) => [...prev, r]);
      showToast('Insignia creada.', 'success');
    }
    setDialogBadge(false);
    setEditandoBadge(null);
  }

  async function handleTogglePublicadoBadge(badge: BadgeRow) {
    const anterior = badge.is_published;
    marcarOcupado(badge.id, true);
    setBadges((prev) => prev.map((b) => (b.id === badge.id ? { ...b, is_published: !anterior } : b)));
    try {
      await adminFetch(`/api/admin/portfolio/badges/${badge.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !anterior }),
      });
    } catch (err) {
      setBadges((prev) => prev.map((b) => (b.id === badge.id ? { ...b, is_published: anterior } : b)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(badge.id, false);
    }
  }

  async function handleMoverBadge(badge: BadgeRow, direccion: 'arriba' | 'abajo') {
    const ordenadas = [...badges].sort((a, b) => a.position - b.position);
    const idx = ordenadas.findIndex((b) => b.id === badge.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= ordenadas.length) return;

    const anterior = badges;
    const nuevo = [...ordenadas];
    [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
    setBadges(nuevo);
    marcarOcupado(badge.id, true);

    try {
      await adminFetch('/api/admin/portfolio/badges/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevo.map((b) => b.id) }),
      });
    } catch (err) {
      setBadges(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(badge.id, false);
    }
  }

  async function handleConfirmarBorradoBadge() {
    if (!borrandoBadge) return;
    const id = borrandoBadge.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/badges/${id}`, { method: 'DELETE' });
      setBadges((prev) => prev.filter((b) => b.id !== id));
      showToast('Insignia eliminada.', 'success');
      setBorrandoBadge(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Columnas ─────────────────────────────────────────────────────────────

  const columnasCategorias: Column<CategoryRow>[] = [
    { id: 'nombre', header: 'Categoría', mobile: 'primary', cell: (c) => c.name.es || c.slug },
    { id: 'cursos', header: 'Cursos', mobile: 'meta', cell: (c) => `${items.filter((i) => i.category_id === c.id).length} cursos` },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (c) => (
        <Switch checked={c.is_published} onChange={() => handleTogglePublicadoCategoria(c)} label={`Publicar ${c.name.es || c.slug}`} hideLabel disabled={ocupados.has(c.id)} />
      ),
    },
  ];

  const columnasItems: Column<ItemRow>[] = [
    { id: 'titulo', header: 'Curso', mobile: 'primary', cell: (i) => i.title.es || i.slug },
    { id: 'categoria', header: 'Categoría', mobile: 'meta', cell: (i) => categoriaPorId.get(i.category_id)?.name.es || '—' },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (i) => (
        <Switch checked={i.is_published} onChange={() => handleTogglePublicadoItem(i)} label={`Publicar ${i.title.es || i.slug}`} hideLabel disabled={ocupados.has(i.id)} />
      ),
    },
  ];

  const columnasBadges: Column<BadgeRow>[] = [
    { id: 'titulo', header: 'Insignia', mobile: 'primary', cell: (b) => b.title.es || b.slug },
    { id: 'institucion', header: 'Institución', mobile: 'meta', cell: (b) => b.institution?.es || '—' },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (b) => (
        <Switch checked={b.is_published} onChange={() => handleTogglePublicadoBadge(b)} label={`Publicar ${b.title.es || b.slug}`} hideLabel disabled={ocupados.has(b.id)} />
      ),
    },
  ];

  const botonSubirBajarEditarEliminar = (
    deshabilitarArriba: boolean,
    deshabilitarAbajo: boolean,
    ocupado: boolean,
    etiqueta: string,
    onArriba: () => void,
    onAbajo: () => void,
    onEditar: () => void,
    onEliminar: () => void,
  ) => (
    <>
      <button type="button" onClick={onArriba} disabled={deshabilitarArriba || ocupado} aria-label={`Subir ${etiqueta}`} className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40">
        <ArrowUp size={15} />
      </button>
      <button type="button" onClick={onAbajo} disabled={deshabilitarAbajo || ocupado} aria-label={`Bajar ${etiqueta}`} className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40">
        <ArrowDown size={15} />
      </button>
      <button type="button" onClick={onEditar} aria-label={`Editar ${etiqueta}`} className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink">
        <Pencil size={15} />
      </button>
      <button type="button" onClick={onEliminar} aria-label={`Eliminar ${etiqueta}`} className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-danger/20 bg-admin-danger/10 text-admin-danger transition-colors hover:bg-admin-danger/15">
        <Trash2 size={15} />
      </button>
    </>
  );

  const cursosDeLaCategoriaABorrar = borrandoCategoria ? items.filter((i) => i.category_id === borrandoCategoria.id).length : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Educación"
        description="Categorías de formación, cursos e insignias destacadas del sitio."
      />

      {errorCarga && !loading ? (
        <EmptyState
          icon={<RefreshCw size={22} />}
          title="No se pudo cargar la educación"
          description={errorCarga}
          action={
            <AdminButton size="sm" icon={<RefreshCw size={14} />} onClick={cargar}>
              Reintentar
            </AdminButton>
          }
        />
      ) : (
        <>
          <Tabs
            items={[
              { id: 'categorias', label: 'Categorías', count: categorias.length },
              { id: 'cursos', label: 'Cursos', count: items.length },
              { id: 'insignias', label: 'Insignias', count: badges.length },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as typeof tab)}
            ariaLabel="Qué contenido de educación gestionar"
          />

          <TabPanel tabId="categorias" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton
                variant="primary"
                icon={<FolderPlus size={16} />}
                onClick={() => {
                  setEditandoCategoria(null);
                  setDialogCategoria(true);
                }}
              >
                Nueva categoría
              </AdminButton>
            </div>
            <DataTable
              columns={columnasCategorias}
              rows={categoriasOrdenadas}
              rowKey={(c) => c.id}
              caption="Categorías de educación"
              loading={loading}
              empty={<EmptyState icon={<GraduationCap size={22} />} title="Sin categorías todavía" description="Crea una categoría antes de añadir cursos." />}
              actions={(c) => {
                const idx = categoriasOrdenadas.findIndex((item) => item.id === c.id);
                return botonSubirBajarEditarEliminar(
                  idx <= 0,
                  idx >= categoriasOrdenadas.length - 1,
                  ocupados.has(c.id),
                  c.name.es || c.slug,
                  () => handleMoverCategoria(c, 'arriba'),
                  () => handleMoverCategoria(c, 'abajo'),
                  () => {
                    setEditandoCategoria(c);
                    setDialogCategoria(true);
                  },
                  () => setBorrandoCategoria(c),
                );
              }}
            />
          </TabPanel>

          <TabPanel tabId="cursos" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton
                variant="primary"
                icon={<Plus size={16} />}
                disabled={categorias.length === 0}
                title={categorias.length === 0 ? 'Crea primero una categoría' : undefined}
                onClick={() => {
                  setEditandoItem(null);
                  setDialogItem(true);
                }}
              >
                Nuevo curso
              </AdminButton>
            </div>
            <DataTable
              columns={columnasItems}
              rows={itemsOrdenados}
              rowKey={(i) => i.id}
              caption="Cursos de educación"
              loading={loading}
              empty={<EmptyState icon={<GraduationCap size={22} />} title="Sin cursos todavía" description="Los cursos que crees aquí alimentan la sección de educación del sitio." />}
              actions={(i) => {
                const delaCategoria = items.filter((item) => item.category_id === i.category_id).sort((a, b) => a.position - b.position);
                const idx = delaCategoria.findIndex((item) => item.id === i.id);
                return botonSubirBajarEditarEliminar(
                  idx <= 0,
                  idx >= delaCategoria.length - 1,
                  ocupados.has(i.id),
                  i.title.es || i.slug,
                  () => handleMoverItem(i, 'arriba'),
                  () => handleMoverItem(i, 'abajo'),
                  () => {
                    setEditandoItem(i);
                    setDialogItem(true);
                  },
                  () => setBorrandoItem(i),
                );
              }}
            />
          </TabPanel>

          <TabPanel tabId="insignias" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton
                variant="primary"
                icon={<Award size={16} />}
                onClick={() => {
                  setEditandoBadge(null);
                  setDialogBadge(true);
                }}
              >
                Nueva insignia
              </AdminButton>
            </div>
            <DataTable
              columns={columnasBadges}
              rows={[...badges].sort((a, b) => a.position - b.position)}
              rowKey={(b) => b.id}
              caption="Insignias destacadas"
              loading={loading}
              empty={<EmptyState icon={<Award size={22} />} title="Sin insignias todavía" description="Las insignias que crees aquí alimentan el carrusel de cursos destacados." />}
              actions={(b) => {
                const ordenadas = [...badges].sort((a, c) => a.position - c.position);
                const idx = ordenadas.findIndex((item) => item.id === b.id);
                return botonSubirBajarEditarEliminar(
                  idx <= 0,
                  idx >= ordenadas.length - 1,
                  ocupados.has(b.id),
                  b.title.es || b.slug,
                  () => handleMoverBadge(b, 'arriba'),
                  () => handleMoverBadge(b, 'abajo'),
                  () => {
                    setEditandoBadge(b);
                    setDialogBadge(true);
                  },
                  () => setBorrandoBadge(b),
                );
              }}
            />
          </TabPanel>
        </>
      )}

      <EducationCategoryFormDialog
        open={dialogCategoria}
        onClose={() => {
          setDialogCategoria(false);
          setEditandoCategoria(null);
        }}
        onSubmit={handleSubmitCategoria}
        initial={editandoCategoria}
      />

      <EducationItemFormDialog
        open={dialogItem}
        onClose={() => {
          setDialogItem(false);
          setEditandoItem(null);
        }}
        onSubmit={handleSubmitItem}
        initial={editandoItem}
        categorias={categoriasOrdenadas.map((c) => ({ id: c.id, label: c.name.es || c.slug }))}
      />

      <BadgeFormDialog
        open={dialogBadge}
        onClose={() => {
          setDialogBadge(false);
          setEditandoBadge(null);
        }}
        onSubmit={handleSubmitBadge}
        initial={editandoBadge}
      />

      <ConfirmDialog
        open={Boolean(borrandoCategoria)}
        onClose={() => setBorrandoCategoria(null)}
        onConfirm={handleConfirmarBorradoCategoria}
        title="Eliminar categoría"
        description={
          cursosDeLaCategoriaABorrar > 0
            ? `«${borrandoCategoria?.name.es || borrandoCategoria?.slug}» y sus ${cursosDeLaCategoriaABorrar} curso${cursosDeLaCategoriaABorrar === 1 ? '' : 's'} se eliminarán. Esta acción no se puede deshacer.`
            : `«${borrandoCategoria?.name.es || borrandoCategoria?.slug}» se eliminará. Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoCategoria ? ocupados.has(borrandoCategoria.id) : false}
      />

      <ConfirmDialog
        open={Boolean(borrandoItem)}
        onClose={() => setBorrandoItem(null)}
        onConfirm={handleConfirmarBorradoItem}
        title="Eliminar curso"
        description={`«${borrandoItem?.title.es || borrandoItem?.slug}» desaparecerá de la sección de educación del sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoItem ? ocupados.has(borrandoItem.id) : false}
      />

      <ConfirmDialog
        open={Boolean(borrandoBadge)}
        onClose={() => setBorrandoBadge(null)}
        onConfirm={handleConfirmarBorradoBadge}
        title="Eliminar insignia"
        description={`«${borrandoBadge?.title.es || borrandoBadge?.slug}» desaparecerá del carrusel de cursos destacados. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoBadge ? ocupados.has(borrandoBadge.id) : false}
      />
    </div>
  );
}
