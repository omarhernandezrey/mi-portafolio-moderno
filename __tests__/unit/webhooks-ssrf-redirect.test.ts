/**
 * SSRF por redirección en los webhooks salientes.
 *
 * Defecto real encontrado en la auditoría de backend. `assertSafeWebhookUrl`
 * resuelve el DNS y valida la IP del destino ANTES de salir, y lo hace bien
 * (loopback, 10/8, 172.16/12, 192.168/16, 169.254, IPv6…). Pero el valor por
 * omisión de `fetch` es `redirect: 'follow'`: un destino que pasa el guard
 * porque su IP es pública podía responder
 * `302 Location: http://169.254.169.254/latest/meta-data/...` y `fetch`
 * saltaba a la metadata de la nube desde dentro de la función, con el guard
 * ya superado. En la ruta de prueba, además, el cuerpo de ESA respuesta se
 * guardaba en `webhook_logs.response_body` y quedaba legible desde el panel.
 *
 * Estos tests fijan la propiedad que lo impide: el `fetch` de los dos
 * emisores NO sigue redirecciones.
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const mockAssertSafe = jest.fn();
jest.mock('@/lib/webhooks/ssrf', () => ({
  assertSafeWebhookUrl: (...args: unknown[]) => mockAssertSafe(...args),
}));

import { dispatchEvent } from '@/lib/events/dispatcher';

const WEBHOOK = {
  id: 'w1',
  url: 'https://destino-que-parece-legitimo.example',
  secret: 's3cr3t',
  active: true,
  events: ['lead.created'],
};

/** `.from('webhooks')` devuelve el webhook; `.from('webhook_logs')` traga el insert. */
function supabaseConUnWebhook() {
  mockFrom.mockImplementation((tabla: string) => {
    if (tabla === 'webhooks') {
      return {
        select: () => ({
          eq: () => ({
            contains: async () => ({ data: [WEBHOOK], error: null }),
          }),
        }),
      };
    }
    return { insert: async () => ({ error: null }) };
  });
}

let fetchSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  supabaseConUnWebhook();
  mockAssertSafe.mockResolvedValue({ ok: true });
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response('ok', { status: 200 })
  );
});

afterEach(() => {
  fetchSpy.mockRestore();
  errorSpy.mockRestore();
});

describe('dispatcher de webhooks', () => {
  it('no sigue redirecciones: el guard de IP no se puede evadir con un 302', async () => {
    await dispatchEvent('lead.created', { id: 'lead1' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const opciones = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(opciones.redirect).toBe('manual');
  });

  it('sigue validando el destino antes de salir', async () => {
    await dispatchEvent('lead.created', { id: 'lead1' });
    expect(mockAssertSafe).toHaveBeenCalledWith(WEBHOOK.url);
  });

  it('si el destino está bloqueado, no hay petición', async () => {
    mockAssertSafe.mockResolvedValue({ ok: false, error: 'IP privada' });
    await dispatchEvent('lead.created', { id: 'lead1' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mantiene el timeout junto con la nueva opción', async () => {
    await dispatchEvent('lead.created', { id: 'lead1' });
    const opciones = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(opciones.signal).toBeDefined();
  });
});
