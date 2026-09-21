'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface HeroParallaxProps {
  children: ReactNode;
  className?: string;
}

export default function HeroParallax({ children, className }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const layers = containerRef.current?.querySelectorAll<HTMLElement>('[data-parallax-speed]');
        layers?.forEach((layer) => {
          const speed = parseFloat(layer.dataset.parallaxSpeed || '0.3');
          gsap.to(layer, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
