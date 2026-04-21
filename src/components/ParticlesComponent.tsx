"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

export default function ParticlesComponent() {
  const [init, setInit] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [logosReady, setLogosReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);

      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
      const lowRam = (nav.deviceMemory ?? 8) <= 4;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsLowPowerDevice(lowCpu || lowRam || isMobile);
    }

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
      "/images/logos/react-js.svg",
      "/images/logos/next-js.svg",
      "/images/logos/typescript.svg",
      "/images/logos/javascript.svg",
      "/images/logos/nodejs.svg",
      "/images/logos/tailwind-css.svg",
      "/images/logos/postgresql.svg",
      "/images/logos/docker.svg",
    ];

    let loadedCount = 0;
    const targetCount = logoList.length;

    logoList.forEach((src) => {
      const img = new Image();
      const done = () => {
        loadedCount++;
        if (loadedCount === targetCount) setLogosReady(true);
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });

    return logoList;
  }, [isClient]);

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

  const particleCount = isLowPowerDevice ? 4 : 6;

  const manualParticles = useMemo(() => {
    if (!logosReady || logos.length === 0) return [];

    return logos.slice(0, particleCount).map((logo, index) => ({
      position: {
        x: 15 + (index % 4) * 20 + Math.random() * 10,
        y: 20 + Math.floor(index / 4) * 30 + Math.random() * 10,
      },
      options: {
        shape: {
          type: "image",
          options: {
            image: {
              src: logo,
              width: 32,
              height: 32,
            },
          },
        },
        opacity: { value: 0.75 },
      },
    }));
  }, [logos, logosReady, particleCount]);

  const options: ISourceOptions = useMemo(() => {
    if (!logosReady) return {};

    const colors = getThemeColors();

    return {
      detectRetina: false,
      fpsLimit: isLowPowerDevice ? 24 : 30,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      particles: {
        number: { value: 0 },
        size: { value: 6 },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
        },
        collisions: { enable: false },
        links: {
          enable: !isLowPowerDevice,
          distance: 110,
          color: colors.text,
          opacity: 0.3,
          width: 1,
          triangles: { enable: false },
        },
        shape: {
          type: "image",
          options: {
            image: logos.slice(0, particleCount).map((src) => ({
              src,
              width: 32,
              height: 32,
            })),
          },
        },
        opacity: { value: 0.75 },
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: { enable: true, delay: 0.5 },
        },
      },
      manualParticles,
      fullScreen: { enable: false },
      background: { opacity: 0 },
      style: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        zIndex: "-1",
      },
    };
  }, [logos, manualParticles, logosReady, getThemeColors, isLowPowerDevice, particleCount]);

  if (prefersReducedMotion || !init || !logosReady || !isClient) {
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
