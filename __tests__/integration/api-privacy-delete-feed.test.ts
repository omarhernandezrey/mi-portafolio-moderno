/**
 * Derecho al olvido: cobertura del feed de comunidad.
 *
 * Defecto real encontrado en la auditoría de backend. La ruta borraba
 * `conversations`, `messages`, `leads`, `tickets` y `subscribers`, pero NO
 * `feed_posts` ni `feed_comments`, que guardan el correo del visitante
 * (`author_email` en las dos; `not null` en los comentarios). El resultado
 * era una respuesta falsa: quien solo había comentado en Comunidad recibía
 * «No se encontraron datos adicionales asociados» mientras su correo seguía
 * en la base — justo lo contrario del objetivo declarado de la ruta.
 *
 * Los comentarios se borran por separado a propósito: el `on delete cascade`
 * de `feed_comments.post_id` solo arrastra los comentarios de los posts
 * propios, no los que la persona dejó en publicaciones de otros.
 */
const tablasTocadas: { tabla: string; op: string; filtro?: unknown }[] = [];

function constructorConsulta(tabla: string, filas: unknown[]) {
  const api: Record<string, unknown> = {
    select: () => api,
    delete: () => {
      tablasTocadas.push({ tabla, op: 'delete' });
      return api;
    },
    eq: (col: string, val: unknown) => {
      const ultimo = tablasTocadas[tablasTocadas.length - 1];
      if (ultimo && ultimo.tabla === tabla) ultimo.filtro = { [col]: val };
      return api;
    },
    in: () => api,
    filter: () => api,
    not: () => api,
    then: undefined,
  };
  // El await final de cada cadena resuelve a { data, error }.
  (api as { then: unknown }).then = (resolve: (v: unknown) => void) =>
    resolve({ data: filas, error: null });
  return api;
}

const filasPorTabla: Record<string, unknown[]> = {};

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: (tabla: string) => constructorConsulta(tabla, filasPorTabla[tabla] ?? []),
  },
}));

jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: jest.fn().mockResolvedValue({ sent: true }),
}));

const mockWriteAuditLog = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/admin/audit', () => ({
  writeAuditLog: (...args: unknown[]) => mockWriteAuditLog(...args),
}));

jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue({
    ok: true,
    user: { id: 'u1' },
    role: 'owner',
    email: 'omar@test.com',
    actor: { id: 'u1' },
  }),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/privacy/delete/route';

function peticion(email: string) {
  return new NextRequest('http://localhost/api/privacy/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, reason: 'solicitud del titular' }),
  });
}

beforeEach(() => {
  tablasTocadas.length = 0;
  for (const k of Object.keys(filasPorTabla)) delete filasPorTabla[k];
  mockWriteAuditLog.mockClear();
});

describe('POST /api/privacy/delete — feed de comunidad', () => {
  it('borra los comentarios del feed por author_email', async () => {
    await POST(peticion('visitante@test.com'));
    const borradoComentarios = tablasTocadas.find(
      (t) => t.tabla === 'feed_comments' && t.op === 'delete'
    );
    expect(borradoComentarios).toBeDefined();
    expect(borradoComentarios?.filtro).toEqual({ author_email: 'visitante@test.com' });
  });

  it('borra las publicaciones del feed por author_email', async () => {
    await POST(peticion('visitante@test.com'));
    const borradoPosts = tablasTocadas.find(
      (t) => t.tabla === 'feed_posts' && t.op === 'delete'
    );
    expect(borradoPosts).toBeDefined();
    expect(borradoPosts?.filtro).toEqual({ author_email: 'visitante@test.com' });
  });

  it('sigue borrando lo de antes: no se perdió ninguna tabla por el camino', async () => {
    await POST(peticion('visitante@test.com'));
    const borradas = tablasTocadas.filter((t) => t.op === 'delete').map((t) => t.tabla);
    expect(borradas).toEqual(expect.arrayContaining(['subscribers', 'feed_comments', 'feed_posts']));
  });

  it('quien solo comentó en el feed NO recibe el "no se encontraron datos"', async () => {
    // El caso que delataba el defecto: sin conversaciones ni leads, la ruta
    // respondía que no había nada que borrar aunque su correo estuviera en
    // feed_comments.
    filasPorTabla.feed_comments = [{ id: 'c1' }];

    const res = await POST(peticion('solo-comento@test.com'));
    const cuerpo = await res.json();

    expect(cuerpo.message).not.toContain('No se encontraron datos');
    expect(cuerpo.success).toBe(true);
  });

  it('deja constancia de cuántas filas del feed se borraron', async () => {
    filasPorTabla.feed_comments = [{ id: 'c1' }, { id: 'c2' }];
    filasPorTabla.feed_posts = [{ id: 'p1' }];

    await POST(peticion('activo@test.com'));

    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        metadata: expect.objectContaining({
          feedCommentsDeleted: 2,
          feedPostsDeleted: 1,
        }),
      })
    );
  });
});
