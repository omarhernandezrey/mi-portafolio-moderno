import React from 'react';

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/**
 * Componente para inyectar datos estructurados (Schema.org) en formato JSON-LD.
 * Se debe usar dentro de etiquetas <head> o al inicio de páginas.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
