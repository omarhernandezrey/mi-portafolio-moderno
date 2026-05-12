import { buildCalcomUrl } from '@/lib/chatbot/calcom';

describe('buildCalcomUrl', () => {
  const BASE = 'https://cal.com/omar/consulta-15min';

  it('retorna string vacío si baseUrl está vacío', () => {
    expect(buildCalcomUrl('')).toBe('');
  });

  it('retorna URL base válida sin metadatos de visitante', () => {
    const url = buildCalcomUrl(BASE);
    expect(url).toContain('cal.com/omar/consulta-15min');
  });

  it('añade el parámetro name cuando se proporciona', () => {
    const url = buildCalcomUrl(BASE, { name: 'Carlos Gómez' });
    expect(url).toContain('name=Carlos+G%C3%B3mez');
  });

  it('añade el parámetro email cuando se proporciona', () => {
    const url = buildCalcomUrl(BASE, { email: 'carlos@test.co' });
    expect(url).toContain('email=carlos%40test.co');
  });

  it('añade nombre y email simultáneamente', () => {
    const url = buildCalcomUrl(BASE, { name: 'Ana', email: 'ana@test.com' });
    expect(url).toContain('name=');
    expect(url).toContain('email=');
  });

  it('no añade name si está undefined', () => {
    const url = buildCalcomUrl(BASE, { email: 'x@x.com' });
    expect(url).not.toContain('name=');
  });

  it('no añade email si está undefined', () => {
    const url = buildCalcomUrl(BASE, { name: 'X' });
    expect(url).not.toContain('email=');
  });

  it('funciona con URL de entrevista también', () => {
    const interviewUrl = 'https://cal.com/omar/entrevista-30min';
    const url = buildCalcomUrl(interviewUrl, { name: 'Dev' });
    expect(url).toContain('entrevista-30min');
    expect(url).toContain('name=Dev');
  });

  it('produce URL parseable como URL válida', () => {
    const url = buildCalcomUrl(BASE, { name: 'Test', email: 'test@test.com' });
    expect(() => new URL(url)).not.toThrow();
  });
});
