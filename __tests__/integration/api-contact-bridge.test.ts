/**
 * `POST /api/contact/bridge` (T-25): valida con zod antes de llegar a
 * `registerContactFormLead` — por eso la carga inválida se prueba aquí, al
 * nivel de la ruta, no en `contactBridge.test.ts`.
 */
const mockRegisterContactFormLead = jest.fn();
jest.mock('@/lib/chatbot/contactBridge', () => ({
  registerContactFormLead: (...args: unknown[]) => mockRegisterContactFormLead(...args),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/bridge/route';

function req(body: unknown, ip = '10.2.0.1') {
  return new NextRequest('http://localhost/api/contact/bridge', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify(body),
  });
}

const VALIDO = { name: 'Ana', email: 'ana@test.com', message: 'Necesito una web' };

beforeEach(() => {
  mockRegisterContactFormLead.mockReset();
  mockRegisterContactFormLead.mockResolvedValue({ success: true });
});

describe('POST /api/contact/bridge', () => {
  it('carga útil válida: 200, llama a registerContactFormLead', async () => {
    const res = await POST(req(VALIDO, '10.2.0.2'));
    expect(res.status).toBe(200);
    expect(mockRegisterContactFormLead).toHaveBeenCalledWith(expect.objectContaining(VALIDO));
  });

  it.each([
    ['sin nombre', { ...VALIDO, name: undefined }],
    ['correo inválido', { ...VALIDO, email: 'no-es-un-correo' }],
    ['mensaje vacío', { ...VALIDO, message: '' }],
  ])('carga inválida (%s) → 400, no crea nada', async (_caso, carga) => {
    const res = await POST(req(carga, '10.2.0.3'));
    expect(res.status).toBe(400);
    expect(mockRegisterContactFormLead).not.toHaveBeenCalled();
  });

  it('si el bridge falla (lead no se pudo guardar): 500, no finge éxito', async () => {
    mockRegisterContactFormLead.mockResolvedValue({ success: false, error: 'boom' });
    const res = await POST(req(VALIDO, '10.2.0.4'));
    expect(res.status).toBe(500);
  });

  it('la petición 6 desde la misma IP en una hora se bloquea con 429', async () => {
    const ip = '10.2.0.5';
    for (let i = 0; i < 5; i++) {
      const res = await POST(req(VALIDO, ip));
      expect(res.status).toBe(200);
    }
    const bloqueada = await POST(req(VALIDO, ip));
    expect(bloqueada.status).toBe(429);
    expect(mockRegisterContactFormLead).toHaveBeenCalledTimes(5);
  });
});
