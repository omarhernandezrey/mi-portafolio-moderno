'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Gauge, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton, DataTable, type Column, Switch, ConfirmDialog } from '@/components/admin/ui';
import { adminFetch } from '@/lib/admin/client-fetch';
import { useToast } from '@/components/ui/Toast';
import { SkillFormDialog, type SkillFormValues } from '@/components/admin/portfolio/SkillFormDialog';

interface SkillRow {
  id: string;
  slug: string;
  name: { es?: string; en?: string };
  percentage: number;
  color_hex: string | null;
  icon: string | null;
  description: { es?: string; en?: string } | null;
  category: { es?: string; en?: string } | null;
  position: number;
  is_published: boolean;
}

export default function AdminSkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [editando, setEditando] = useState<SkillRow | null>(null);
  const [borrando, setBorrando] = useState<SkillRow | null>(null);
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  const cargar = useCallback(async () => {
    setLoading(true);
    setErrorCarga('');
    try {
      const data = await adminFetch<SkillRow[]>('/api/admin/portfolio/skills');
      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorCarga(err instanceof Error ? err.message : 'No se pudieron cargar las skills.');
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

  async function handleSubmit(values: SkillFormValues) {
    if (editando) {
      const respuesta = await adminFetch<SkillRow>(`/api/admin/portfolio/skills/${editando.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setSkills((prev) => prev.map((s) => (s.id === respuesta.id ? { ...s, ...respuesta } : s)));
      showToast('Skill actualizada.', 'success');
    } else {
      const respuesta = await adminFetch<SkillRow>('/api/admin/portfolio/skills', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSkills((prev) => [...prev, respuesta]);
      showToast('Skill creada.', 'success');
    }
    setDialogAbierto(false);
    setEditando(null);
  }

  async function handleTogglePublicado(skill: SkillRow) {
    const anterior = skill.is_published;
    marcarOcupado(skill.id, true);
    setSkills((prev) => prev.map((s) => (s.id === skill.id ? { ...s, is_published: !anterior } : s)));

    try {
      await adminFetch(`/api/admin/portfolio/skills/${skill.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !anterior }),
      });
    } catch (err) {
      setSkills((prev) => prev.map((s) => (s.id === skill.id ? { ...s, is_published: anterior } : s)));
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar la publicación.', 'error');
    } finally {
      marcarOcupado(skill.id, false);
    }
  }

  async function handleMover(skill: SkillRow, direccion: 'arriba' | 'abajo') {
    const indiceActual = skills.findIndex((s) => s.id === skill.id);
    const indiceDestino = direccion === 'arriba' ? indiceActual - 1 : indiceActual + 1;
    if (indiceActual < 0 || indiceDestino < 0 || indiceDestino >= skills.length) return;

    const anterior = skills;
    const nuevo = [...skills];
    [nuevo[indiceActual], nuevo[indiceDestino]] = [nuevo[indiceDestino], nuevo[indiceActual]];
    setSkills(nuevo);
    marcarOcupado(skill.id, true);

    try {
      await adminFetch('/api/admin/portfolio/skills/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: nuevo.map((s) => s.id) }),
      });
    } catch (err) {
      setSkills(anterior);
      showToast(err instanceof Error ? err.message : 'No se pudo reordenar.', 'error');
    } finally {
      marcarOcupado(skill.id, false);
    }
  }

  async function handleConfirmarBorrado() {
    if (!borrando) return;
    const id = borrando.id;
    marcarOcupado(id, true);
    try {
      await adminFetch(`/api/admin/portfolio/skills/${id}`, { method: 'DELETE' });
      setSkills((prev) => prev.filter((s) => s.id !== id));
      showToast('Skill eliminada.', 'success');
      setBorrando(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar.', 'error');
    } finally {
      marcarOcupado(id, false);
    }
  }

  const columns: Column<SkillRow>[] = [
    {
      id: 'nombre',
      header: 'Skill',
      mobile: 'primary',
      cell: (s) => s.name.es || s.slug,
    },
    {
      id: 'categoria',
      header: 'Categoría',
      mobile: 'meta',
      cell: (s) => s.category?.es || '—',
    },
    {
      id: 'nivel',
      header: 'Nivel',
      align: 'right',
      cell: (s) => (
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(s.color_hex || '') ? s.color_hex! : undefined }}
          />
          {s.percentage}%
        </span>
      ),
    },
    {
      id: 'publicado',
      header: 'Publicado',
      cell: (s) => (
        <Switch
          checked={s.is_published}
          onChange={() => handleTogglePublicado(s)}
          label={`Publicar ${s.name.es || s.slug}`}
          hideLabel
          disabled={ocupados.has(s.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Skills"
        description="Crea, edita, publica y reordena las habilidades que muestra el sitio."
        actions={
          <AdminButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditando(null);
              setDialogAbierto(true);
            }}
          >
            Nueva skill
          </AdminButton>
        }
      />

      {errorCarga && !loading ? (
        <EmptyState
          icon={<RefreshCw size={22} />}
          title="No se pudieron cargar las skills"
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
          rows={skills}
          rowKey={(s) => s.id}
          caption="Skills del portafolio"
          loading={loading}
          empty={
            <EmptyState
              icon={<Gauge size={22} />}
              title="Sin skills todavía"
              description="Las skills que crees aquí alimentan la sección de habilidades del sitio público."
            />
          }
          actions={(s) => {
            const indice = skills.findIndex((item) => item.id === s.id);
            return (
              <>
                <button
                  type="button"
                  onClick={() => handleMover(s, 'arriba')}
                  disabled={indice <= 0 || ocupados.has(s.id)}
                  aria-label={`Subir ${s.name.es || s.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMover(s, 'abajo')}
                  disabled={indice >= skills.length - 1 || ocupados.has(s.id)}
                  aria-label={`Bajar ${s.name.es || s.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditando(s);
                    setDialogAbierto(true);
                  }}
                  aria-label={`Editar ${s.name.es || s.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setBorrando(s)}
                  aria-label={`Eliminar ${s.name.es || s.slug}`}
                  className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-danger/20 bg-admin-danger/10 text-admin-danger transition-colors hover:bg-admin-danger/15"
                >
                  <Trash2 size={15} />
                </button>
              </>
            );
          }}
        />
      )}

      <SkillFormDialog
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
        title="Eliminar skill"
        description={`«${borrando?.name.es || borrando?.slug}» desaparecerá de la sección de habilidades del sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        tone="danger"
        busy={borrando ? ocupados.has(borrando.id) : false}
      />
    </div>
  );
}
