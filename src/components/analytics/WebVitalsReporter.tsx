'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

/**
 * Manda cada Core Web Vital a `/api/analytics/vitals` (T-15), separado por
 * dispositivo según el breakpoint `md` de Tailwind (768px) — no se adivina
 * desde el user-agent, así no hace falta guardar ni parsear esa cabecera.
 * `sendBeacon` es la forma recomendada para esto: las tres métricas suelen
 * reportarse cuando la pestaña se oculta o se cierra, momento en que un
 * `fetch` normal puede cancelarse a medias.
 */
function dispositivoActual(): 'mobile' | 'desktop' {
  return window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile';
}

function enviar(metric: 'LCP' | 'INP' | 'CLS', { value }: Metric) {
  const payload = JSON.stringify({
    path: window.location.pathname,
    device: dispositivoActual(),
    metric,
    value,
  });

  try {
    if (navigator.sendBeacon(
      '/api/analytics/vitals',
      new Blob([payload], { type: 'application/json' }),
    )) {
      return;
    }
  } catch {
    // Sigue con fetch si sendBeacon no está disponible o lanza.
  }

  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    // Una métrica de rendimiento que no se pudo mandar no debe romper nada.
  });
}

export default function WebVitalsReporter() {
  useEffect(() => {
    onLCP((m) => enviar('LCP', m));
    onINP((m) => enviar('INP', m));
    onCLS((m) => enviar('CLS', m));
  }, []);

  return null;
}
