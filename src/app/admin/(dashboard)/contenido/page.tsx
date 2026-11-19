'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Layers, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog, Tabs, TabPanel, PageHeader, EmptyState, RowReorderActions } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { useReorderableResource } from '@/hooks/useReorderableResource';
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

  // ── Servicios / Tecnologías / Timeline (T-30: el cuarteto crear, publicar,
  // reordenar y borrar optimista vive una sola vez en useReorderableResource) ─

  const serviciosCrud = useReorderableResource<ServiceRow>({
    items: services,
    setItems: setServices,
    endpoint: '/api/admin/portfolio/services',
    showToast,
    labels: {
      created: 'Servicio creado.',
      updated: 'Servicio actualizado.',
      deleted: 'Servicio eliminado.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  const tecnologiasCrud = useReorderableResource<TechnologyRow>({
    items: technologies,
    setItems: setTechnologies,
    endpoint: '/api/admin/portfolio/technologies',
    showToast,
    labels: {
      created: 'Tecnología creada.',
      updated: 'Tecnología actualizada.',
      deleted: 'Tecnología eliminada.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  const timelineCrud = useReorderableResource<TimelineRow>({
    items: timeline,
    setItems: setTimeline,
    endpoint: '/api/admin/portfolio/timeline',
    showToast,
    labels: {
      created: 'Hito creado.',
      updated: 'Hito actualizado.',
      deleted: 'Hito eliminado.',
      toggleError: 'No se pudo cambiar la publicación.',
      reorderError: 'No se pudo reordenar.',
      deleteError: 'No se pudo eliminar.',
    },
  });

  async function handleSubmitServicio(body: ReturnType<typeof aCuerpoDeApi>) {
    if (editandoServicio) await serviciosCrud.actualizar(editandoServicio.id, body);
    else await serviciosCrud.crear(body);
    setDialogServicio(false);
    setEditandoServicio(null);
  }

  async function handleConfirmarBorradoServicio() {
    if (!borrandoServicio) return;
    await serviciosCrud.eliminar(borrandoServicio.id, () => setBorrandoServicio(null));
  }

  async function handleSubmitTecnologia(values: TechnologyFormValues) {
    if (editandoTecnologia) await tecnologiasCrud.actualizar(editandoTecnologia.id, values);
    else await tecnologiasCrud.crear(values);
    setDialogTecnologia(false);
    setEditandoTecnologia(null);
  }

  async function handleConfirmarBorradoTecnologia() {
    if (!borrandoTecnologia) return;
    await tecnologiasCrud.eliminar(borrandoTecnologia.id, () => setBorrandoTecnologia(null));
  }

  async function handleSubmitHito(values: TimelineFormValues) {
    if (editandoHito) await timelineCrud.actualizar(editandoHito.id, values);
    else await timelineCrud.crear(values);
    setDialogHito(false);
    setEditandoHito(null);
  }

  async function handleConfirmarBorradoHito() {
    if (!borrandoHito) return;
    await timelineCrud.eliminar(borrandoHito.id, () => setBorrandoHito(null));
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
    { id: 'publicado', header: 'Publicado', cell: (s) => <Switch checked={s.is_published} onChange={() => serviciosCrud.togglePublicado(s)} label={`Publicar ${s.title.es || s.slug}`} hideLabel disabled={serviciosCrud.ocupados.has(s.id)} /> },
  ];

  const columnasTecnologias: Column<TechnologyRow>[] = [
    { id: 'nombre', header: 'Tecnología', mobile: 'primary', cell: (t) => t.name },
    { id: 'categoria', header: 'Categoría', mobile: 'meta', cell: (t) => t.category || '—' },
    { id: 'publicado', header: 'Publicado', cell: (t) => <Switch checked={t.is_published} onChange={() => tecnologiasCrud.togglePublicado(t)} label={`Publicar ${t.name}`} hideLabel disabled={tecnologiasCrud.ocupados.has(t.id)} /> },
  ];

  const columnasTimeline: Column<TimelineRow>[] = [
    { id: 'titulo', header: 'Hito', mobile: 'primary', cell: (h) => h.title.es || h.slug },
    { id: 'ano', header: 'Año', mobile: 'meta', cell: (h) => h.year.es || '—' },
    { id: 'publicado', header: 'Publicado', cell: (h) => <Switch checked={h.is_published} onChange={() => timelineCrud.togglePublicado(h)} label={`Publicar ${h.title.es || h.slug}`} hideLabel disabled={timelineCrud.ocupados.has(h.id)} /> },
  ];

  const columnasIntereses: Column<InterestFormValues & { indice: number }>[] = [
    { id: 'titulo', header: 'Interés', mobile: 'primary', cell: (i) => i.title },
    { id: 'icono', header: 'Icono', mobile: 'meta', cell: (i) => i.iconKey },
  ];

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
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= services.length - 1}
                    busy={serviciosCrud.ocupados.has(s.id)}
                    label={s.title.es || s.slug}
                    onUp={() => serviciosCrud.mover(s, 'arriba')}
                    onDown={() => serviciosCrud.mover(s, 'abajo')}
                    onEdit={() => { setEditandoServicio(s); setDialogServicio(true); }}
                    onDelete={() => setBorrandoServicio(s)}
                  />
                );
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
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= technologies.length - 1}
                    busy={tecnologiasCrud.ocupados.has(t.id)}
                    label={t.name}
                    onUp={() => tecnologiasCrud.mover(t, 'arriba')}
                    onDown={() => tecnologiasCrud.mover(t, 'abajo')}
                    onEdit={() => { setEditandoTecnologia(t); setDialogTecnologia(true); }}
                    onDelete={() => setBorrandoTecnologia(t)}
                  />
                );
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
                return (
                  <RowReorderActions
                    disableUp={idx <= 0}
                    disableDown={idx >= timeline.length - 1}
                    busy={timelineCrud.ocupados.has(h.id)}
                    label={h.title.es || h.slug}
                    onUp={() => timelineCrud.mover(h, 'arriba')}
                    onDown={() => timelineCrud.mover(h, 'abajo')}
                    onEdit={() => { setEditandoHito(h); setDialogHito(true); }}
                    onDelete={() => setBorrandoHito(h)}
                  />
                );
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
              actions={(i) => (
                <RowReorderActions
                  disableUp={i.indice <= 0}
                  disableDown={i.indice >= interests.length - 1}
                  busy={guardandoInteres}
                  label={i.title}
                  onUp={() => handleMoverInteres(i.indice, 'arriba')}
                  onDown={() => handleMoverInteres(i.indice, 'abajo')}
                  onEdit={() => { setIndiceEditandoInteres(i.indice); setDialogInteres(true); }}
                  onDelete={() => setIndiceBorrandoInteres(i.indice)}
                />
              )}
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
        busy={borrandoServicio ? serviciosCrud.ocupados.has(borrandoServicio.id) : false}
      />
      <ConfirmDialog
        open={Boolean(borrandoTecnologia)}
        onClose={() => setBorrandoTecnologia(null)}
        onConfirm={handleConfirmarBorradoTecnologia}
        title="Eliminar tecnología"
        description={`«${borrandoTecnologia?.name}» desaparecerá de la cintilla del stack. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoTecnologia ? tecnologiasCrud.ocupados.has(borrandoTecnologia.id) : false}
      />
      <ConfirmDialog
        open={Boolean(borrandoHito)}
        onClose={() => setBorrandoHito(null)}
        onConfirm={handleConfirmarBorradoHito}
        title="Eliminar hito"
        description={`«${borrandoHito?.title.es || borrandoHito?.slug}» desaparecerá del timeline. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrandoHito ? timelineCrud.ocupados.has(borrandoHito.id) : false}
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
