"use client";

const MAX_VISIBLE = 5;

/**
 * Una celda del mosaico. Vive FUERA de `FeedImageGrid` a propósito: definida
 * dentro, React la trataba como un componente nuevo en cada render y
 * desmontaba/remontaba las `<img>` al repintar el feed (perdiendo la carga
 * ya hecha). `alt` y `total` llegan por props en vez de por cierre.
 */
function Tile({
  src,
  index,
  total,
  alt,
  overlay,
}: {
  src: string;
  index: number;
  total: number;
  alt: string;
  overlay?: number;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${alt} (${index + 1}/${total})`} loading="lazy" className="w-full h-full object-cover" />
      {overlay ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          +{overlay}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Mosaico estilo Facebook: 1 imagen se ve completa (sin recorte, útil para
 * certificados); 2+ imágenes arman un grid que sí recorta con object-cover
 * (igual que Facebook) y la última celda visible muestra "+N" si hay más
 * fotos de las que caben en el mosaico.
 */
export default function FeedImageGrid({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden my-3 border flex justify-center"
        style={{
          borderColor: "color-mix(in srgb, var(--muted-color) 15%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--muted-color) 6%, transparent)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt={alt} loading="lazy" className="w-full h-auto max-h-[80vh] object-contain" />
      </div>
    );
  }

  const visible = images.slice(0, MAX_VISIBLE);
  const extraCount = images.length - visible.length;

  const borderColor = "color-mix(in srgb, var(--muted-color) 15%, transparent)";


  if (visible.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden my-3 border aspect-[16/9]" style={{ borderColor }}>
        <Tile total={images.length} alt={alt} src={visible[0]} index={0} />
        <Tile total={images.length} alt={alt} src={visible[1]} index={1} overlay={extraCount || undefined} />
      </div>
    );
  }

  if (visible.length === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden my-3 border aspect-[4/3]" style={{ borderColor }}>
        <div className="row-span-2">
          <Tile total={images.length} alt={alt} src={visible[0]} index={0} />
        </div>
        <Tile total={images.length} alt={alt} src={visible[1]} index={1} />
        <Tile total={images.length} alt={alt} src={visible[2]} index={2} overlay={extraCount || undefined} />
      </div>
    );
  }

  if (visible.length === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden my-3 border aspect-square" style={{ borderColor }}>
        <Tile total={images.length} alt={alt} src={visible[0]} index={0} />
        <Tile total={images.length} alt={alt} src={visible[1]} index={1} />
        <Tile total={images.length} alt={alt} src={visible[2]} index={2} />
        <Tile total={images.length} alt={alt} src={visible[3]} index={3} overlay={extraCount || undefined} />
      </div>
    );
  }

  // 5 o más: 2 grandes a la izquierda apiladas + 3 en grid a la derecha (última con "+N").
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden my-3 border aspect-[4/3]" style={{ borderColor }}>
      <div className="grid grid-rows-2 gap-1 h-full">
        <Tile total={images.length} alt={alt} src={visible[0]} index={0} />
        <Tile total={images.length} alt={alt} src={visible[1]} index={1} />
      </div>
      <div className="grid grid-rows-3 gap-1 h-full">
        <Tile total={images.length} alt={alt} src={visible[2]} index={2} />
        <Tile total={images.length} alt={alt} src={visible[3]} index={3} />
        <Tile total={images.length} alt={alt} src={visible[4]} index={4} overlay={extraCount || undefined} />
      </div>
    </div>
  );
}
