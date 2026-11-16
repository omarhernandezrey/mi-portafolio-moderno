/**
 * Tests de `src/lib/rateLimit.ts` (T-19 es su primer uso sensible a
 * seguridad: limitar el login). No tenía tests propios todavía.
 */
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

describe('checkRateLimit', () => {
  it('permite hasta el límite y bloquea el intento N+1', () => {
    const clave = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(clave, 3, 60_000).allowed).toBe(true);
    }
    expect(checkRateLimit(clave, 3, 60_000).allowed).toBe(false);
  });

  it('se libera al pasar la ventana', () => {
    const clave = `test:${Math.random()}`;
    const real = Date.now;
    let ahora = 1_000_000;
    Date.now = () => ahora;
    try {
      expect(checkRateLimit(clave, 1, 1000).allowed).toBe(true);
      expect(checkRateLimit(clave, 1, 1000).allowed).toBe(false);
      ahora += 1001; // pasó la ventana
      expect(checkRateLimit(clave, 1, 1000).allowed).toBe(true);
    } finally {
      Date.now = real;
    }
  });

  it('claves distintas no se pisan entre sí', () => {
    const a = `test:a:${Math.random()}`;
    const b = `test:b:${Math.random()}`;
    expect(checkRateLimit(a, 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(a, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 1, 60_000).allowed).toBe(true);
  });
});

describe('clientIp', () => {
  it('prefiere x-real-ip', () => {
    const h = new Headers({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' });
    expect(clientIp(h)).toBe('1.2.3.4');
  });

  it('sin x-real-ip, usa el último tramo de x-forwarded-for (el más cercano al proxy de confianza)', () => {
    const h = new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1, 1.2.3.4' });
    expect(clientIp(h)).toBe('1.2.3.4');
  });

  it('sin ninguna cabecera: "anonymous", no revienta', () => {
    expect(clientIp(new Headers())).toBe('anonymous');
  });
});
