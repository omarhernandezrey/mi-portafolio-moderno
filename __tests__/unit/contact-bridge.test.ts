/**
 * `registerContactFormLead` (T-25: ya sin la `conversations` ficticia que
 * existía solo para colgar el lead de algo — ver T-17 para el aviso de
 * "lead real entrante", que ya notificaba desde antes de T-25).
 */
const mockInsert = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: () => ({ insert: mockInsert }) },
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

jest.mock('@/lib/chatbot/email', () => ({
  sendContactNotification: jest.fn().mockResolvedValue(null),
}));

const mockDispatchEvent = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/events/dispatcher', () => ({
  dispatchEvent: (...args: unknown[]) => mockDispatchEvent(...args),
}));

import { registerContactFormLead } from '@/lib/chatbot/contactBridge';

function cliente(error: { message: string } | null = null) {
  mockInsert.mockReturnValue({
    select: () => ({ single: async () => ({ data: error ? null : { id: 'lead1' }, error }) }),
  });
}

const DATOS = { name: 'Ana', email: 'ana@test.com', message: 'Hola, necesito una web' };

beforeEach(() => {
  mockInsert.mockReset();
  mockNotifyTelegram.mockClear();
  mockDispatchEvent.mockClear();
});

describe('registerContactFormLead', () => {
  it('lead guardado con éxito: inserta con source "contact_form" y notifica por Telegram con el origen', async () => {
    cliente();
    const resultado = await registerContactFormLead(DATOS);

    expect(resultado.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ source: 'contact_form' }));
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('Ana'));
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('Origen: contact_form'));
  });

  it('nunca crea una fila en "conversations" (T-25: sin conversación ficticia)', async () => {
    cliente();
    await registerContactFormLead(DATOS);
    // Si alguna vez se volviera a llamar `.from('conversations')`, el mock
    // no lo distingue por tabla — esto se verifica de verdad a nivel de
    // integración contra la base real (ver la ficha de T-25 en el plan).
    // Aquí la garantía es más simple pero igual de real: un solo `insert`
    // por envío, el del lead.
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('el aviso a Telegram trae nombre, correo, servicio y origen (T-25/T-16)', async () => {
    cliente();
    await registerContactFormLead({ ...DATOS, service: 'Desarrollo web' });
    const mensaje = mockNotifyTelegram.mock.calls[0][0] as string;
    expect(mensaje).toContain('Ana');
    expect(mensaje).toContain('ana@test.com');
    expect(mensaje).toContain('Servicio: Desarrollo web');
    expect(mensaje).toContain('Origen: contact_form');
  });

  it('el webhook de lead.created lleva el mismo origen', async () => {
    cliente();
    await registerContactFormLead(DATOS);
    expect(mockDispatchEvent).toHaveBeenCalledWith('lead.created', expect.objectContaining({ source: 'contact_form' }));
  });

  it('falla la inserción del lead: no se envía nada (no hay lead real que anunciar)', async () => {
    cliente({ message: 'constraint violada' });
    const resultado = await registerContactFormLead(DATOS);
    expect(resultado.success).toBe(false);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });
});
