// Tests para las regex de extracción de contacto definidas en route.ts
// Las extraemos y probamos de forma aislada

const EMAIL_RE = /[\w.+\-]+@[\w.\-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?57[\s-]?)?3[0-2]\d[\s-]?\d{3}[\s-]?\d{4}|\+?[1-9]\d{8,14}/;
const NAME_RE = /(?:soy|me llamo|mi nombre es|i['']?m|i am|my name is|llámame|pueden llamarme|me pueden llamar|me llaman|habla[s]?\s+con)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/i;

describe('Regex de extracción de contacto (route.ts)', () => {
  describe('EMAIL_RE', () => {
    const valid = [
      'usuario@gmail.com',
      'nombre.apellido@empresa.co',
      'test+tag@domain.org',
      'carlos@restaurante.co',
    ];
    const invalid = ['noesunmail', '@sin-usuario.com', 'falta-arroba.com'];

    it.each(valid)('detecta email válido: %s', (email) => {
      expect(email.match(EMAIL_RE)).not.toBeNull();
    });

    it.each(invalid)('no detecta como email: %s', (str) => {
      expect(str.match(EMAIL_RE)).toBeNull();
    });
  });

  describe('PHONE_RE', () => {
    const valid = [
      '3001234567',
      '300 123 4567',
      '+573001234567',
      '57 300 123 4567',
    ];

    it.each(valid)('detecta teléfono válido: %s', (phone) => {
      expect(phone.match(PHONE_RE)).not.toBeNull();
    });

    it('no detecta número demasiado corto', () => {
      expect('12345'.match(PHONE_RE)).toBeNull();
    });
  });

  describe('NAME_RE', () => {
    // La regex captura el nombre completo (nombre + apellido), no solo el primero
    const cases: [string, string][] = [
      ['soy Carlos Gómez', 'Carlos Gómez'],
      ['me llamo Ana Torres', 'Ana Torres'],
      ['mi nombre es Juan', 'Juan'],
      ["I'm John Smith", 'John Smith'],
      ['my name is Alice Brown', 'Alice Brown'],
      ['hablas con Pedro Martínez', 'Pedro Martínez'],
    ];

    it.each(cases)('extrae nombre de "%s" → "%s"', (text, expected) => {
      const match = text.match(NAME_RE);
      expect(match).not.toBeNull();
      expect(match?.[1]).toBe(expected);
    });

    it('no extrae nombre de texto sin patrones conocidos', () => {
      expect('Carlos quiere un sitio web'.match(NAME_RE)).toBeNull();
    });
  });
});
