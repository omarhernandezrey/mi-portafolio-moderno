/**
 * T-19 ítem 4: dos endpoints protegidos con `requireAdmin` que mutaban datos
 * sin dejar rastro en `admin_audit_logs` — `payment/confirm` (marca un lead
 * como pagado) y `privacy/delete` (borrado GDPR, irreversible). Ahora los dos
 * llaman a `writeAuditLog`; esto lo comprueba sin tocar una base real.
 */
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn() },
}));

jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue({
    ok: true,
    user: { id: 'u1' },
    role: 'assistant',
    email: 'asst@test.com',
    actor: { userId: 'u1', email: 'asst@test.com', role: 'assistant' },
  }),
}));

jest.mock('@/lib/admin/audit', () => ({
  writeAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: jest.fn().mockResolvedValue({ sent: true }),
}));

jest.mock('@/lib/events/dispatcher', () => ({
  dispatchEvent: jest.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { writeAuditLog } from '@/lib/admin/audit';
import { POST as confirmarPago } from '@/app/api/payment/confirm/route';
import { POST as borrarPorPrivacidad } from '@/app/api/privacy/delete/route';

const mockWriteAuditLog = writeAuditLog as jest.Mock;

function tablaFalsa(porTabla: Record<string, unknown>) {
  (supabaseServer.from as jest.Mock).mockImplementation((tabla: string) => {
    const resultado = porTabla[tabla] ?? { data: [], error: null };
    const encadenable: Record<string, unknown> = {};
    const self = () => encadenable;
    for (const m of ['select', 'eq', 'in', 'update', 'delete', 'filter']) {
      encadenable[m] = jest.fn(self);
    }
    encadenable.maybeSingle = jest.fn().mockResolvedValue(resultado);
    encadenable.single = jest.fn().mockResolvedValue(resultado);
    encadenable.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resultado).then(resolve);
    return encadenable;
  });
}

beforeEach(() => {
  mockWriteAuditLog.mockClear();
});

describe('POST /api/payment/confirm deja auditoría', () => {
  it('escribe lead.payment_confirm con el monto y el método', async () => {
    tablaFalsa({ leads: { data: { notes: null, name: 'Juan', email: 'j@x.com' }, error: null } });

    const req = new NextRequest('http://localhost/api/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ leadId: 'lead-1', amount: '500 USD', method: 'wompi' }),
    });
    const res = await confirmarPago(req);
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'asst@test.com' }),
      expect.objectContaining({
        action: 'lead.payment_confirm',
        resourceType: 'lead',
        resourceId: 'lead-1',
        metadata: { amount: '500 USD', method: 'wompi' },
      })
    );
  });
});

describe('POST /api/privacy/delete deja auditoría, incluso sin datos que borrar', () => {
  it('con datos: registra qué y cuánto se borró', async () => {
    tablaFalsa({
      conversations: { data: [{ id: 'c1' }], error: null },
      leads: { data: [{ id: 'l1' }], error: null },
      tickets: { data: [{ id: 't1' }], error: null },
      messages: { data: [], error: null },
      subscribers: { data: [], error: null },
    });

    const req = new NextRequest('http://localhost/api/privacy/delete', {
      method: 'POST',
      body: JSON.stringify({ email: 'borrar@test.com', reason: 'solicitud del usuario' }),
    });
    const res = await borrarPorPrivacidad(req);
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'privacy.delete_request',
        resourceId: 'borrar@test.com',
        metadata: expect.objectContaining({ found: true }),
      })
    );
  });

  it('sin datos asociados: igual deja constancia de que se procesó', async () => {
    tablaFalsa({
      conversations: { data: [], error: null },
      leads: { data: [], error: null },
      subscribers: { data: [], error: null },
    });

    const req = new NextRequest('http://localhost/api/privacy/delete', {
      method: 'POST',
      body: JSON.stringify({ email: 'nadie@test.com' }),
    });
    const res = await borrarPorPrivacidad(req);
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'privacy.delete_request', metadata: expect.objectContaining({ found: false }) })
    );
  });
});
