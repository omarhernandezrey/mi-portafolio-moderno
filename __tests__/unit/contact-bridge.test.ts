/**
 * `registerContactFormLead` (el evento "lead real entrante" de T-17) ya
 * notificaba por Telegram desde antes de esta tarea, pero no tenía tests
 * propios. T-17 solo añade la cobertura que faltaba: se envía cuando el
 * lead de verdad se guarda, no se envía si la inserción falla.
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...args: unknown[]) => mockFrom(...args) },
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

function cliente(respuestas: { conversations?: { error: unknown }; leads?: { error: unknown } }) {
  mockFrom.mockImplementation((tabla: string) => {
    const error = tabla === 'conversations' ? respuestas.conversations?.error ?? null : respuestas.leads?.error ?? null;
    const data = error ? null : tabla === 'conversations' ? { id: 'conv1' } : { id: 'lead1' };
    return {
      insert: () => ({
        select: () => ({ single: async () => ({ data, error }) }),
      }),
    };
  });
}

const DATOS = { name: 'Ana', email: 'ana@test.com', message: 'Hola, necesito una web' };

beforeEach(() => {
  mockFrom.mockReset();
  mockNotifyTelegram.mockClear();
});

describe('registerContactFormLead — evento "lead real entrante" (T-17)', () => {
  it('lead guardado con éxito: se envía la notificación de Telegram', async () => {
    cliente({});
    const resultado = await registerContactFormLead(DATOS);
    expect(resultado.success).toBe(true);
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('Ana'));
  });

  it('falla la inserción del lead: no se envía nada (no hay lead real que anunciar)', async () => {
    cliente({ leads: { error: { message: 'constraint violada' } } });
    const resultado = await registerContactFormLead(DATOS);
    expect(resultado.success).toBe(false);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('falla crear la conversación: tampoco se envía (se corta antes de llegar al lead)', async () => {
    cliente({ conversations: { error: { message: 'boom' } } });
    const resultado = await registerContactFormLead(DATOS);
    expect(resultado.success).toBe(false);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });
});
