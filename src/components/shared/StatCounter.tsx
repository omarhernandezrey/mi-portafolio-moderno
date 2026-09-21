'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function StatCounter({ value, prefix = '', suffix = '', label, duration = 1.4 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotionSafe();
  // Arranca en 0 siempre (igual que el SSR) — nunca en `value`, aunque
  // shouldReduceMotion ya sea true, para no desajustar la hidratación.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) setDisplay(value);
      return;
    }

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-black text-primary italic">
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="text-xs text-text-muted/60 font-medium mt-1">{label}</div>
    </div>
  );
}
