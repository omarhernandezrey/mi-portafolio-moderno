'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

function GsapLenisSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const instance = lenis;

    function raf(time: number) {
      instance.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(raf);
      instance.off('scroll', onScroll);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  // Nadie que pidió "menos movimiento" quiere que le suavicemos el scroll
  // igual — con reduced-motion el scroll se queda 100% nativo/instantáneo.
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, autoRaf: false }}>
      <GsapLenisSync />
      {children}
    </ReactLenis>
  );
}
