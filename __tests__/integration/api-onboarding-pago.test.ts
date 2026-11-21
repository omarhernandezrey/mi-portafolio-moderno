/**
 * `POST /api/onboarding/pago` — "ya pagué" declarado por el cliente.
 *
 * Defecto real encontrado en la auditoría de backend: la idempotencia se
 * apoyaba SOLO en `lead.payment_id`, pero la confirmación manual de Omar
 * (`/api/payment/confirm`, tras verificar Wompi/Nequi) escribe `status`,
 * `notes` y `paid_at` — nunca `payment_id`.
 *
 * Secuencia que lo rompía, toda con datos legítimos:
 *   1. El cliente paga de verdad.
 *   2. Omar verifica y confirma desde el panel → status='paid', payment_id NULL.
 *   3. El cliente abre el wizard y pulsa "ya pagué".
 *   4. La guarda `.is('payment_id', null)` pasaba → el lead BAJABA a
 *      'contacted', `paid_at` se sobrescribía con la fecha de hoy y llegaba
 *      un Telegram "PAGO AUTODECLARADO (verificar)" de algo ya verificado.
 *
 * Efecto colateral: el resumen diario filtra por status='paid' dentro de un
 * rango de `paid_at`, así que ese pago desaparecía del reporte.
 */
const mockUpdate = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => ({
      select: () => ({
        eq: () => ({ single: (...a: unknown[]) => mockSingle(...a) }),
      }),
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return {
          eq: () => ({
            is: () => ({
              select: () => ({ maybeSingle: async () => ({ data: { id: 'l1' }, error: null }) }),
            }),
          }),
        };
      },
    }),
  },
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

jest.mock('@/lib/chatbot/notion', () => ({
  updateLeadStatusInNotion: jest.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/onboarding/pago/route';

function peticion(token = 'tok_valido') {
  return new NextRequest('http://localhost/api/onboarding/pago', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

const LEAD_BASE = {
  id: 'l1',
  name: 'Ana',
  email: 'ana@test.com',
  service_requested: 'Landing',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/onboarding/pago', () => {
  it('un pago ya confirmado por Omar (status=paid, sin payment_id) NO se revierte', async () => {
    mockSingle.mockResolvedValue({
      data: { ...LEAD_BASE, status: 'paid', payment_id: null },
      error: null,
    });

    const res = await POST(peticion());
    const cuerpo = await res.json();

    expect(cuerpo.alreadyConfirmed).toBe(true);
    // Lo esencial: no se toca el lead.
    expect(mockUpdate).not.toHaveBeenCalled();
    // Y no se avisa de "verificar" algo que ya se verificó.
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('sigue siendo idempotente por payment_id (el caso que ya cubría)', async () => {
    mockSingle.mockResolvedValue({
      data: { ...LEAD_BASE, status: 'contacted', payment_id: 'wompi_123' },
      error: null,
    });

    const res = await POST(peticion());
    expect((await res.json()).alreadyConfirmed).toBe(true);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('un lead que todavía no ha pagado sí registra la autodeclaración', async () => {
    mockSingle.mockResolvedValue({
      data: { ...LEAD_BASE, status: 'contacted', payment_id: null },
      error: null,
    });

    const res = await POST(peticion());
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledTimes(1);

    // Nunca marca 'paid' sin verificación humana: eso es decisión de Omar.
    const campos = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(campos.status).toBe('contacted');
    expect(campos.onboarding_step).toBe(4);

    const mensaje = mockNotifyTelegram.mock.calls[0][0] as string;
    expect(mensaje).toContain('verificar');
  });

  it('token inválido: 404 y sin tocar nada', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'no rows' } });

    const res = await POST(peticion('tok_inventado'));
    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
