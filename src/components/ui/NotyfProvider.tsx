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
    const noop = () => ({});
    return { success: noop, error: noop, open: noop, dismissAll: noop } as unknown as Notyf;
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
      types: [
        {
          type: "warning",
          background: "#f59e0b",
          icon: { className: "notyf__icon--warning", tagName: "i", text: "⚠" },
        },
        {
          type: "info",
          background: "#3b82f6",
          icon: { className: "notyf__icon--info", tagName: "i", text: "ℹ" },
        },
      ],
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
