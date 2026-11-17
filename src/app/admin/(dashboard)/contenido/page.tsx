'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Heart, Layers, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog, Tabs, TabPanel } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { ServiceFormDialog, aCuerpoDeApi, type ServiceFormInitial } from '@/components/admin/portfolio/ServiceFormDialog';
import { TechnologyFormDialog, type TechnologyFormInitial, type TechnologyFormValues } from '@/components/admin/portfolio/TechnologyFormDialog';
import { TimelineFormDialog, type TimelineFormInitial, type TimelineFormValues } from '@/components/admin/portfolio/TimelineFormDialog';
import { InterestFormDialog, type InterestFormValues } from '@/components/admin/portfolio/InterestFormDialog';

interface ServiceRow {
  id: string;
  slug: string;
  title: { es?: string; en?: string };
  description: { es?: string; en?: string } | null;
  icon: string | null;
  badge: string | null;
  features: { es?: string[]; en?: string[] } | null;
  gradient: string | null;
  price_min: number | null;
  price_max: number | null;
  price_currency: string | null;
  position: number;
  is_published: boolean;
}

interface TechnologyRow {
  id: string;
  name: string;
  icon_key: string | null;
  color: string | null;
  category: string | null;
  position: number;
  is_published: boolean;
}

interface TimelineRow {
  id: string;
  slug: string;
  year: { es?: string; en?: string };
  title: { es?: string; en?: string };
  description: { es?: string; en?: string } | null;
  icon_key: string | null;
  position: number;
  is_published: boolean;
}

export default function AdminContenidoPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'servicios' | 'tecnologias' | 'timeline' | 'perfil'>('servicios');

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [interests, setInterests] = useState<InterestFormValues[]>([]);
  const [interestsPublicadas, setInterestsPublicadas] = useState(true);

  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());
  const [guardandoInteres, setGuardandoInteres] = useState(false);

  const [dialogServicio, setDialogServicio] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState<ServiceRow | null>(null);
  const [borrandoServicio, setBorrandoServicio] = useState<ServiceRow | null>(null);

  const [dialogTecnologia, setDialogTecnologia] = useState(false);
  const [editandoTecnologia, setEditandoTecnologia] = useState<TechnologyRow | null>(null);
  const [borrandoTecnologia, setBorrandoTecnologia] = useState<TechnologyRow | null>(null);

  const [dialogHito, setDialogHito] = useState(false);
  const [editandoHito, setEditandoHito] = useState<TimelineRow | null>(null);
  const [borrandoHito, setBorrandoHito] = useState<TimelineRow | null>(null);

  const [dialogInteres, setDialogInteres] = useState(false);
  const [indiceEditandoInteres, setIndiceEditandoInteres] = useState<number | null>(null);
  const [indiceBorrandoInteres, setIndiceBorrandoInteres] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErrorCarga('');
    try {
      const [svcs, techs, hitos, perfil] = await Promise.all([
        adminFetch<ServiceRow[]>('/api/admin/portfolio/services'),
        adminFetch<TechnologyRow[]>('/api/admin/portfolio/technologies'),
        adminFetch<TimelineRow[]>('/api/admin/portfolio/timeline'),
        adminFetch<{ content: InterestFormValues[]; is_published: boolean }>('/api/admin/portfolio/profile/interests'),
      ]);
      setServices(Array.isArray(svcs) ? svcs : []);
      setTechnologies(Array.isArray(techs) ? techs : []);
      setTimeline(Array.isArray(hitos) ? hitos : []);
      setInterests(Array.isArray(perfil?.content) ? perfil.content : []);
      setInterestsPublicadas(perfil?.is_published ?? true);
    } catch (err) {
      setErrorCarga(err instanceof Error ? err.message : 'No se pudo cargar el contenido.');
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

  // ── Servicios ────────────────────────────────────────────────────────────

  async function handleSubmitServicio(body: ReturnType<typeof aCuerpoDeApi>) {
    if (editandoServicio) {
      const r = await adminFetch<ServiceRow>(`/api/admin/portfolio/services/${editandoServicio.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setServices((prev) => prev.map((s) => (s.id === r.id ? { ...s, ...r } : s)));
      showToast('Servicio actualizado.', 'success');
    } else {
      const r = await adminFetch<ServiceRow>('/api/admin/portfolio/services', { method: 'POST', body: JSON.stringify(body) });
      setServices((prev) => [...prev, r]);
      showToast('Servicio creado.', 'success');
    }
    setDialogServicio(false);
    setEditandoServicio(null);
  }

  async function handleTogglePublicadoServicio(s: ServiceRow) {
    const anterior = s.is_published;
    marcarOcupado(s.id, true);
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_published: !anterior } : x)));
    try {
      await adminFetch(`/api/admin/portfolio/services/${s.id}`, { method: 'PATCH', body: JSON.stringify({ is_published: !anterior }) });
    } catch (err) {
      setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_published: anterior } : x)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(s.id, false);
    }
  }

  async function handleMoverServicio(s: ServiceRow, direccion: 'arriba' | 'abajo') {
    const idx = services.findIndex((x) => x.id === s.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= services.length) return;
    const anterior = services;
    const nuevo = [...services];
    [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
    setServices(nuevo);
    marcarOcupado(s.id, true);
    try {
      await adminFetch('/api/admin/portfolio/services/reorder', { method: 'PATCH', body: JSON.stringify({ ids: nuevo.map((x) => x.id) }) });
    } catch (err) {
      setServices(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(s.id, false);
    }
  }

  async function handleConfirmarBorradoServicio() {
    if (!borrandoServicio) return;
    const id = borrandoServicio.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/services/${id}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Servicio eliminado.', 'success');
      setBorrandoServicio(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Tecnologías ──────────────────────────────────────────────────────────

  async function handleSubmitTecnologia(values: TechnologyFormValues) {
    if (editandoTecnologia) {
      const r = await adminFetch<TechnologyRow>(`/api/admin/portfolio/technologies/${editandoTecnologia.id}`, { method: 'PATCH', body: JSON.stringify(values) });
      setTechnologies((prev) => prev.map((t) => (t.id === r.id ? { ...t, ...r } : t)));
      showToast('Tecnología actualizada.', 'success');
    } else {
      const r = await adminFetch<TechnologyRow>('/api/admin/portfolio/technologies', { method: 'POST', body: JSON.stringify(values) });
      setTechnologies((prev) => [...prev, r]);
      showToast('Tecnología creada.', 'success');
    }
    setDialogTecnologia(false);
    setEditandoTecnologia(null);
  }

  async function handleTogglePublicadoTecnologia(t: TechnologyRow) {
    const anterior = t.is_published;
    marcarOcupado(t.id, true);
    setTechnologies((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_published: !anterior } : x)));
    try {
      await adminFetch(`/api/admin/portfolio/technologies/${t.id}`, { method: 'PATCH', body: JSON.stringify({ is_published: !anterior }) });
    } catch (err) {
      setTechnologies((prev) => prev.map((x) => (x.id === t.id ? { ...x, is_published: anterior } : x)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(t.id, false);
    }
  }

  async function handleMoverTecnologia(t: TechnologyRow, direccion: 'arriba' | 'abajo') {
    const idx = technologies.findIndex((x) => x.id === t.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= technologies.length) return;
    const anterior = technologies;
    const nuevo = [...technologies];
    [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
    setTechnologies(nuevo);
    marcarOcupado(t.id, true);
    try {
      await adminFetch('/api/admin/portfolio/technologies/reorder', { method: 'PATCH', body: JSON.stringify({ ids: nuevo.map((x) => x.id) }) });
    } catch (err) {
      setTechnologies(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(t.id, false);
    }
  }

  async function handleConfirmarBorradoTecnologia() {
    if (!borrandoTecnologia) return;
    const id = borrandoTecnologia.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/technologies/${id}`, { method: 'DELETE' });
      setTechnologies((prev) => prev.filter((t) => t.id !== id));
      showToast('Tecnología eliminada.', 'success');
      setBorrandoTecnologia(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Timeline ─────────────────────────────────────────────────────────────

  async function handleSubmitHito(values: TimelineFormValues) {
    if (editandoHito) {
      const r = await adminFetch<TimelineRow>(`/api/admin/portfolio/timeline/${editandoHito.id}`, { method: 'PATCH', body: JSON.stringify(values) });
      setTimeline((prev) => prev.map((h) => (h.id === r.id ? { ...h, ...r } : h)));
      showToast('Hito actualizado.', 'success');
    } else {
      const r = await adminFetch<TimelineRow>('/api/admin/portfolio/timeline', { method: 'POST', body: JSON.stringify(values) });
      setTimeline((prev) => [...prev, r]);
      showToast('Hito creado.', 'success');
    }
    setDialogHito(false);
    setEditandoHito(null);
  }

  async function handleTogglePublicadoHito(h: TimelineRow) {
    const anterior = h.is_published;
    marcarOcupado(h.id, true);
    setTimeline((prev) => prev.map((x) => (x.id === h.id ? { ...x, is_published: !anterior } : x)));
    try {
      await adminFetch(`/api/admin/portfolio/timeline/${h.id}`, { method: 'PATCH', body: JSON.stringify({ is_published: !anterior }) });
    } catch (err) {
      setTimeline((prev) => prev.map((x) => (x.id === h.id ? { ...x, is_published: anterior } : x)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(h.id, false);
    }
  }

  async function handleMoverHito(h: TimelineRow, direccion: 'arriba' | 'abajo') {
    const idx = timeline.findIndex((x) => x.id === h.id);
    const destino = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (idx < 0 || destino < 0 || destino >= timeline.length) return;
    const anterior = timeline;
    const nuevo = [...timeline];
    [nuevo[idx], nuevo[destino]] = [nuevo[destino], nuevo[idx]];
    setTimeline(nuevo);
    marcarOcupado(h.id, true);
    try {
      await adminFetch('/api/admin/portfolio/timeline/reorder', { method: 'PATCH', body: JSON.stringify({ ids: nuevo.map((x) => x.id) }) });
    } catch (err) {
      setTimeline(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(h.id, false);
    }
  }

  async function handleConfirmarBorradoHito() {
    if (!borrandoHito) return;
    const id = borrandoHito.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/timeline/${id}`, { method: 'DELETE' });
      setTimeline((prev) => prev.filter((h) => h.id !== id));
      showToast('Hito eliminado.', 'success');
      setBorrandoHito(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  // ── Perfil → intereses ───────────────────────────────────────────────────

  async function guardarIntereses(nuevaLista: InterestFormValues[], publicada = interestsPublicadas) {
    const anterior = interests;
    const anteriorPublicada = interestsPublicadas;
    setGuardandoInteres(true);
    setInterests(nuevaLista);
    setInterestsPublicadas(publicada);
    try {
      await adminFetch('/api/admin/portfolio/profile/interests', {
        method: 'PUT',
        body: JSON.stringify({ content: nuevaLista, is_published: publicada }),
      });
    } catch (err) {
      setInterests(anterior);
      setInterestsPublicadas(anteriorPublicada);
      showToast(err instanceof Error ? err.message : 'No se pudo guardar.', 'error');
    } finally {
      setGuardandoInteres(false);
    }
  }

  function handleSubmitInteres(values: InterestFormValues) {
    const nuevaLista =
      indiceEditandoInteres !== null
        ? interests.map((it, i) => (i === indiceEditandoInteres ? values : it))
        : [...interests, values];
    setDialogInteres(false);
    setIndiceEditandoInteres(null);
    guardarIntereses(nuevaLista);
  }

  function handleMoverInteres(indice: number, direccion: 'arriba' | 'abajo') {
    const destino = direccion === 'arriba' ? indice - 1 : indice + 1;
    if (destino < 0 || destino >= interests.length) return;
    const nuevaLista = [...interests];
    [nuevaLista[indice], nuevaLista[destino]] = [nuevaLista[destino], nuevaLista[indice]];
    guardarIntereses(nuevaLista);
  }

  async function handleTogglePublicadaSeccionIntereses() {
    await guardarIntereses(interests, !interestsPublicadas);
  }

  function handleConfirmarBorradoInteres() {
    if (indiceBorrandoInteres === null) return;
    const nuevaLista = interests.filter((_, i) => i !== indiceBorrandoInteres);
    setIndiceBorrandoInteres(null);
    guardarIntereses(nuevaLista);
  }

  // ── Columnas ─────────────────────────────────────────────────────────────

  const columnasServicios: Column<ServiceRow>[] = [
    { id: 'titulo', header: 'Servicio', mobile: 'primary', cell: (s) => s.title.es || s.slug },
    { id: 'insignia', header: 'Insignia', mobile: 'meta', cell: (s) => s.badge || '—' },
    { id: 'publicado', header: 'Publicado', cell: (s) => <Switch checked={s.is_published} onChange={() => handleTogglePublicadoServicio(s)} label={`Publicar ${s.title.es || s.slug}`} hideLabel disabled={ocupados.has(s.id)} /> },
  ];

  const columnasTecnologias: Column<TechnologyRow>[] = [
    { id: 'nombre', header: 'Tecnología', mobile: 'primary', cell: (t) => t.name },
    { id: 'categoria', header: 'Categoría', mobile: 'meta', cell: (t) => t.category || '—' },
    { id: 'publicado', header: 'Publicado', cell: (t) => <Switch checked={t.is_published} onChange={() => handleTogglePublicadoTecnologia(t)} label={`Publicar ${t.name}`} hideLabel disabled={ocupados.has(t.id)} /> },
  ];

  const columnasTimeline: Column<TimelineRow>[] = [
    { id: 'titulo', header: 'Hito', mobile: 'primary', cell: (h) => h.title.es || h.slug },
    { id: 'ano', header: 'Año', mobile: 'meta', cell: (h) => h.year.es || '—' },
    { id: 'publicado', header: 'Publicado', cell: (h) => <Switch checked={h.is_published} onChange={() => handleTogglePublicadoHito(h)} label={`Publicar ${h.title.es || h.slug}`} hideLabel disabled={ocupados.has(h.id)} /> },
  ];

  const columnasIntereses: Column<InterestFormValues & { indice: number }>[] = [
    { id: 'titulo', header: 'Interés', mobile: 'primary', cell: (i) => i.title },
    { id: 'icono', header: 'Icono', mobile: 'meta', cell: (i) => i.iconKey },
  ];

  const botonesFila = (
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

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader overline="Portafolio" title="Contenido" description="Servicios, tecnologías del marquee, timeline e intereses del perfil." />

      {errorCarga && !loading ? (
        <EmptyState
          icon={<RefreshCw size={22} />}
          title="No se pudo cargar el contenido"
          description={errorCarga}
          action={<AdminButton size="sm" icon={<RefreshCw size={14} />} onClick={cargar}>Reintentar</AdminButton>}
        />
      ) : (
        <>
          <Tabs
            items={[
              { id: 'servicios', label: 'Servicios', count: services.length },
              { id: 'tecnologias', label: 'Tecnologías', count: technologies.length },
              { id: 'timeline', label: 'Timeline', count: timeline.length },
              { id: 'perfil', label: 'Perfil', count: interests.length },
            ]}
            activeId={tab}
            onChange={(id) => setTab(id as typeof tab)}
            ariaLabel="Qué contenido gestionar"
          />

          <TabPanel tabId="servicios" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton variant="primary" icon={<Plus size={16} />} onClick={() => { setEditandoServicio(null); setDialogServicio(true); }}>
                Nuevo servicio
              </AdminButton>
            </div>
            <DataTable
              columns={columnasServicios}
              rows={services}
              rowKey={(s) => s.id}
              caption="Servicios del portafolio"
              loading={loading}
              empty={<EmptyState icon={<Layers size={22} />} title="Sin servicios todavía" description="Los servicios que crees aquí alimentan la sección de servicios del sitio." />}
              actions={(s) => {
                const idx = services.findIndex((x) => x.id === s.id);
                return botonesFila(idx <= 0, idx >= services.length - 1, ocupados.has(s.id), s.title.es || s.slug, () => handleMoverServicio(s, 'arriba'), () => handleMoverServicio(s, 'abajo'), () => { setEditandoServicio(s); setDialogServicio(true); }, () => setBorrandoServicio(s));
              }}
            />
          </TabPanel>

          <TabPanel tabId="tecnologias" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton variant="primary" icon={<Plus size={16} />} onClick={() => { setEditandoTecnologia(null); setDialogTecnologia(true); }}>
                Nueva tecnología
              </AdminButton>
            </div>
            <DataTable
              columns={columnasTecnologias}
              rows={technologies}
              rowKey={(t) => t.id}
              caption="Tecnologías del marquee"
              loading={loading}
              empty={<EmptyState icon={<Sparkles size={22} />} title="Sin tecnologías todavía" description="Las tecnologías que crees aquí alimentan la cintilla del stack en la home." />}
              actions={(t) => {
                const idx = technologies.findIndex((x) => x.id === t.id);
                return botonesFila(idx <= 0, idx >= technologies.length - 1, ocupados.has(t.id), t.name, () => handleMoverTecnologia(t, 'arriba'), () => handleMoverTecnologia(t, 'abajo'), () => { setEditandoTecnologia(t); setDialogTecnologia(true); }, () => setBorrandoTecnologia(t));
              }}
            />
          </TabPanel>

          <TabPanel tabId="timeline" activeId={tab} className="space-y-5">
            <div className="flex justify-end">
              <AdminButton variant="primary" icon={<Plus size={16} />} onClick={() => { setEditandoHito(null); setDialogHito(true); }}>
                Nuevo hito
              </AdminButton>
            </div>
            <DataTable
              columns={columnasTimeline}
              rows={timeline}
              rowKey={(h) => h.id}
              caption="Hitos del timeline"
              loading={loading}
              empty={<EmptyState icon={<Sparkles size={22} />} title="Sin hitos todavía" description="Los hitos que crees aquí alimentan el timeline de experiencia." />}
              actions={(h) => {
                const idx = timeline.findIndex((x) => x.id === h.id);
                return botonesFila(idx <= 0, idx >= timeline.length - 1, ocupados.has(h.id), h.title.es || h.slug, () => handleMoverHito(h, 'arriba'), () => handleMoverHito(h, 'abajo'), () => { setEditandoHito(h); setDialogHito(true); }, () => setBorrandoHito(h));
              }}
            />
          </TabPanel>

          <TabPanel tabId="perfil" activeId={tab} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Switch
                checked={interestsPublicadas}
                onChange={handleTogglePublicadaSeccionIntereses}
                label="Mostrar la sección de intereses"
                disabled={guardandoInteres}
              />
              <AdminButton variant="primary" icon={<Plus size={16} />} onClick={() => { setIndiceEditandoInteres(null); setDialogInteres(true); }}>
                Nuevo interés
              </AdminButton>
            </div>
            <DataTable
              columns={columnasIntereses}
              rows={interests.map((i, indice) => ({ ...i, indice }))}
              rowKey={(i) => `${i.indice}-${i.title}`}
              caption="Intereses del perfil"
              loading={loading}
              empty={<EmptyState icon={<Heart size={22} />} title="Sin intereses todavía" description="Los intereses que crees aquí alimentan la tarjeta «Sobre mí» del sitio." />}
              actions={(i) =>
                botonesFila(
                  i.indice <= 0,
                  i.indice >= interests.length - 1,
                  guardandoInteres,
                  i.title,
                  () => handleMoverInteres(i.indice, 'arriba'),
                  () => handleMoverInteres(i.indice, 'abajo'),
                  () => { setIndiceEditandoInteres(i.indice); setDialogInteres(true); },
                  () => setIndiceBorrandoInteres(i.indice),
                )
              }
            />
          </TabPanel>
        </>
      )}

      <ServiceFormDialog
        open={dialogServicio}
        onClose={() => { setDialogServicio(false); setEditandoServicio(null); }}
        onSubmit={handleSubmitServicio}
        initial={editandoServicio as ServiceFormInitial | null}
      />
      <TechnologyFormDialog
        open={dialogTecnologia}
        onClose={() => { setDialogTecnologia(false); setEditandoTecnologia(null); }}
        onSubmit={handleSubmitTecnologia}
        initial={editandoTecnologia as TechnologyFormInitial | null}
      />
      <TimelineFormDialog
        open={dialogHito}
        onClose={() => { setDialogHito(false); setEditandoHito(null); }}
        onSubmit={handleSubmitHito}
        initial={editandoHito as TimelineFormInitial | null}
      />
      <InterestFormDialog
        open={dialogInteres}
        onClose={() => { setDialogInteres(false); setIndiceEditandoInteres(null); }}
        onSubmit={handleSubmitInteres}
        initial={indiceEditandoInteres !== null ? interests[indiceEditandoInteres] : null}
      />

      <ConfirmDialog
        open={Boolean(borrandoServicio)}
        onClose={() => setBorrandoServicio(null)}
        onConfirm={handleConfirmarBorradoServicio}
        title="Eliminar servicio"
        description={`«${borrandoServicio?.title.es || borrandoServicio?.slug}» desaparecerá de la sección de servicios del sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoServicio ? ocupados.has(borrandoServicio.id) : false}
      />
      <ConfirmDialog
        open={Boolean(borrandoTecnologia)}
        onClose={() => setBorrandoTecnologia(null)}
        onConfirm={handleConfirmarBorradoTecnologia}
        title="Eliminar tecnología"
        description={`«${borrandoTecnologia?.name}» desaparecerá de la cintilla del stack. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoTecnologia ? ocupados.has(borrandoTecnologia.id) : false}
      />
      <ConfirmDialog
        open={Boolean(borrandoHito)}
        onClose={() => setBorrandoHito(null)}
        onConfirm={handleConfirmarBorradoHito}
        title="Eliminar hito"
        description={`«${borrandoHito?.title.es || borrandoHito?.slug}» desaparecerá del timeline. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoHito ? ocupados.has(borrandoHito.id) : false}
      />
      <ConfirmDialog
        open={indiceBorrandoInteres !== null}
        onClose={() => setIndiceBorrandoInteres(null)}
        onConfirm={handleConfirmarBorradoInteres}
        title="Eliminar interés"
        description={`«${indiceBorrandoInteres !== null ? interests[indiceBorrandoInteres]?.title : ''}» desaparecerá de la tarjeta «Sobre mí». Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={guardandoInteres}
      />
    </div>
  );
}
