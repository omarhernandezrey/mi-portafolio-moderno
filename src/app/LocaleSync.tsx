"use client";

import { usePathname } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import esCommon from "@/locales/es/common.json";
import enCommon from "@/locales/en/common.json";

const MESSAGES = {
  es: { common: esCommon },
  en: { common: enCommon },
} as const;

/**
 * El root layout es un Server Component que no se vuelve a ejecutar en
 * navegaciones client-side dentro del mismo árbol de layouts — así que un
 * <NextIntlClientProvider locale={...}> puesto ahí queda "congelado" con el
 * locale de la carga inicial. Tras cambiar de idioma con el selector (client
 * router.replace), toda la UI que depende de next-intl (navbar, selector,
 * textos vía t()) se queda mostrando el idioma viejo hasta un refresh — y si
 * el usuario vuelve a hacer click pensando que no cambió, el locale comparado
 * internamente queda desincronizado del de la URL.
 *
 * usePathname() de next/navigation sí se actualiza en cada navegación (es lo
 * que el App Router usa para notificar cambios de ruta a los componentes
 * cliente), así que derivamos el locale ahí mismo en vez de depender de que
 * el layout se re-renderice.
 */
export default function LocaleSync({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "es";

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
