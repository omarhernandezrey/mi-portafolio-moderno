/**
 * Helper para construir URLs de Cal.com con auto-detección de zona horaria y autorelleno de datos
 */
export const buildCalcomUrl = (
  baseUrl: string, 
  visitorMeta?: { name?: string; email?: string }
): string => {
  if (!baseUrl) return '';
  
  const url = new URL(baseUrl);
  
  // 1. Auto-detectar zona horaria
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      url.searchParams.set('timezone', tz);
    }
  } catch (error) {
    console.error('Error detecting timezone:', error);
  }

  // 2. Autorelleno de nombre y email si están disponibles
  if (visitorMeta?.name) {
    url.searchParams.set('name', visitorMeta.name);
  }
  if (visitorMeta?.email) {
    url.searchParams.set('email', visitorMeta.email);
  }

  return url.toString();
};
