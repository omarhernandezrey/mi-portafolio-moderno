'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

const PARTICLE_COUNT = 120;
const CONNECT_DISTANCE = 1.8;
const FIELD_SIZE = 8;
// El cálculo de conexiones es O(n²) — no hace falta rehacerlo cada frame,
// las partículas se mueven despacio, así que un frame de cada 3 es imperceptible
// y le ahorra bastante CPU al hilo principal en móvil.
const CONNECT_EVERY_N_FRAMES = 3;

function Constellation() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const frameCount = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_SIZE;
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_SIZE * 0.5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    return { positions, velocities };
  }, []);

  // Buffer de líneas dimensionado al peor caso (cada punto conectado a todos
  // los demás) — solo se escriben las primeras `lineCount * 2 * 3` entradas
  // cada frame, vía `setDrawRange`, así que el resto queda sin usar sin costo.
  const maxLines = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2;
  const linePositions = useMemo(() => new Float32Array(maxLines * 2 * 3), [maxLines]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    const lines = linesRef.current;
    if (!points || !lines) return;

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      arr[ix] += velocities[ix] * delta * 10;
      arr[ix + 1] += velocities[ix + 1] * delta * 10;
      arr[ix + 2] += velocities[ix + 2] * delta * 10;

      if (Math.abs(arr[ix]) > FIELD_SIZE / 2) velocities[ix] *= -1;
      if (Math.abs(arr[ix + 1]) > (FIELD_SIZE * 0.6) / 2) velocities[ix + 1] *= -1;
      if (Math.abs(arr[ix + 2]) > (FIELD_SIZE * 0.5) / 2) velocities[ix + 2] *= -1;
    }
    posAttr.needsUpdate = true;

    frameCount.current++;
    if (frameCount.current % CONNECT_EVERY_N_FRAMES !== 0) return;

    let lineCount = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const jx = j * 3;
        const dx = arr[ix] - arr[jx];
        const dy = arr[ix + 1] - arr[jx + 1];
        const dz = arr[ix + 2] - arr[jx + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DISTANCE) {
          const li = lineCount * 6;
          linePositions[li] = arr[ix];
          linePositions[li + 1] = arr[ix + 1];
          linePositions[li + 2] = arr[ix + 2];
          linePositions[li + 3] = arr[jx];
          linePositions[li + 4] = arr[jx + 1];
          linePositions[li + 5] = arr[jx + 2];
          lineCount++;
        }
      }
    }
    const lineAttr = lines.geometry.attributes.position as THREE.BufferAttribute;
    lineAttr.needsUpdate = true;
    lines.geometry.setDrawRange(0, lineCount * 2);
  });

  return (
    <group rotation={[0, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#00cba9"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.75}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00cba9" transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
}

export default function ParticleField({ className }: { className?: string }) {
  // Este componente ya se carga solo en cliente (dynamic ssr:false), así
  // que no hay riesgo de hidratación aquí — simplemente no montamos el
  // Canvas si el usuario prefiere menos movimiento; queda el fondo CSS
  // (bg-tech-grid) estático como respaldo.
  const shouldReduceMotion = useReducedMotionSafe();
  if (shouldReduceMotion) return null;

  return (
    <div className={`pointer-events-none ${className ?? ''}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Constellation />
      </Canvas>
    </div>
  );
}
