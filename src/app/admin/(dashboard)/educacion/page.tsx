'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, FolderPlus, GraduationCap, Plus, RefreshCw } from 'lucide-react';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog, Tabs, TabPanel, PageHeader, EmptyState, RowReorderActions } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { useReorderableResource } from '@/hooks/useReorderableResource';
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

  const categoriasOrdenadas = useMemo(() => [...categorias].sort((a, b) => a.position - b.position), [categorias]);
  const categoriaPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);
  const itemsOrdenados = useMemo(
    () =>
      categoriasOrdenadas.flatMap((cat) =>
        items.filter((i) => i.category_id === cat.id).sort((a, b) => a.position - b.position),
      ),
    [categoriasOrdenadas, items],
  );
  const badgesOrdenados = useMemo(() => [...badges].sort((a, b) => a.position - b.position), [badges]);

  // T-30: el cuarteto crear/publicar/reordenar/borrar optimista vivía
  // copiado carácter a carácter 3 veces aquí y 3 veces más en
  // contenido/page.tsx — ahora una sola fuente en useReorderableResource.

  const categoriasCrud = useReorderableResource<CategoryRow>({
    items: categoriasOrdenadas,
    setItems: setCategorias,
    endpoint: '/api/admin/portfolio/education-categories',
    showToast,
    labels: {
      created: 'Categoría creada.',
      updated: 'Categoría actualizada.',
      deleted: 'Categoría eliminada.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  // Cursos: el reordenado NO usa itemsCrud.mover — `position` es por
  // categoría, así que subir/bajar opera solo dentro de la categoría del
  // ítem (lógica propia de este recurso, no duplicada en ningún otro lado).
  const itemsCrud = useReorderableResource<ItemRow>({
    items: itemsOrdenados,
    setItems,
    endpoint: '/api/admin/portfolio/education-items',
    showToast,
    labels: {
      created: 'Curso creado.',
      updated: 'Curso actualizado.',
      deleted: 'Curso eliminado.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  const badgesCrud = useReorderableResource<BadgeRow>({
    items: badgesOrdenados,
    setItems: setBadges,
    endpoint: '/api/admin/portfolio/badges',
    showToast,
    labels: {
      created: 'Insignia creada.',
      updated: 'Insignia actualizada.',
      deleted: 'Insignia eliminada.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  async function handleSubmitCategoria(values: CategoryFormValues) {
    if (editandoCategoria) await categoriasCrud.actualizar(editandoCategoria.id, values);
    else await categoriasCrud.crear(values);
    setDialogCategoria(false);
    setEditandoCategoria(null);
  }

  async function handleConfirmarBorradoCategoria() {
    if (!borrandoCategoria) return;
    const id = borrandoCategoria.id;
    await categoriasCrud.eliminar(id, () => {
      setItems((prev) => prev.filter((i) => i.category_id !== id));
      setBorrandoCategoria(null);
    });
  }

  async function handleSubmitItem(values: ItemFormValues) {
    if (editandoItem) await itemsCrud.actualizar(editandoItem.id, values);
    else await itemsCrud.crear(values);
    setDialogItem(false);
    setEditandoItem(null);
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
    itemsCrud.marcarOcupado(item.id, true);

    try {
      await adminFetch('/api/admin/portfolio/education-items/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevaSubcategoria.map((i) => i.id) }),
      });
    } catch (err) {
      setItems(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      itemsCrud.marcarOcupado(item.id, false);
    }
  }

  async function handleConfirmarBorradoItem() {
    if (!borrandoItem) return;
    await itemsCrud.eliminar(borrandoItem.id, () => setBorrandoItem(null));
  }

  async function handleSubmitBadge(values: BadgeFormValues) {
    if (editandoBadge) await badgesCrud.actualizar(editandoBadge.id, values);
    else await badgesCrud.crear(values);
    setDialogBadge(false);
    setEditandoBadge(null);
  }

  async function handleConfirmarBorradoBadge() {
    if (!borrandoBadge) return;
    await badgesCrud.eliminar(borrandoBadge.id, () => setBorrandoBadge(null));
  }

  // ── Columnas ─────────────────────────────────────────────────────────────

  const columnasCategorias: Column<CategoryRow>[] = [
    { id: 'nombre', header: 'Categoría', mobile: 'primary', cell: (c) => c.name.es || c.slug },
    { id: 'cursos', header: 'Cursos', mobile: 'meta', cell: (c) => `${items.filter((i) => i.category_id === c.id).length} cursos` },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (c) => (
        <Switch checked={c.is_published} onChange={() => categoriasCrud.togglePublicado(c)} label={`Publicar ${c.name.es || c.slug}`} hideLabel disabled={categoriasCrud.ocupados.has(c.id)} />
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
        <Switch checked={i.is_published} onChange={() => itemsCrud.togglePublicado(i)} label={`Publicar ${i.title.es || i.slug}`} hideLabel disabled={itemsCrud.ocupados.has(i.id)} />
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
        <Switch checked={b.is_published} onChange={() => badgesCrud.togglePublicado(b)} label={`Publicar ${b.title.es || b.slug}`} hideLabel disabled={badgesCrud.ocupados.has(b.id)} />
      ),
    },
  ];

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
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= categoriasOrdenadas.length - 1}
                    busy={categoriasCrud.ocupados.has(c.id)}
                    label={c.name.es || c.slug}
                    onUp={() => categoriasCrud.mover(c, 'arriba')}
                    onDown={() => categoriasCrud.mover(c, 'abajo')}
                    onEdit={() => {
                      setEditandoCategoria(c);
                      setDialogCategoria(true);
                    }}
                    onDelete={() => setBorrandoCategoria(c)}
                  />
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
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= delaCategoria.length - 1}
                    busy={itemsCrud.ocupados.has(i.id)}
                    label={i.title.es || i.slug}
                    onUp={() => handleMoverItem(i, 'arriba')}
                    onDown={() => handleMoverItem(i, 'abajo')}
                    onEdit={() => {
                      setEditandoItem(i);
                      setDialogItem(true);
                    }}
                    onDelete={() => setBorrandoItem(i)}
                  />
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
              rows={badgesOrdenados}
              rowKey={(b) => b.id}
              caption="Insignias destacadas"
              loading={loading}
              empty={<EmptyState icon={<Award size={22} />} title="Sin insignias todavía" description="Las insignias que crees aquí alimentan el carrusel de cursos destacados." />}
              actions={(b) => {
                const idx = badgesOrdenados.findIndex((item) => item.id === b.id);
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= badgesOrdenados.length - 1}
                    busy={badgesCrud.ocupados.has(b.id)}
                    label={b.title.es || b.slug}
                    onUp={() => badgesCrud.mover(b, 'arriba')}
                    onDown={() => badgesCrud.mover(b, 'abajo')}
                    onEdit={() => {
                      setEditandoBadge(b);
                      setDialogBadge(true);
                    }}
                    onDelete={() => setBorrandoBadge(b)}
                  />
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
        busy={borrandoCategoria ? categoriasCrud.ocupados.has(borrandoCategoria.id) : false}
      />

      <ConfirmDialog
        open={Boolean(borrandoItem)}
        onClose={() => setBorrandoItem(null)}
        onConfirm={handleConfirmarBorradoItem}
        title="Eliminar curso"
        description={`«${borrandoItem?.title.es || borrandoItem?.slug}» desaparecerá de la sección de educación del sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoItem ? itemsCrud.ocupados.has(borrandoItem.id) : false}
      />

      <ConfirmDialog
        open={Boolean(borrandoBadge)}
        onClose={() => setBorrandoBadge(null)}
        onConfirm={handleConfirmarBorradoBadge}
        title="Eliminar insignia"
        description={`«${borrandoBadge?.title.es || borrandoBadge?.slug}» desaparecerá del carrusel de cursos destacados. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoBadge ? badgesCrud.ocupados.has(borrandoBadge.id) : false}
      />
    </div>
  );
}
