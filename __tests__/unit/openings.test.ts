import { OPENINGS, getRandomVariant, OpeningVariant } from '@/lib/chatbot/openings';

describe('OPENINGS', () => {
  it('tiene exactamente 4 variantes (A, B, C, D)', () => {
    expect(OPENINGS).toHaveLength(4);
    const ids = OPENINGS.map(o => o.id);
    expect(ids).toContain('A');
    expect(ids).toContain('B');
    expect(ids).toContain('C');
    expect(ids).toContain('D');
  });

  it('cada variante tiene texto en los 3 idiomas', () => {
    for (const opening of OPENINGS) {
      expect(opening.text.es).toBeTruthy();
      expect(opening.text.en).toBeTruthy();
      expect(opening.text.pt).toBeTruthy();
    }
  });

  it('al menos 3 de 4 variantes en español mencionan a Omar', () => {
    const conOmar = OPENINGS.filter(o => o.text.es.includes('Omar'));
    expect(conOmar.length).toBeGreaterThanOrEqual(3);
  });

  it('al menos 3 de 4 variantes en inglés mencionan a Omar', () => {
    const conOmar = OPENINGS.filter(o => o.text.en.includes('Omar'));
    expect(conOmar.length).toBeGreaterThanOrEqual(3);
  });

  it('los textos no están vacíos ni son demasiado cortos', () => {
    for (const opening of OPENINGS) {
      expect(opening.text.es.length).toBeGreaterThan(20);
      expect(opening.text.en.length).toBeGreaterThan(20);
      expect(opening.text.pt.length).toBeGreaterThan(20);
    }
  });
});

describe('getRandomVariant', () => {
  const VALID: OpeningVariant[] = ['A', 'B', 'C', 'D'];

  it('retorna siempre uno de los valores válidos', () => {
    for (let i = 0; i < 50; i++) {
      expect(VALID).toContain(getRandomVariant());
    }
  });

  it('en 200 llamadas produce al menos 3 variantes distintas (distribución razonable)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(getRandomVariant());
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });
});
