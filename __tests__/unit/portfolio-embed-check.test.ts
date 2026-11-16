/**
 * Tests del comprobador de embebido (T-07). Cada caso de la ficha:
 * DENY, SAMEORIGIN, frame-ancestors 'none', sin cabeceras, y error de red
 * (que debe dar "sin comprobar", no "no embebible").
 */
import { comprobarEmbebido } from '@/lib/portfolio/embedCheck';

function respuestaFalsa(cabeceras: Record<string, string>): typeof fetch {
  return (async () => new Response(null, { status: 200, headers: cabeceras })) as unknown as typeof fetch;
}

describe('comprobarEmbebido', () => {
  it('X-Frame-Options: DENY → no embebible', async () => {
    const resultado = await comprobarEmbebido('https://demo.example', respuestaFalsa({ 'x-frame-options': 'DENY' }));
    expect(resultado).toEqual({ demo: 'https://demo.example', resultado: 'no-embebible', motivo: 'X-Frame-Options: DENY' });
  });

  it('X-Frame-Options: SAMEORIGIN → no embebible (el portafolio nunca es el mismo origen)', async () => {
    const resultado = await comprobarEmbebido('https://demo.example', respuestaFalsa({ 'x-frame-options': 'SAMEORIGIN' }));
    expect(resultado.resultado).toBe('no-embebible');
  });

  it("Content-Security-Policy con frame-ancestors 'none' → no embebible", async () => {
    const resultado = await comprobarEmbebido(
      'https://demo.example',
      respuestaFalsa({ 'content-security-policy': "default-src 'self'; frame-ancestors 'none'" }),
    );
    expect(resultado.resultado).toBe('no-embebible');
    expect(resultado.motivo).toContain('frame-ancestors');
  });

  it('frame-ancestors con una lista de orígenes (no "none") no se da por bloqueado aquí', async () => {
    const resultado = await comprobarEmbebido(
      'https://demo.example',
      respuestaFalsa({ 'content-security-policy': "frame-ancestors 'self' https://otro.com" }),
    );
    expect(resultado.resultado).toBe('embebible');
  });

  it('sin ninguna cabecera → embebible', async () => {
    const resultado = await comprobarEmbebido('https://demo.example', respuestaFalsa({}));
    expect(resultado).toEqual({ demo: 'https://demo.example', resultado: 'embebible', motivo: 'sin cabecera que lo bloquee' });
  });

  it('un error de red da "sin comprobar", nunca "no embebible"', async () => {
    const fetchQueFalla = (async () => {
      throw new Error('getaddrinfo ENOTFOUND demo.example');
    }) as unknown as typeof fetch;
    const resultado = await comprobarEmbebido('https://demo.example', fetchQueFalla);
    expect(resultado.resultado).toBe('sin-comprobar');
    expect(resultado.motivo).toContain('ENOTFOUND');
  });

  it('usa el fetch global por defecto si no se le pasa uno', async () => {
    const original = global.fetch;
    global.fetch = respuestaFalsa({ 'x-frame-options': 'deny' });
    try {
      const resultado = await comprobarEmbebido('https://demo.example');
      expect(resultado.resultado).toBe('no-embebible');
    } finally {
      global.fetch = original;
    }
  });
});
