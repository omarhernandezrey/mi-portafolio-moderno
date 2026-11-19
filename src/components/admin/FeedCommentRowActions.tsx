"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { useAdminToast } from "@/hooks/useAdminToast";
import { adminFetch } from "@/lib/admin/client-fetch";
import { ConfirmDialog } from "@/components/admin/ui";

export default function FeedCommentRowActions({
  commentId,
  status,
  canWrite,
  canDelete,
}: {
  commentId: string;
  status: "published" | "hidden";
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const router = useRouter();
  const toast = useAdminToast();

  const toggleStatus = async () => {
    setLoading("status");
    try {
      await adminFetch(`/api/admin/feed/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: status === "published" ? "hidden" : "published" }),
      });
      toast.success(status === "published" ? "Comentario ocultado" : "Comentario restaurado");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      await adminFetch(`/api/admin/feed/comments/${commentId}`, { method: "DELETE" });
      toast.success("Comentario eliminado");
      setConfirmando(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setLoading(null);
    }
  };

  if (!canWrite) {
    return <span className="text-3xs text-text-muted/40 font-black uppercase tracking-widest">Solo lectura</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={toggleStatus}
        disabled={loading !== null}
        title={status === "published" ? "Ocultar" : "Publicar"}
        className="w-9 h-9 rounded-lg p-0 bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white-custom hover:border-primary/30 transition-all disabled:opacity-50"
      >
        {loading === "status" ? <Loader2 size={14} className="animate-spin" /> : status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>

      {canDelete && (
        <button
          onClick={() => setConfirmando(true)}
          disabled={loading !== null}
          title="Eliminar"
          className="w-9 h-9 rounded-lg p-0 bg-white/5 border border-white/10 flex items-center justify-center text-admin-danger hover:bg-admin-danger/10 hover:border-admin-danger/30 transition-all disabled:opacity-50"
        >
          {loading === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      )}

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={handleDelete}
        title="Eliminar comentario"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        busy={loading === "delete"}
      />
    </div>
  );
}
