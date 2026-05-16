"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

interface NotyfContextType {
  notyf: Notyf | null;
}

const NotyfContext = createContext<NotyfContextType>({ notyf: null });

export function useNotyf() {
  const ctx = useContext(NotyfContext);
  if (!ctx.notyf) {
    throw new Error("useNotyf must be used within NotyfProvider");
  }
  return ctx.notyf;
}

export function NotyfProvider({ children }: { children: ReactNode }) {
  const [notyf, setNotyf] = useState<Notyf | null>(null);

  useEffect(() => {
    const instance = new Notyf({
      duration: 4000,
      ripple: true,
      position: { x: "right", y: "top" },
      dismissible: true,
    });
    setNotyf(instance);
    return () => {
      instance.dismissAll();
    };
  }, []);

  return (
    <NotyfContext.Provider value={{ notyf }}>
      {children}
    </NotyfContext.Provider>
  );
}
