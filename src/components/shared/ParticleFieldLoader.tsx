'use client';

import dynamic from 'next/dynamic';

// `ssr: false` solo se puede usar dentro de un Client Component — este
// wrapper existe únicamente para que page.tsx (Server Component) pueda
// cargar el Canvas WebGL sin intentar renderizarlo en el servidor.
const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
});

export default ParticleField;
