"use client";

import { useI18n } from "@/contexts/I18nContext";

/**
 * Wrapper sobre I18nContext (next-intl) para mantener la misma API que
 * consumen los componentes: t(key, options), language, isHydrated, isReady.
 */
export const useTranslation = () => {
  const { t, isHydrated, language, isReady } = useI18n();

  return {
    t,
    isHydrated,
    language,
    isReady,
  };
};
