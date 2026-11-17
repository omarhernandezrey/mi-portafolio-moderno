'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { ProjectFormDialog, type ProjectFormValues } from '@/components/admin/portfolio/ProjectFormDialog';

interface ProjectRow {
  id: string;
  slug: string;
  title: { es?: string; en?: string };
  description: { es?: string; en?: string };
  technologies: string[];
  repository: string;
  demo: string;
  category: { es?: string; en?: string } | null;
  image_url: string | null;
  demo_embeddable: boolean;
  demo_checked_at: string | null;
  position: number;
  is_published: boolean;
}

type ApiRespuesta = ProjectRow & { embedCheck?: { resultado: string; motivo: string } | null };

export default function AdminProyectosPage() {
  const { showToast } = useToast();
  const [proyectos, setProyectos] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Se distingue de `proyectos.length === 0`: sin esto, un fallo de red
  // mostraría el mismo estado vacío que "de verdad no hay proyectos todavía",
  // sin forma de distinguirlos ni de reintentar.
  const [errorCarga, setErrorCarga] = useState('');
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<ProjectRow | null>(null);
  const [borrando, setBorrando] = useState<ProjectRow | null>(null);
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  const cargar = useCallback(async () => {
    setLoading(true);
    setErrorCarga('');
    try {
      const data = await adminFetch<ProjectRow[]>('/api/admin/portfolio/projects');
      setProyectos(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorCarga(err instanceof Error ? err.message : 'No se pudieron cargar los proyectos.');
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

  async function avisarEmbebido(respuesta: ApiRespuesta) {
    if (respuesta.embedCheck?.resultado === 'no-embebible') {
      showToast(`«${respuesta.slug}»: el demo bloquea el embebido (${respuesta.embedCheck.motivo}). Se guardó igual.`, 'warning', 7000);
    }
  }

  async function handleSubmit(values: ProjectFormValues) {
    if (editando) {
      const respuesta = await adminFetch<ApiRespuesta>(`/api/admin/portfolio/projects/${editando.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setProyectos((prev) => prev.map((p) => (p.id === respuesta.id ? { ...p, ...respuesta } : p)));
      await avisarEmbebido(respuesta);
      showToast('Proyecto actualizado.', 'success');
    } else {
      const respuesta = await adminFetch<ApiRespuesta>('/api/admin/portfolio/projects', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setProyectos((prev) => [...prev, respuesta]);
      await avisarEmbebido(respuesta);
      showToast('Proyecto creado.', 'success');
    }
    setDialogAbierto(false);
    setEditando(null);
  }

  async function handleTogglePublicado(proyecto: ProjectRow) {
    const anterior = proyecto.is_published;
    marcarOcupado(proyecto.id, true);
    setProyectos((prev) => prev.map((p) => (p.id === proyecto.id ? { ...p, is_published: !anterior } : p)));

    try {
      await adminFetch(`/api/admin/portfolio/projects/${proyecto.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !anterior }),
      });
    } catch (err) {
      setProyectos((prev) => prev.map((p) => (p.id === proyecto.id ? { ...p, is_published: anterior } : p)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(proyecto.id, false);
    }
  }

  async function handleMover(proyecto: ProjectRow, direccion: 'arriba' | 'abajo') {
    const indiceActual = proyectos.findIndex((p) => p.id === proyecto.id);
    const indiceDestino = direccion === 'arriba' ? indiceActual - 1 : indiceActual + 1;
    if (indiceActual < 0 || indiceDestino < 0 || indiceDestino >= proyectos.length) return;

    const anterior = proyectos;
    const nuevo = [...proyectos];
    [nuevo[indiceActual], nuevo[indiceDestino]] = [nuevo[indiceDestino], nuevo[indiceActual]];
    setProyectos(nuevo);
    marcarOcupado(proyecto.id, true);

    try {
      await adminFetch('/api/admin/portfolio/projects/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevo.map((p) => p.id) }),
      });
    } catch (err) {
      setProyectos(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(proyecto.id, false);
    }
  }

  async function handleConfirmarBorrado() {
    if (!borrando) return;
    const id = borrando.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/projects/${id}`, { method: 'DELETE' });
      setProyectos((prev) => prev.filter((p) => p.id !== id));
      showToast('Proyecto eliminado.', 'success');
      setBorrando(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  const columns: Column<ProjectRow>[] = [
    {
      id: 'titulo',
      header: 'Proyecto',
      mobile: 'primary',
      cell: (p) => p.title.es || p.slug,
    },
    {
      id: 'slug',
      header: 'Slug',
      mobile: 'meta',
      cell: (p) => <span className="font-mono text-kicker text-admin-muted">{p.slug}</span>,
    },
    {
      id: 'tecnologias',
      header: 'Tecnologías',
      cell: (p) =>
        p.technologies.length > 0
          ? `${p.technologies.slice(0, 3).join(', ')}${p.technologies.length > 3 ? '…' : ''}`
          : '—',
    },
    {
      id: 'demo',
      header: 'Demo',
      cell: (p) =>
        !p.demo ? (
          'Sin demo'
        ) : p.demo_embeddable ? (
          'Embebible'
        ) : (
          <span className="text-admin-warning">Bloquea el iframe</span>
        ),
    },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (p) => (
        <Switch
          checked={p.is_published}
          onChange={() => handleTogglePublicado(p)}
          label={`Publicar ${p.title.es || p.slug}`}
          hideLabel
          disabled={ocupados.has(p.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Proyectos"
        description="Crea, edita, publica y reordena los proyectos que alimenta el visor del sitio."
        actions={
          <AdminButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditando(null);
              setDialogAbierto(true);
            }}
          >
            Nuevo proyecto
          </AdminButton>
        }
      />

      {errorCarga && !loading ? (
        <EmptyState
          icon={<RefreshCw size={22} />}
          title="No se pudieron cargar los proyectos"
          description={errorCarga}
          action={
            <AdminButton size="sm" icon={<RefreshCw size={14} />} onClick={cargar}>
              Reintentar
            </AdminButton>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={proyectos}
          rowKey={(p) => p.id}
          caption="Proyectos del portafolio"
          loading={loading}
          empty={
            <EmptyState
              icon={<Plus size={22} />}
              title="Sin proyectos todavía"
              description="Los proyectos que crees aquí alimentan el visor del sitio público."
            />
          }
          actions={(p) => {
            const indice = proyectos.findIndex((item) => item.id === p.id);
            return (
              <>
                <button
                  type="button"
                  onClick={() => handleMover(p, 'arriba')}
                  disabled={indice <= 0 || ocupados.has(p.id)}
                  aria-label={`Subir ${p.title.es || p.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMover(p, 'abajo')}
                  disabled={indice >= proyectos.length - 1 || ocupados.has(p.id)}
                  aria-label={`Bajar ${p.title.es || p.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditando(p);
                    setDialogAbierto(true);
                  }}
                  aria-label={`Editar ${p.title.es || p.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setBorrando(p)}
                  aria-label={`Eliminar ${p.title.es || p.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-danger/20 bg-admin-danger/10 text-admin-danger transition-colors hover:bg-admin-danger/15"
                >
                  <Trash2 size={15} />
                </button>
              </>
            );
          }}
        />
      )}

      <ProjectFormDialog
        open={dialogAbierto}
        onClose={() => {
          setDialogAbierto(false);
          setEditando(null);
        }}
        onSubmit={handleSubmit}
        initial={editando}
      />

      <ConfirmDialog
        open={Boolean(borrando)}
        onClose={() => setBorrando(null)}
        onConfirm={handleConfirmarBorrado}
        title="Eliminar proyecto"
        description={`«${borrando?.title.es || borrando?.slug}» desaparecerá del visor del sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrando ? ocupados.has(borrando.id) : false}
      />
    </div>
  );
}
