"use client";

import React, { useRef, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas, extend, useFrame, useThree, primitive } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import styles from "./Lanyard.module.css";

// Registrar geometrías y materiales de MeshLine
extend({ MeshLineGeometry, MeshLineMaterial });

// Tipos para TypeScript
interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isReady: boolean;
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  className?: string;
}

// Declaraciones para elementos JSX personalizados
import { MeshProps, MeshPhysicalMaterialProps, GroupProps } from "@react-three/fiber";
import { Mesh } from "three";

// Extiende JSX.IntrinsicElements para incluir meshLineGeometry, meshLineMaterial, mesh, meshPhysicalMaterial, ambientLight
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
      mesh: any;
      meshPhysicalMaterial: any;
      ambientLight: any;
    }
  }
}

// Componente de error
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorContainer}>
      <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 className={styles.errorTitle}>Error al cargar el modelo 3D</h3>
      <p className={styles.errorMessage}>
        No se pudo cargar el carnet 3D. Verifica que los archivos del modelo estén disponibles.
      </p>
      <button onClick={onRetry} className={styles.retryButton}>
        Reintentar
      </button>
    </div>
  );
}

// Custom ErrorBoundary component
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; onError?: (error: Error, info: React.ErrorInfo) => void; children?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Componente de carga
function LoadingFallback() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>Cargando carnet 3D...</p>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isReady, setIsReady }: BandProps) {
  // Referencias a los cuerpos rígidos
  const band = useRef<THREE.Mesh>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  // Vectores para cálculos
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  // Propiedades comunes para los segmentos
  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  // Cargar modelo 3D y textura con manejo de errores
  let nodes: any, materials: any, texture: any;
  
  try {
    const gltf = useGLTF("/lanyard/card.glb");
    nodes = gltf.nodes;
    materials = gltf.materials;
    texture = useTexture("/lanyard/lanyard.png");
  } catch (error) {
    console.error("Error cargando recursos 3D:", error);
    throw error;
  }

  // Curva para la cinta
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  // Estado de interacción
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  // Configurar textura
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      setIsReady(true);
    }
  }, [texture, setIsReady]);

  // Efectos de cursor
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  // Crear uniones entre cuerpos rígidos
  useEffect(() => {
    if (!isReady) return;

    const createJoints = () => {
      try {
        if (fixed.current && j1.current) {
          fixed.current.attach?.(j1.current, { restLength: 1 });
        }
        if (j1.current && j2.current) {
          j1.current.attach?.(j2.current, { restLength: 1 });
        }
        if (j2.current && j3.current) {
          j2.current.attach?.(j3.current, { restLength: 1 });
        }
        if (j3.current && card.current) {
          j3.current.attach?.(card.current, { 
            restLength: 1.45, 
            stiffness: 100, 
            damping: 4 
          });
        }
      } catch (error) {
        console.warn("Error creando uniones físicas:", error);
      }
    };

    const timer = setTimeout(createJoints, 100);
    return () => clearTimeout(timer);
  }, [isReady]);

  // Animación principal
  useFrame((state, delta) => {
    if (!isReady) return;

    try {
      // Manejo del arrastre
      if (dragged && typeof dragged !== "boolean" && card.current) {
        vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
        dir.copy(vec).sub(state.camera.position).normalize();
        vec.add(dir.multiplyScalar(state.camera.position.length()));

        // Despertar todos los cuerpos
        [card, j1, j2, j3, fixed].forEach((ref) => {
          try {
            ref.current?.wakeUp?.();
          } catch (error) {
            // Ignorar errores de wakeUp
          }
        });

        // Mover la tarjeta
        try {
          card.current?.setNextKinematicTranslation?.({
            x: vec.x - dragged.x,
            y: vec.y - dragged.y,
            z: vec.z - dragged.z,
          });
        } catch (error) {
          // Ignorar errores de movimiento
        }
      }

      // Actualizar la curva de la cinta
      if (fixed.current && j1.current && j2.current && j3.current && band.current) {
        try {
          // Interpolar posiciones para suavidad
          [j1, j2].forEach((ref) => {
            if (ref.current) {
              if (!ref.current.lerped) {
                ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
              }
              const clampedDistance = Math.max(
                0.1,
                Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
              );
              ref.current.lerped.lerp(
                ref.current.translation(),
                delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
              );
            }
          });

          // Actualizar puntos de la curva
          curve.points[0].copy(j3.current.translation());
          curve.points[1].copy(j2.current.lerped);
          curve.points[2].copy(j1.current.lerped);
          curve.points[3].copy(fixed.current.translation());

          // Generar geometría de la cinta
          if ((band.current.geometry as any)?.setPoints) {
            (band.current.geometry as any).setPoints(curve.getPoints(32));
          }

          // Aplicar física a la tarjeta
          if (card.current) {
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel?.({ 
              x: ang.x, 
              y: ang.y - rot.y * 0.25, 
              z: ang.z 
            });
          }
        } catch (error) {
          // Ignorar errores de animación para mantener la aplicación estable
        }
      }
    } catch (error) {
      console.warn("Error en animación del frame:", error);
    }
  });

  curve.curveType = "chordal";

  if (!isReady) {
    return null;
  }

  return (
    <>
      {/* Segmentos físicos de la cuerda */}
      {/* Punto fijo */}
      <RigidBody ref={fixed} {...segmentProps} type="fixed" />
      
      {/* Segmentos de la cuerda */}
      <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      
      <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      
      <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>

      {/* Tarjeta */}
      <RigidBody
        ref={card}
        position={[2, 0, 0]}
        {...segmentProps}
        type={dragged ? "kinematicPosition" : "dynamic"}
      >
        <CuboidCollider args={[0.8, 1.125, 0.01]} />
        <group
          scale={2.25}
          position={[0, -1.2, -0.05]}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerUp={(e: any) => {
            try {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            } catch (error) {
              drag(false);
            }
          }}
          onPointerDown={(e: any) => {
            try {
              e.target.setPointerCapture(e.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current?.translation() || new THREE.Vector3()))
              );
            } catch (error) {
              console.warn("Error en interacción pointer:", error);
            }
          }}
        >
          {/* Tarjeta principal */}
          {nodes?.card && (
            <mesh
              geometry={nodes.card.geometry}
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
            >
              <meshPhysicalMaterial
                map={materials?.base?.map}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
          )}

          {/* Clip metálico */}
          {nodes?.clip && (
            <mesh
              geometry={nodes.clip.geometry}
              material={materials?.metal}
              material-roughness={0.3}
            />
          )}

          {/* Abrazadera */}
          {nodes?.clamp && (
            <mesh geometry={nodes.clamp.geometry} material={materials?.metal} />
          )}
        </group>
      </RigidBody>

      {/* Cinta con MeshLine */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[1000, 1000]}
          useMap={true}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  className = "",
}: LanyardProps) {
  // Estado para controlar la carga y errores
  const [isReady, setIsReady] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Handlers para el ErrorBoundary
  const handleRetry = useCallback(() => {
    setError(null);
    setRetryKey((k) => k + 1);
    setIsReady(false);
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsReady(false);
  }, []);

  return (
    <div className={`${styles.lanyardWrapper} ${className}`}>
      <ErrorBoundary
        fallback={<ErrorFallback onRetry={handleRetry} />}
        onError={handleError}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            key={retryKey}
            camera={{ position, fov }}
            gl={{
              alpha: transparent,
              antialias: true,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }}
            className={styles.lanyardCanvas}
            dpr={[1, 2]}
          >
            {/* Iluminación ambiental */}
            <ambientLight intensity={Math.PI} />

            {/* Física */}
            <Physics gravity={gravity} timeStep={1 / 60}>
              <Band isReady={isReady} setIsReady={setIsReady} />
            </Physics>

            {/* Entorno de iluminación */}
            <Environment blur={0.75}>
              <Lightformer
                intensity={2}
                color="white"
                position={[0, -1, 5]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={3}
                color="white"
                position={[-1, -1, 1]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={3}
                color="white"
                position={[1, 1, 1]}
                rotation={[0, 0, Math.PI / 3]}
                scale={[100, 0.1, 1]}
              />
              <Lightformer
                intensity={10}
                color="white"
                position={[-10, 0, 14]}
                rotation={[0, Math.PI / 2, Math.PI / 3]}
                scale={[100, 10, 1]}
              />
            </Environment>
          </Canvas>
        </Suspense>
      </ErrorBoundary>

      {/* Instrucciones de uso */}
      <div className={styles.instructionsContainer}>
        🖱️ Arrastra la tarjeta para interactuar
      </div>
    </div>
  );
}