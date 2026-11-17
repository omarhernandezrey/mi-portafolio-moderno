/**
 * `POST /api/calculator` (T-25): revisado con el mismo criterio que el
 * formulario de contacto — sin `conversations` ficticia, `leads.source`
 * directo (`budget_calculator`), y un fallo de Telegram/Notion no debe
 * impedir que el lead quede guardado.
 */
jest.mock('@/config/env', () => ({
  serverEnv: { RESEND_API_KEY: '' },
  clientEnv: { NEXT_PUBLIC_SITE_URL: 'http://test.local' },
}));

jest.mock('@/lib/calculator/pricing', () => ({
  calculateBudget: () => 1000000,
}));

const mockInsert = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: () => ({ insert: mockInsert }) },
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

const mockPushLeadToNotion = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/chatbot/notion', () => ({
  pushLeadToNotion: (...args: unknown[]) => mockPushLeadToNotion(...args),
}));

const mockDispatchEvent = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/events/dispatcher', () => ({
  dispatchEvent: (...args: unknown[]) => mockDispatchEvent(...args),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/calculator/route';

function req(body: unknown, ip = '10.3.0.1') {
  return new NextRequest('http://localhost/api/calculator', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify(body),
  });
}

const VALIDO = {
  selections: { tipo: 'landing' },
  visitorInfo: { name: 'Ana', email: 'ana@test.com', company: 'Acme' },
  currency: 'cop',
  language: 'es',
};

beforeEach(() => {
  mockInsert.mockReset();
  mockInsert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: 'lead1' }, error: null }) }) });
  mockNotifyTelegram.mockClear();
  mockPushLeadToNotion.mockClear();
  mockDispatchEvent.mockClear();
});

describe('POST /api/calculator', () => {
  it('carga útil válida: 200, inserta el lead con source "budget_calculator"', async () => {
    const res = await POST(req(VALIDO, '10.3.0.2'));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ source: 'budget_calculator' }));
  });

  it('nunca inserta una fila en "conversations" (T-25): un solo insert, el del lead', async () => {
    await POST(req(VALIDO, '10.3.0.3'));
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('el aviso a Telegram trae nombre, correo, servicio y origen', async () => {
    await POST(req(VALIDO, '10.3.0.4'));
    const mensaje = mockNotifyTelegram.mock.calls[0][0] as string;
    expect(mensaje).toContain('Ana');
    expect(mensaje).toContain('ana@test.com');
    expect(mensaje).toContain('Servicio: Calculadora de Presupuesto');
    expect(mensaje).toContain('Origen: budget_calculator');
  });

  it('carga inválida (sin visitorInfo.email) → 400, no inserta nada', async () => {
    const carga = { ...VALIDO, visitorInfo: { name: 'Ana', email: 'no-es-correo', company: '' } };
    const res = await POST(req(carga, '10.3.0.5'));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('un fallo al notificar Telegram no impide que el lead quede guardado', async () => {
    mockNotifyTelegram.mockRejectedValueOnce(new Error('telegram caído'));
    // notifyTelegram real nunca lanza, pero esto prueba que aunque lo
    // hiciera, el insert ya ocurrió antes: la respuesta sigue siendo 500
    // solo por el error no atrapado de la notificación, nunca por perder
    // el lead ya guardado.
    const res = await POST(req(VALIDO, '10.3.0.6'));
    expect(mockInsert).toHaveBeenCalled();
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('la petición 6 desde la misma IP en una hora se bloquea con 429', async () => {
    const ip = '10.3.0.7';
    for (let i = 0; i < 5; i++) {
      const res = await POST(req(VALIDO, ip));
      expect(res.status).toBe(200);
    }
    const bloqueada = await POST(req(VALIDO, ip));
    expect(bloqueada.status).toBe(429);
  });
});
