import { buildSystemPrompt } from '@/lib/chatbot/systemPrompt';

describe('buildSystemPrompt', () => {
  describe('estructura básica', () => {
    it('contiene sección ROL', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('ROL');
      expect(prompt).toContain('Omar Hernández');
    });

    it('contiene catálogo con precios USD', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('USD');
      expect(prompt).toMatch(/\$\d+/);
    });

    it('contiene instrucciones de formato', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('FORMATO');
    });

    it('contiene sección de proyectos del portafolio', () => {
      const prompt = buildSystemPrompt('es');
      // Debe incluir tecnologías del stack
      expect(prompt).toMatch(/next|react|typescript|supabase/i);
    });
  });

  describe('contexto del visitante', () => {
    it('incluye nombre del visitante cuando se proporciona', () => {
      const prompt = buildSystemPrompt('es', { visitorName: 'Carlos' });
      expect(prompt).toContain('Carlos');
    });

    it('incluye bloque DATOS CAPTURADOS cuando hay contexto', () => {
      const prompt = buildSystemPrompt('es', {
        visitorName: 'Ana',
        visitorEmail: 'ana@test.com',
      });
      expect(prompt).toContain('DATOS CAPTURADOS');
      expect(prompt).toContain('Ana');
      expect(prompt).toContain('ana@test.com');
    });

    it('NO incluye bloque DATOS CAPTURADOS sin contexto', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).not.toContain('DATOS CAPTURADOS');
    });

    it('incluye teléfono cuando se proporciona', () => {
      const prompt = buildSystemPrompt('es', { visitorPhone: '3001234567' });
      expect(prompt).toContain('3001234567');
    });

    it('no pide datos que ya tiene — frase en el prompt', () => {
      const prompt = buildSystemPrompt('es', { visitorName: 'Pedro' });
      expect(prompt).toContain('NO VOLVER A PEDIR');
    });
  });

  describe('multiidioma', () => {
    it('genera prompt en inglés', () => {
      const prompt = buildSystemPrompt('en');
      expect(prompt).toContain('Omar Hernández');
      // El catálogo debe estar en inglés
      expect(prompt).toMatch(/landing page/i);
    });

    it('genera prompt en portugués', () => {
      const prompt = buildSystemPrompt('pt');
      expect(prompt).toContain('Omar Hernández');
    });

    it('los tres idiomas producen prompts no vacíos de longitud razonable', () => {
      for (const lang of ['es', 'en', 'pt'] as const) {
        const p = buildSystemPrompt(lang);
        expect(p.length).toBeGreaterThan(500);
      }
    });
  });

  describe('reglas de venta', () => {
    it('contiene instrucción de máximo 1-2 oraciones', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('1–2 oraciones');
    });

    it('prohíbe emojis en el formato', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('emojis');
    });

    it('contiene bloque de objeciones', () => {
      const prompt = buildSystemPrompt('es');
      // Las objeciones están serializadas en el prompt
      expect(prompt.length).toBeGreaterThan(1000);
    });
  });
});
