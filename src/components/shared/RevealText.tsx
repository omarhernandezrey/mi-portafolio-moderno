'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface RevealTextProps {
  text: string;
  className?: string;
}

export default function RevealText({ text, className }: RevealTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const wordEls = containerRef.current?.querySelectorAll<HTMLElement>('[data-word]');
        if (!wordEls?.length) return;

        gsap.set(wordEls, { opacity: 0.15, filter: 'blur(4px)' });
        gsap.to(wordEls, {
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className="inline-block">
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
