/**
 * Tests de auth en APIs admin:
 * - sin sesión → 401
 * - sin rol → 403
 * - rol insuficiente → 403
 * - owner autenticado → pasa el gate de auth
 */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

jest.mock('@/config/env', () => ({
  serverEnv: {
    ADMIN_ALLOWED_EMAILS: '',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
    CRON_SECRET: 'test-cron',
  },
  clientEnv: {},
}));

const mockSelectChain = {
  select: jest.fn(),
  order: jest.fn(),
  eq: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  limit: jest.fn(),
};

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn(() => mockSelectChain),
  },
}));

jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: jest.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from 'next/server';
import { GET as getWebhooks } from '@/app/api/admin/webhooks/route';
import { GET as getTickets } from '@/app/api/tickets/route';
import { POST as postTicket } from '@/app/api/tickets/route';
import { GET as getAudit } from '@/app/api/admin/audit/route';
import { supabaseServer } from '@/lib/supabaseServer';

function asUser(email = 'owner@test.com', id = 'user-1') {
  return { id, email };
}

function mockAuth(opts: {
  user?: { id: string; email: string } | null;
  role?: string | null;
}) {
  mockGetUser.mockResolvedValue({
    data: { user: opts.user === undefined ? null : opts.user },
  });

  const roleChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: opts.role ? { role: opts.role } : null,
      error: null,
    }),
    single: jest.fn().mockResolvedValue({
      data: opts.role ? { role: opts.role } : null,
      error: null,
    }),
  };

  mockFrom.mockReturnValue(roleChain);
}

function resetDataMocks() {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  for (const m of [
    'select',
    'order',
    'eq',
    'neq',
    'insert',
    'update',
    'delete',
    'limit',
    'range',
    'is',
    'not',
    'in',
    'gte',
    'lte',
  ]) {
    chain[m] = jest.fn(self);
  }
  chain.single = jest.fn().mockResolvedValue({ data: { id: 'x' }, error: null });
  chain.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  // thenable for await query
  chain.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);

  (supabaseServer.from as jest.Mock).mockImplementation(() => chain);
}

beforeEach(() => {
  jest.clearAllMocks();
  resetDataMocks();
});

describe('API admin auth — sin sesión', () => {
  beforeEach(() => mockAuth({ user: null }));

  it('GET /api/admin/webhooks → 401', async () => {
    const res = await getWebhooks();
    expect(res.status).toBe(401);
  });

  it('GET /api/tickets → 401', async () => {
    const res = await getTickets();
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/audit → 401', async () => {
    const res = await getAudit(new NextRequest('http://localhost/api/admin/audit'));
    expect(res.status).toBe(401);
  });
});

describe('API admin auth — sin rol', () => {
  beforeEach(() => mockAuth({ user: asUser('stranger@test.com'), role: null }));

  it('GET /api/admin/webhooks → 403', async () => {
    const res = await getWebhooks();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/rol/i);
  });
});

describe('API admin auth — rol insuficiente', () => {
  it('viewer no puede listar webhooks (owner only)', async () => {
    mockAuth({ user: asUser('viewer@test.com'), role: 'viewer' });
    const res = await getWebhooks();
    expect(res.status).toBe(403);
  });

  it('viewer no puede crear tickets (write = assistant)', async () => {
    mockAuth({ user: asUser('viewer@test.com'), role: 'viewer' });
    const req = new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Ticket de prueba largo',
        priority: 'low',
        content: 'Descripción suficientemente larga',
      }),
    });
    const res = await postTicket(req);
    expect(res.status).toBe(403);
  });

  it('assistant no puede ver audit (owner only)', async () => {
    mockAuth({ user: asUser('asst@test.com'), role: 'assistant' });
    const res = await getAudit(new NextRequest('http://localhost/api/admin/audit'));
    expect(res.status).toBe(403);
  });
});

describe('API admin auth — acceso permitido', () => {
  it('owner puede listar webhooks', async () => {
    mockAuth({ user: asUser('owner@test.com'), role: 'owner' });
    const res = await getWebhooks();
    expect(res.status).toBe(200);
  });

  it('assistant puede listar tickets', async () => {
    mockAuth({ user: asUser('asst@test.com'), role: 'assistant' });
    const res = await getTickets();
    expect(res.status).toBe(200);
  });
});
