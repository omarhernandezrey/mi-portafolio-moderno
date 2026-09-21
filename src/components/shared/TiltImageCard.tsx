'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion';
import HeroImage from './HeroImage';

interface TiltImageCardProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export default function TiltImageCard({ src, alt, sizes, priority = false, className }: TiltImageCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), springConfig);
  const glowX = useTransform(mouseX, [0, 1], ['0%', '100%']);
  const glowY = useTransform(mouseY, [0, 1], ['0%', '100%']);
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, color-mix(in srgb, var(--primary-color) 25%, transparent), transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative overflow-hidden ${className ?? ''}`}
    >
      <HeroImage src={src} alt={alt} sizes={sizes} priority={priority} />
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: glowBackground }}
        />
      )}
    </motion.div>
  );
}
