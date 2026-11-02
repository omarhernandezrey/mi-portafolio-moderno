import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../locales/${locale}/common.json`)).default;

  return {
    locale,
    // Sin esto, next-intl no puede formatear fechas/horas de forma
    // determinista entre servidor y cliente y emite ENVIRONMENT_FALLBACK
    // (ruido en los logs de Vercel, aunque no rompe el render).
    timeZone: 'America/Bogota',
    messages: { common },
  };
});
