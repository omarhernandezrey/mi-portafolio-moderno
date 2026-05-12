import { extractLead, extractHandoff, extractCalcom, cleanReply } from '@/lib/chatbot/parser';

// ── extractLead ──────────────────────────────────────────────────────────────

describe('extractLead', () => {
  it('extrae un bloque LEAD válido', () => {
    const text = `Perfecto, te envío el resumen.
<<<LEAD>>>{"type":"client","name":"Carlos Gómez","email":"carlos@restaurante.co","phone":null,"company":null,"service_requested":"Landing","budget":"$300","timeline":null,"notes":"restaurante"}<<<END>>>`;
    const lead = extractLead(text);
    expect(lead).not.toBeNull();
    expect(lead?.name).toBe('Carlos Gómez');
    expect(lead?.email).toBe('carlos@restaurante.co');
    expect(lead?.type).toBe('client');
    expect(lead?.budget).toBe('$300');
  });

  it('extrae lead con variante <<<END> (un solo >)', () => {
    const text = `<<<LEAD>>>{"type":"recruiter","name":"Ana","email":"ana@corp.com","phone":null,"company":"TechCorp","service_requested":null,"budget":null,"timeline":null,"notes":"puesto senior"}<<<END>`;
    const lead = extractLead(text);
    expect(lead?.type).toBe('recruiter');
    expect(lead?.company).toBe('TechCorp');
  });

  it('extrae lead con variante <<<END>> (dos >)', () => {
    const text = `<<<LEAD>>>{"type":"other","name":"Pedro","email":"pedro@mail.com","phone":"3001234567","company":null,"service_requested":null,"budget":null,"timeline":null,"notes":"consulta"}<<<END>>`;
    const lead = extractLead(text);
    expect(lead?.name).toBe('Pedro');
    expect(lead?.phone).toBe('3001234567');
  });

  it('retorna null cuando no hay bloque LEAD', () => {
    const text = 'Hola, ¿en qué te puedo ayudar?';
    expect(extractLead(text)).toBeNull();
  });

  it('retorna null cuando el JSON está malformado', () => {
    const text = `<<<LEAD>>>{"type":"client","name":<<<END>>>`;
    expect(extractLead(text)).toBeNull();
  });

  it('extrae lead con texto adicional antes y después del bloque', () => {
    const text = `Claro, aquí está tu resumen. <<<LEAD>>>{"type":"client","name":"Test","email":"t@t.co","phone":null,"company":null,"service_requested":"App","budget":null,"timeline":null,"notes":""}<<<END>>> ¡Hasta pronto!`;
    const lead = extractLead(text);
    expect(lead?.name).toBe('Test');
  });

  it('maneja campos null correctamente', () => {
    const text = `<<<LEAD>>>{"type":"client","name":"X","email":"x@x.co","phone":null,"company":null,"service_requested":null,"budget":null,"timeline":null,"notes":""}<<<END>>>`;
    const lead = extractLead(text);
    expect(lead?.phone).toBeNull();
    expect(lead?.company).toBeNull();
  });
});

// ── extractHandoff ───────────────────────────────────────────────────────────

describe('extractHandoff', () => {
  it('extrae un bloque HANDOFF válido', () => {
    const text = `Te paso con Omar directamente. <<<HANDOFF>>>{"summary":"Cliente busca app de logística, presupuesto $3000","urgency":"high"}<<<END>>>`;
    const handoff = extractHandoff(text);
    expect(handoff?.urgency).toBe('high');
    expect(handoff?.summary).toContain('logística');
  });

  it('retorna null sin bloque HANDOFF', () => {
    expect(extractHandoff('Hola, ¿cómo estás?')).toBeNull();
  });

  it('acepta urgency low, medium y high', () => {
    for (const urgency of ['low', 'medium', 'high'] as const) {
      const text = `<<<HANDOFF>>>{"summary":"test","urgency":"${urgency}"}<<<END>>>`;
      expect(extractHandoff(text)?.urgency).toBe(urgency);
    }
  });
});

// ── extractCalcom ────────────────────────────────────────────────────────────

describe('extractCalcom', () => {
  it('extrae un bloque CALCOM de tipo consult', () => {
    const text = `Agendemos. <<<CALCOM>>>{"type":"consult"}<<<END>>>`;
    const calcom = extractCalcom(text);
    expect(calcom?.type).toBe('consult');
  });

  it('extrae un bloque CALCOM de tipo interview', () => {
    const text = `<<<CALCOM>>>{"type":"interview"}<<<END>>>`;
    expect(extractCalcom(text)?.type).toBe('interview');
  });

  it('retorna null sin bloque CALCOM', () => {
    expect(extractCalcom('Texto normal sin bloques')).toBeNull();
  });
});

// ── cleanReply ───────────────────────────────────────────────────────────────

describe('cleanReply', () => {
  it('elimina bloque LEAD del texto visible', () => {
    const text = `Perfecto. <<<LEAD>>>{"type":"client","name":"X","email":"x@x.co","phone":null,"company":null,"service_requested":null,"budget":null,"timeline":null,"notes":""}<<<END>>> ¡Hasta pronto!`;
    const clean = cleanReply(text);
    expect(clean).not.toContain('<<<LEAD>>>');
    expect(clean).not.toContain('<<<END>>>');
    expect(clean).toContain('Perfecto');
    expect(clean).toContain('¡Hasta pronto!');
  });

  it('elimina bloque HANDOFF del texto visible', () => {
    const text = `Te conecto con Omar. <<<HANDOFF>>>{"summary":"urgente","urgency":"high"}<<<END>>>`;
    const clean = cleanReply(text);
    expect(clean).not.toContain('<<<HANDOFF>>>');
    expect(clean.trim()).toBe('Te conecto con Omar.');
  });

  it('elimina bloque CALCOM del texto visible', () => {
    const text = `Agenda aquí. <<<CALCOM>>>{"type":"consult"}<<<END>>> ¡Perfecto!`;
    const clean = cleanReply(text);
    expect(clean).not.toContain('<<<CALCOM>>>');
    expect(clean).toContain('Agenda aquí');
  });

  it('elimina múltiples bloques en el mismo mensaje', () => {
    const text = `Listo. <<<LEAD>>>{"type":"client","name":"Z","email":"z@z.co","phone":null,"company":null,"service_requested":null,"budget":null,"timeline":null,"notes":""}<<<END>>> <<<HANDOFF>>>{"summary":"ok","urgency":"low"}<<<END>>>`;
    const clean = cleanReply(text);
    expect(clean).not.toContain('<<<LEAD>>>');
    expect(clean).not.toContain('<<<HANDOFF>>>');
  });

  it('no modifica texto sin bloques', () => {
    const text = 'Hola, ¿en qué te puedo ayudar hoy?';
    expect(cleanReply(text)).toBe(text);
  });

  it('normaliza variantes <<<END> y <<<END>> antes de limpiar', () => {
    const text = `Texto. <<<LEAD>>>{"type":"client","name":"A","email":"a@a.co","phone":null,"company":null,"service_requested":null,"budget":null,"timeline":null,"notes":""}<<<END>`;
    const clean = cleanReply(text);
    expect(clean.trim()).toBe('Texto.');
  });
});
