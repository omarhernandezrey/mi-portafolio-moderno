'use client';

import { useState } from 'react';
import Image from 'next/image';

// Degradado local con los colores de marca — se usa si la imagen de
// Unsplash falla en cargar (foto retirada, red, etc.) para que la página
// nunca quede con un hueco visual.
const FALLBACK_SRC = '/images/hero-fallback.svg';

interface HeroImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export default function HeroImage({ src, alt, sizes, priority = false, className }: HeroImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const isFallback = currentSrc === FALLBACK_SRC;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isFallback}
      className={`object-cover ${className ?? ''}`}
      onError={() => setCurrentSrc(FALLBACK_SRC)}
    />
  );
}
