"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

export default function ParticlesComponent() {
  const [init, setInit] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [logosReady, setLogosReady] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const initParticlesEngine = async (engine: Engine) => {
      try {
        await loadFull(engine);
        setInit(true);
      } catch (error) {
        console.error("Error al inicializar el motor de partículas:", error);
      }
    };

    if (typeof window !== "undefined" && window.tsParticles) {
      initParticlesEngine(window.tsParticles);
    } else {
      import("tsparticles")
        .then(async (mod: unknown) => {
          const engine: Engine =
            (mod as { tsParticles?: Engine; default?: Engine })?.tsParticles ||
            (mod as { default?: Engine })?.default ||
            (mod as Engine);
          await initParticlesEngine(engine);
        })
        .catch(console.error);
    }
  }, []);

  const logos = useMemo(() => {
    if (!isClient) return [];

    const logoList = [
      "/images/logos/angular.svg",
      "/images/logos/css.svg",
      "/images/logos/django.svg",
      "/images/logos/docker.svg",
      "/images/logos/express-js.svg",
      "/images/logos/figma.svg",
      "/images/logos/firebase.svg",
      "/images/logos/git.svg",
      "/images/logos/github.svg",
      "/images/logos/html.svg",
      "/images/logos/javascript.svg",
      "/images/logos/jenkins.svg",
      "/images/logos/mongodb.svg",
      "/images/logos/mysql.svg",
      "/images/logos/next-js.svg",
      "/images/logos/nodejs.svg",
      "/images/logos/postgresql.svg",
      "/images/logos/react-js.svg",
      "/images/logos/svelte.svg",
      "/images/logos/tailwind-css.svg",
      "/images/logos/typescript.svg",
      "/images/logos/vite.svg",
      "/images/logos/vue-js.svg",
    ];

    // Precargar imágenes y verificar disponibilidad
    let loadedCount = 0;
    const targetCount = logoList.length;

    logoList.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === targetCount) {
          setLogosReady(true);
        }
      };
      img.onerror = () => {
        console.warn(`Logo no disponible: ${src}`);
        loadedCount++;
        if (loadedCount === targetCount) {
          setLogosReady(true);
        }
      };
      img.src = src;
    });

    return logoList;
  }, [isClient]);

  // Obtener colores CSS dinámicamente
  const getThemeColors = useCallback(() => {
    if (typeof window === "undefined")
      return {
        primary: "#00cba9",
        accent: "#00a086",
        text: "#d1d5db",
      };

    const computedStyle = getComputedStyle(document.documentElement);
    return {
      primary:
        computedStyle.getPropertyValue("--primary-color").trim() || "#00cba9",
      accent:
        computedStyle.getPropertyValue("--accent-color").trim() || "#00a086",
      text: computedStyle.getPropertyValue("--text-color").trim() || "#d1d5db",
    };
  }, []);

  const manualParticles = useMemo(() => {
    if (!logosReady || logos.length === 0) return [];

    return logos.slice(0, 12).map((logo, index) => ({
      position: {
        x: 15 + (index % 4) * 20 + Math.random() * 10,
        y: 15 + Math.floor(index / 4) * 25 + Math.random() * 10,
      },
      options: {
        shape: {
          type: "image",
          options: {
            image: {
              src: logo,
              width: 35,
              height: 35,
            },
          },
        },
        opacity: {
          value: 0.8,
        },
      },
    }));
  }, [logos, logosReady]);

  const options: ISourceOptions = useMemo(() => {
    if (!logosReady) return {};

    const colors = getThemeColors();

    return {
      detectRetina: true,
      fpsLimit: 60, // Reducido para mejor rendimiento
      particles: {
        number: { value: 0 },
        size: {
          value: { min: 4, max: 8 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 4,
            sync: false,
          },
        },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "bounce",
            top: "none",
            bottom: "destroy",
          },
        },
        collisions: {
          enable: true,
          mode: "bounce",
        },
        links: {
          enable: true,
          distance: 120,
          color: colors.text,
          opacity: 0.4,
          width: 1,
          triangles: {
            enable: true,
            color: colors.primary,
            opacity: 0.1,
          },
        },
        shape: {
          type: "image",
          options: {
            image: logos.map((src) => ({
              src,
              width: 35,
              height: 35,
            })),
          },
        },
        opacity: {
          value: { min: 0.6, max: 0.9 },
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.4,
            sync: false,
          },
        },
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: true,
            mode: ["repulse", "bubble"],
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: {
            enable: true,
            delay: 0.5,
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
            factor: 3,
            speed: 2,
          },
          bubble: {
            distance: 150,
            size: 45,
            duration: 2,
            opacity: 1,
            color: colors.primary,
          },
          push: {
            quantity: 1,
          },
        },
      },
      manualParticles,
      fullScreen: {
        enable: false,
      },
      background: {
        opacity: 0,
      },
      style: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        zIndex: "-1",
      },
      responsive: [
        {
          maxWidth: 768,
          options: {
            particles: {
              links: {
                distance: 80,
                opacity: 0.3,
              },
              size: {
                value: { min: 3, max: 6 },
              },
            },
            interactivity: {
              modes: {
                repulse: {
                  distance: 80,
                },
              },
            },
          },
        },
      ],
    };
  }, [logos, manualParticles, logosReady, getThemeColors]);

  // Render condicional mejorado
  if (!init || !logosReady || !isClient) {
    return (
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--primary-color) 0%, transparent 70%)`,
        }}
      />
    );
  }

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="absolute inset-0 w-full h-full"
    />
  );
}
