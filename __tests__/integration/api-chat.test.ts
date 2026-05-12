/**
 * Tests de integración para POST /api/chat
 * Mockea: Supabase, generateReply (LLM), notifyTelegram
 * No hace llamadas reales a ninguna API externa.
 */

// Mocks antes de cualquier import del módulo
jest.mock('@/lib/supabaseServer', () => {
  const mockConv = { id: 'mock-conv-id', visitor_name: null, facts: {}, human_takeover: false, variant: 'A' };

  function makeChain(defaultData: unknown) {
    const resolved = { data: defaultData, error: null };
    const chain: Record<string, unknown> = {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(resolved).then(resolve),
      catch: (reject: (e: unknown) => unknown) => Promise.resolve(resolved).catch(reject),
    };
    const methods = ['select','insert','upsert','update','eq','neq','is','not','order','limit','range','filter','match','like','ilike','in','gte','lte','gt','lt'];
    for (const m of methods) chain[m] = jest.fn().mockReturnValue(chain);
    chain['single']      = jest.fn().mockResolvedValue(resolved);
    chain['maybeSingle'] = jest.fn().mockResolvedValue(resolved);
    return chain;
  }

  return {
    supabaseServer: {
      from: jest.fn().mockImplementation((table: string) => {
        if (table === 'conversations') return makeChain(mockConv);   // objeto único
        if (table === 'messages')      return makeChain([]);          // array de mensajes
        if (table === 'api_logs')      return makeChain(null);
        return makeChain(null);
      }),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    },
  };
});

jest.mock('@/lib/chatbot/llm', () => ({
  generateReply: jest.fn().mockResolvedValue('¿En qué te puedo ayudar hoy?'),
}));

jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: jest.fn().mockResolvedValue(undefined),
  notifyLead: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/chatbot/rag', () => ({
  retrieveContext: jest.fn().mockResolvedValue(''),
  searchProjects: jest.fn().mockResolvedValue([]),
  getEmbedding: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/config/env', () => ({
  serverEnv: {
    GROQ_API_KEY: 'test-key',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    TELEGRAM_BOT_TOKEN: 'test-token',
    TELEGRAM_CHAT_ID: '12345',
    ADMIN_PASSWORD: 'test-pass',
    ADMIN_SECRET: 'test-secret-long',
    CRON_SECRET: 'test-cron-secret',
  },
  clientEnv: {
    NEXT_PUBLIC_CALCOM_INTERVIEW_URL: 'https://cal.com/omar/entrevista',
    NEXT_PUBLIC_CALCOM_CONSULT_URL: 'https://cal.com/omar/consulta',
    NEXT_PUBLIC_WHATSAPP_NUMBER: '573219052878',
    NEXT_PUBLIC_SITE_URL: 'https://test.com',
    NEXT_PUBLIC_PAYMENT_PAYPAL_URL: 'https://paypal.me/test',
    NEXT_PUBLIC_PAYMENT_WOMPI_URL: '',
    NEXT_PUBLIC_PAYMENT_NEQUI_URL: '',
    NEXT_PUBLIC_PAYMENT_NEQUI_QR: '',
    NEXT_PUBLIC_PAYMENT_MP_URL: '',
    NEXT_PUBLIC_PAYMENT_BINANCE_ID: '',
  },
}));

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';
import { generateReply } from '@/lib/chatbot/llm';

function makeRequest(body: Record<string, unknown>, ip = '127.0.0.1'): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  sessionId: 'test-session-123',
  message: 'Hola, quiero una landing page',
  language: 'es',
};

describe('POST /api/chat', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('validación de payload', () => {
    it('retorna 400 cuando falta sessionId', async () => {
      const req = makeRequest({ message: 'hola', language: 'es' });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('retorna 400 cuando falta message', async () => {
      const req = makeRequest({ sessionId: 'abc', language: 'es' });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('retorna 400 con language inválido', async () => {
      const req = makeRequest({ sessionId: 'abc', message: 'hola', language: 'fr' });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('retorna 400 si message excede 2000 caracteres', async () => {
      const req = makeRequest({ ...validPayload, message: 'x'.repeat(2001) });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('retorna 400 con cuerpo vacío', async () => {
      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('payload válido', () => {
    it('retorna 200 con campo reply', async () => {
      const req = makeRequest(validPayload);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('reply');
      expect(typeof body.reply).toBe('string');
    });

    it('llama a generateReply exactamente una vez', async () => {
      const req = makeRequest(validPayload);
      await POST(req);
      expect(generateReply).toHaveBeenCalledTimes(1);
    });

    it('acepta language en', async () => {
      const req = makeRequest({ ...validPayload, language: 'en' });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });

    it('acepta language pt', async () => {
      const req = makeRequest({ ...validPayload, language: 'pt' });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('rate limiting', () => {
    it('bloquea con 429 al superar el límite desde la misma IP', async () => {
      // El límite es de llamadas por ventana de tiempo
      // Hacemos muchas llamadas desde la misma IP hasta provocar 429
      let status429 = false;
      for (let i = 0; i < 25; i++) {
        const req = makeRequest({ ...validPayload, sessionId: `session-${i}` }, '10.0.0.1');
        const res = await POST(req);
        if (res.status === 429) { status429 = true; break; }
      }
      expect(status429).toBe(true);
    });

    it('IPs distintas no se bloquean entre sí', async () => {
      const req1 = makeRequest(validPayload, '192.168.1.1');
      const req2 = makeRequest(validPayload, '192.168.1.2');
      const res1 = await POST(req1);
      const res2 = await POST(req2);
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });
  });

  describe('honeypot', () => {
    it('retorna 200 silencioso cuando el campo website está lleno (bot)', async () => {
      const req = makeRequest({ ...validPayload, website: 'http://spam.com' });
      const res = await POST(req);
      // El honeypot devuelve 200 silencioso sin llamar al LLM
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.reply).toBeDefined();
      // No debe haber llamado al LLM real
      expect(generateReply).not.toHaveBeenCalled();
    });
  });
});
