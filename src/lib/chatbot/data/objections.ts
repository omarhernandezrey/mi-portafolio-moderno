export interface Objection {
  id: string;
  trigger: string[];
  acknowledge: { es: string; en: string };
  reframe: { es: string; en: string };
  proof: { es: string; en: string };
  cta: { es: string; en: string };
}

export const OBJECTIONS: Objection[] = [
  {
    id: 'too-expensive',
    trigger: ['caro', 'precio alto', 'fuera de presupuesto', 'expensive', 'too much'],
    acknowledge: { es: "Entiendo que el presupuesto es un factor decisivo.", en: "I understand that budget is a deciding factor." },
    reframe: { es: "Más que un gasto, es una inversión en una herramienta que trabajará 24/7 para tu negocio sin errores.", en: "More than an expense, it's an investment in a tool that will work 24/7 for your business without errors." },
    proof: { es: "Mis clientes recuperan la inversión en pocos meses gracias a la optimización de sus procesos.", en: "My clients recover their investment in a few months thanks to process optimization." },
    cta: { es: "¿Te parece si ajustamos el alcance para que encaje en tu presupuesto actual?", en: "Should we adjust the scope to fit your current budget?" }
  },
  {
    id: 'competitor-cheaper',
    trigger: ['otro más barato', 'conseguí a alguien por la mitad', 'cheaper', 'half price'],
    acknowledge: { es: "Es cierto, siempre hay opciones de menor costo en el mercado.", en: "True, there are always lower-cost options in the market." },
    reframe: { es: "Lo barato suele salir caro en software: código difícil de mantener, lento o con fallos de seguridad.", en: "Cheap software usually ends up being expensive: hard to maintain, slow, or with security flaws." },
    proof: { es: "Yo entrego código de calidad corporativa, documentado y listo para escalar.", en: "I deliver corporate-quality code, documented and ready to scale." },
    cta: { es: "¿Prefieres ahorrar hoy o tener un sistema robusto que no te dé problemas mañana?", en: "Do you prefer saving today or having a robust system that won't give you problems tomorrow?" }
  },
  {
    id: 'need-to-think',
    trigger: ['necesito pensarlo', 'voy a consultarlo', 'need to think', 'consult with'],
    acknowledge: { es: "Totalmente, es una decisión importante para tu negocio.", en: "Totally, it's an important decision for your business." },
    reframe: { es: "Mientras lo piensas, tu competencia podría estar ya implementando una solución similar.", en: "While you're thinking about it, your competition might already be implementing a similar solution." },
    proof: { es: "El tiempo de desarrollo promedio es de 4-6 semanas; cada día cuenta.", en: "Average development time is 4-6 weeks; every day counts." },
    cta: { es: "¿Hay alguna duda técnica específica que te impida decidirte ahora?", en: "Is there any specific technical doubt preventing you from deciding now?" }
  },
  {
    id: 'send-proposal',
    trigger: ['mándame propuesta', 'envíame los detalles', 'send me a proposal'],
    acknowledge: { es: "Claro que sí, me encantaría prepararte una propuesta formal.", en: "Of course, I'd love to prepare a formal proposal for you." },
    reframe: { es: "Para que sea precisa y no perdamos tiempo, necesito definir 4 puntos clave contigo.", en: "To make it accurate and save time, I need to define 4 key points with you." },
    proof: { es: "Mis propuestas personalizadas tienen un 90% de éxito porque se ajustan a la realidad del cliente.", en: "My custom proposals have a 90% success rate because they fit the client's reality." },
    cta: { es: "¿Podemos definir el objetivo, plazo, presupuesto y referencia visual ahora?", en: "Can we define the objective, deadline, budget, and visual reference now?" }
  },
  {
    id: 'no-budget-now',
    trigger: ['no tengo dinero ahora', 'más adelante', 'no budget now', 'maybe later'],
    acknowledge: { es: "Entiendo perfectamente, el timing es fundamental.", en: "I perfectly understand, timing is essential." },
    reframe: { es: "Podemos empezar con un MVP más pequeño y económico para que empieces a generar retorno.", en: "We can start with a smaller, more affordable MVP so you can start generating a return." },
    proof: { es: "Muchos de mis grandes proyectos empezaron como una simple landing page.", en: "Many of my large projects started as a simple landing page." },
    cta: { es: "¿Te interesaría conocer cómo sería esa versión mínima?", en: "Would you be interested in knowing what that minimum version would look like?" }
  },
  {
    id: 'why-not-wordpress',
    trigger: ['por qué no wordpress', 'usa una plantilla', 'why not wordpress', 'use a template'],
    acknowledge: { es: "WordPress es genial para blogs simples.", en: "WordPress is great for simple blogs." },
    reframe: { es: "Pero para un negocio serio, una solución a medida en React/Next.js es superior en velocidad, SEO y seguridad.", en: "But for a serious business, a custom React/Next.js solution is superior in speed, SEO, and security." },
    proof: { es: "Mis sitios cargan en menos de 1 segundo, algo casi imposible en WordPress con muchos plugins.", en: "My sites load in less than 1 second, something almost impossible in WordPress with many plugins." },
    cta: { es: "¿Buscas una solución estándar o una ventaja competitiva real?", en: "Are you looking for a standard solution or a real competitive advantage?" }
  },
  {
    id: 'no-guarantees',
    trigger: ['qué garantías', 'no te conozco', 'guarantees', 'don\'t know you'],
    acknowledge: { es: "Es natural tener dudas al contratar a alguien nuevo.", en: "It's natural to have doubts when hiring someone new." },
    reframe: { es: "Mi trabajo habla por mí y ofrezco garantías reales por escrito.", en: "My work speaks for me, and I offer real written guarantees." },
    proof: { es: "Ofrezco 30 días de soporte gratuito y un contrato de servicios formal.", en: "I offer 30 days of free support and a formal service contract." },
    cta: { es: "¿Te gustaría ver mis certificaciones o hablar con un cliente anterior?", en: "Would you like to see my certifications or speak with a previous client?" }
  },
  {
    id: 'will-you-disappear',
    trigger: ['vas a desaparecer', 'te vas a ir', 'will you disappear'],
    acknowledge: { es: "Entiendo el miedo, he escuchado historias de terror con otros freelancers.", en: "I understand the fear; I've heard horror stories with other freelancers." },
    reframe: { es: "Mi carrera se basa en mi reputación y la transparencia absoluta.", en: "My career is built on my reputation and absolute transparency." },
    proof: { es: "Utilizo metodologías ágiles con entregas semanales para que siempre veas el avance.", en: "I use agile methodologies with weekly deliveries so you always see the progress." },
    cta: { es: "¿Te gustaría que estableciéramos hitos de pago por entregables?", en: "Would you like us to set payment milestones by deliverables?" }
  },
  {
    id: 'formal-invoice',
    trigger: ['factura formal', 'tema fiscal', 'formal invoice', 'tax'],
    acknowledge: { es: "Claro que sí, la formalidad es parte de mi servicio profesional.", en: "Of course, formality is part of my professional service." },
    reframe: { es: "Como profesional independiente, puedo emitir los documentos necesarios para tu contabilidad.", en: "As an independent professional, I can issue the necessary documents for your accounting." },
    proof: { es: "He trabajado con empresas en Colombia y el exterior sin problemas fiscales.", en: "I've worked with companies in Colombia and abroad without tax issues." },
    cta: { es: "¿En qué país está registrada tu empresa para darte los detalles?", en: "In which country is your company registered to give you the details?" }
  },
  {
    id: 'nephew-can-do-it',
    trigger: ['mi sobrino sabe', 'yo mismo lo hago', 'nephew can do it', 'do it myself'],
    acknowledge: { es: "Es genial que tengas a alguien cercano con interés en la tecnología.", en: "It's great that you have someone close with an interest in technology." },
    reframe: { es: "Sin embargo, un profesional senior aporta años de experiencia evitando errores costosos.", en: "However, a senior professional brings years of experience avoiding costly mistakes." },
    proof: { es: "He arreglado muchos proyectos que empezaron así y terminaron siendo más caros por el retrabajo.", en: "I've fixed many projects that started that way and ended up being more expensive due to rework." },
    cta: { es: "¿Buscas un experimento o una herramienta de negocio profesional?", en: "Are you looking for an experiment or a professional business tool?" }
  },
  {
    id: 'pay-at-the-end',
    trigger: ['pago al final', 'sin anticipo', 'pay at the end', 'no advance'],
    acknowledge: { es: "Entiendo que quieras proteger tu inversión.", en: "I understand you want to protect your investment." },
    reframe: { es: "El anticipo garantiza que reserve mi tiempo exclusivamente para tu proyecto.", en: "The advance payment ensures I reserve my time exclusively for your project." },
    proof: { es: "Es el estándar de la industria y asegura el compromiso de ambas partes.", en: "It's the industry standard and ensures commitment from both parties." },
    cta: { es: "¿Te parece si dividimos el proyecto en fases más pequeñas con pagos por cada una?", en: "How about we divide the project into smaller phases with payments for each?" }
  },
  {
    id: 'someone-else-simpler',
    trigger: ['otro dev dijo simple', 'más fácil', 'simpler', 'easier'],
    acknowledge: { es: "A veces las cosas parecen más simples de lo que son en la superficie.", en: "Sometimes things seem simpler than they are on the surface." },
    reframe: { es: "Yo prefiero ser honesto desde el principio sobre la complejidad técnica para evitar sorpresas.", en: "I prefer to be honest from the beginning about technical complexity to avoid surprises." },
    proof: { es: "Un sistema 'simple' sin buena base suele fallar cuando crece el número de usuarios.", en: "A 'simple' system without a good foundation usually fails when the number of users grows." },
    cta: { es: "¿Quieres que te explique por qué mi enfoque garantiza la escalabilidad?", en: "Would you like me to explain why my approach guarantees scalability?" }
  }
];
