/**
 * Aviso de que la vista previa de borradores está activa (T-18). Chrome
 * operativo, no parte del lenguaje visual del sitio público — por eso no usa
 * los tokens de marca del portafolio (pensados para contenido, no para un
 * aviso de estado transitorio que solo ve `owner`).
 */
export default function PreviewBanner({ volverA }: { volverA: string }) {
  return (
    <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-sm font-bold text-black">
      <span>Vista previa: se incluyen proyectos sin publicar.</span>
      <a href={`/api/preview/disable?next=${encodeURIComponent(volverA)}`} className="underline underline-offset-2">
        Salir de la vista previa
      </a>
    </div>
  );
}
