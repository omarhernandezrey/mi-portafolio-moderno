export interface Objection {
  id: string;
  trigger: string[];
  acknowledge: { es: string; en: string; pt: string };
  reframe: { es: string; en: string; pt: string };
  proof: { es: string; en: string; pt: string };
  cta: { es: string; en: string; pt: string };
}

export const OBJECTIONS: Objection[] = [
  {
    id: 'too-expensive',
    trigger: ['caro', 'precio alto', 'fuera de presupuesto', 'expensive', 'too much'],
    acknowledge: { es: "Entiendo que el presupuesto es un factor decisivo.", en: "I understand that budget is a deciding factor.", pt: "Entendo que o orçamento é um fator decisivo." },
    reframe: { es: "Más que un gasto, es una inversión en una herramienta que trabajará 24/7 para tu negocio sin errores.", en: "More than an expense, it's an investment in a tool that will work 24/7 for your business without errors.", pt: "Mais do que um gasto, é um investimento em uma ferramenta que trabalhará 24 horas por dia, 7 dias por semana para o seu negócio, sem erros." },
    proof: { es: "Mis clientes recuperan la inversión en pocos meses gracias a la optimización de sus procesos.", en: "My clients recover their investment in a few months thanks to process optimization.", pt: "Meus clientes recuperam o investimento em poucos meses graças à otimização de seus processos." },
    cta: { es: "¿Te parece si ajustamos el alcance para que encaje en tu presupuesto actual?", en: "Should we adjust the scope to fit your current budget?", pt: "O que você acha de ajustarmos o escopo para que caiba no seu orçamento atual?" }
  },
  {
    id: 'competitor-cheaper',
    trigger: ['otro más barato', 'conseguí a alguien por la mitad', 'cheaper', 'half price'],
    acknowledge: { es: "Es cierto, siempre hay opciones de menor costo en el mercado.", en: "True, there are always lower-cost options in the market.", pt: "É verdade, sempre há opções de menor custo no mercado." },
    reframe: { es: "Lo barato suele salir caro en software: código difícil de mantener, lento o con fallos de seguridad.", en: "Cheap software usually ends up being expensive: hard to maintain, slow, or with security flaws.", pt: "O barato costuma sair caro em software: código difícil de manter, lento ou com falhas de segurança." },
    proof: { es: "Yo entrego código de calidad corporativa, documentado y listo para escalar.", en: "I deliver corporate-quality code, documented and ready to scale.", pt: "Eu entrego código de qualidade corporativa, documentado e pronto para escalar." },
    cta: { es: "¿Prefieres ahorrar hoy o tener un sistema robusto que no te dé problemas mañana?", en: "Do you prefer saving today or having a robust system that won't give you problems tomorrow?", pt: "Você prefere economizar hoje ou ter um sistema robusto que não lhe trará problemas amanhã?" }
  },
  {
    id: 'need-to-think',
    trigger: ['necesito pensarlo', 'voy a consultarlo', 'need to think', 'consult with'],
    acknowledge: { es: "Totalmente, es una decisión importante para tu negocio.", en: "Totally, it's an important decision for your business.", pt: "Com certeza, é uma decisão importante para o seu negócio." },
    reframe: { es: "Mientras lo piensas, tu competencia podría estar ya implementando una solución similar.", en: "While you're thinking about it, your competition might already be implementing a similar solution.", pt: "Enquanto você pensa, sua concorrência já pode estar implementando uma solução semelhante." },
    proof: { es: "El tiempo de desarrollo promedio es de 4-6 semanas; cada día cuenta.", en: "Average development time is 4-6 weeks; every day counts.", pt: "O tempo médio de desenvolvimento é de 4 a 6 semanas; cada dia conta." },
    cta: { es: "¿Hay alguna duda técnica específica que te impida decidirte ahora?", en: "Is there any specific technical doubt preventing you from deciding now?", pt: "Existe alguma dúvida técnica específica que o impeça de decidir agora?" }
  },
  {
    id: 'send-proposal',
    trigger: ['mándame propuesta', 'envíame los detalles', 'send me a proposal'],
    acknowledge: { es: "Claro que sí, me encantaría prepararte una propuesta formal.", en: "Of course, I'd love to prepare a formal proposal for you.", pt: "Com certeza, eu adoraria preparar uma proposta formal para você." },
    reframe: { es: "Para que sea precisa y no perdamos tiempo, necesito definir 4 puntos clave contigo.", en: "To make it accurate and save time, I need to define 4 key points with you.", pt: "Para que seja precisa e não percamos tempo, preciso definir 4 pontos-chave com você." },
    proof: { es: "Mis propuestas personalizadas tienen un 90% de éxito porque se ajustan a la realidad del cliente.", en: "My custom proposals have a 90% success rate because they fit the client's reality.", pt: "Minhas propostas personalizadas têm 90% de sucesso porque se ajustam à realidade do cliente." },
    cta: { es: "¿Podemos definir el objetivo, plazo, presupuesto y referencia visual ahora?", en: "Can we define the objective, deadline, budget, and visual reference now?", pt: "Podemos definir o objetivo, prazo, orçamento e referência visual agora?" }
  },
  {
    id: 'no-budget-now',
    trigger: ['no tengo dinero ahora', 'más adelante', 'no budget now', 'maybe later'],
    acknowledge: { es: "Entiendo perfectamente, el timing es fundamental.", en: "I perfectly understand, timing is essential.", pt: "Entendo perfeitamente, o timing é fundamental." },
    reframe: { es: "Podemos empezar con un MVP más pequeño y económico para que empieces a generar retorno.", en: "We can start with a smaller, more affordable MVP so you can start generating a return.", pt: "Podemos começar com um MVP menor e mais econômico para que você comece a gerar retorno." },
    proof: { es: "Muchos de mis grandes proyectos empezaron como una simple landing page.", en: "Many of my large projects started as a simple landing page.", pt: "Muitos dos meus grandes projetos começaram como uma simples landing page." },
    cta: { es: "¿Te interesaría conocer cómo sería esa versión mínima?", en: "Would you be interested in knowing what that minimum version would look like?", pt: "Você estaria interessado em saber como seria essa versão mínima?" }
  },
  {
    id: 'why-not-wordpress',
    trigger: ['por qué no wordpress', 'usa una plantilla', 'why not wordpress', 'use a template'],
    acknowledge: { es: "WordPress es genial para blogs simples.", en: "WordPress is great for simple blogs.", pt: "O WordPress é ótimo para blogs simples." },
    reframe: { es: "Pero para un negocio serio, una solución a medida en React/Next.js es superior en velocidad, SEO y seguridad.", en: "But for a serious business, a custom React/Next.js solution is superior in speed, SEO, and security.", pt: "Mas para um negócio sério, uma solução personalizada em React/Next.js é superior em velocidade, SEO e segurança." },
    proof: { es: "Mis sitios cargan en menos de 1 segundo, algo casi imposible en WordPress con muchos plugins.", en: "My sites load in less than 1 second, something almost impossible in WordPress with many plugins.", pt: "Meus sites carregam em menos de 1 segundo, algo quase impossível no WordPress com muitos plugins." },
    cta: { es: "¿Buscas una solución estándar o una ventaja competitiva real?", en: "Are you looking for a standard solution or a real competitive advantage?", pt: "Você busca uma solução padrão ou uma vantagem competitiva real?" }
  },
  {
    id: 'no-guarantees',
    trigger: ['qué garantías', 'no te conozco', 'guarantees', 'don\'t know you'],
    acknowledge: { es: "Es natural tener dudas al contratar a alguien nuevo.", en: "It's natural to have doubts when hiring someone new.", pt: "É natural ter dúvidas ao contratar alguém novo." },
    reframe: { es: "Mi trabajo habla por mí y ofrezco garantías reales por escrito.", en: "My work speaks for me, and I offer real written guarantees.", pt: "Meu trabalho fala por mim e ofereço garantias reais por escrito." },
    proof: { es: "Ofrezco 30 días de soporte gratuito y un contrato de servicios formal.", en: "I offer 30 days of free support and a formal service contract.", pt: "Ofereço 30 dias de suporte gratuito e um contrato de serviço formal." },
    cta: { es: "¿Te gustaría ver mis certificaciones o hablar con un cliente anterior?", en: "Would you like to see my certifications or speak with a previous client?", pt: "Você gostaria de ver minhas certificações ou falar com um cliente anterior?" }
  },
  {
    id: 'will-you-disappear',
    trigger: ['vas a desaparecer', 'te vas a ir', 'will you disappear'],
    acknowledge: { es: "Entiendo el miedo, he escuchado historias de terror con otros freelancers.", en: "I understand the fear; I've heard horror stories with other freelancers.", pt: "Entendo o medo, já ouvi histórias terríveis com outros freelancers." },
    reframe: { es: "Mi carrera se basa en mi reputación y la transparencia absoluta.", en: "My career is built on my reputation and absolute transparency.", pt: "Minha carreira se baseia na minha reputação e na transparência absoluta." },
    proof: { es: "Utilizo metodologías ágiles con entregas semanales para que siempre veas el avance.", en: "I use agile methodologies with weekly deliveries so you always see the progress.", pt: "Utilizo metodologias ágeis com entregas semanais para que você sempre veja o progresso." },
    cta: { es: "¿Te gustaría que estableciéramos hitos de pago por entregables?", en: "Would you like us to set payment milestones by deliverables?", pt: "Você gostaria que estabelecêssemos marcos de pagamento por entregáveis?" }
  },
  {
    id: 'formal-invoice',
    trigger: ['factura formal', 'tema fiscal', 'formal invoice', 'tax'],
    acknowledge: { es: "Claro que sí, la formalidad es parte de mi servicio profesional.", en: "Of course, formality is part of my professional service.", pt: "Com certeza, a formalidade faz parte do meu serviço profissional." },
    reframe: { es: "Como profesional independiente, puedo emitir los documentos necesarios para tu contabilidad.", en: "As an independent professional, I can issue the necessary documents for your accounting.", pt: "Como profissional independente, posso emitir os documentos necessários para a sua contabilidade." },
    proof: { es: "He trabajado con empresas en Colombia y el exterior sin problemas fiscales.", en: "I've worked with companies in Colombia and abroad without tax issues.", pt: "Já trabalhei com empresas na Colômbia e no exterior sem problemas fiscais." },
    cta: { es: "¿En qué país está registrada tu empresa para darte los detalles?", en: "In which country is your company registered to give you the details?", pt: "Em qual país sua empresa está registrada para que eu possa lhe dar os detalhes?" }
  },
  {
    id: 'nephew-can-do-it',
    trigger: ['mi sobrino sabe', 'yo mismo lo hago', 'nephew can do it', 'do it myself'],
    acknowledge: { es: "Es genial que tengas a alguien cercano con interés en la tecnología.", en: "It's great that you have someone close with an interest in technology.", pt: "É ótimo que você tenha alguém próximo interessado em tecnologia." },
    reframe: { es: "Sin embargo, un profesional senior aporta años de experiencia evitando errores costosos.", en: "However, a senior professional brings years of experience avoiding costly mistakes.", pt: "No entanto, um profissional sênior traz anos de experiência evitando erros dispendiosos." },
    proof: { es: "He arreglado muchos proyectos que empezaron así y terminaron siendo más caros por el retrabajo.", en: "I've fixed many projects that started that way and ended up being more expensive due to rework.", pt: "Já consertei muitos projetos que começaram assim e acabaram saindo mais caros pelo retrabalho." },
    cta: { es: "¿Buscas un experimento o una herramienta de negocio profesional?", en: "Are you looking for an experiment or a professional business tool?", pt: "Você busca um experimento ou uma ferramenta de negócio profissional?" }
  },
  {
    id: 'pay-at-the-end',
    trigger: ['pago al final', 'sin anticipo', 'pay at the end', 'no advance'],
    acknowledge: { es: "Entiendo que quieras proteger tu inversión.", en: "I understand you want to protect your investment.", pt: "Entendo que você queira proteger seu investimento." },
    reframe: { es: "El anticipo garantiza que reserve mi tiempo exclusivamente para tu proyecto.", en: "The advance payment ensures I reserve my time exclusively for your project.", pt: "O adiantamento garante que eu reserve meu tempo exclusivamente para o seu projeto." },
    proof: { es: "Es el estándar de la industria y asegura el compromiso de ambas partes.", en: "It's the industry standard and ensures commitment from both parties.", pt: "É o padrão da indústria e garante o compromisso de ambas as partes." },
    cta: { es: "¿Te parece si dividimos el proyecto en fases más pequeñas con pagos por cada una?", en: "How about we divide the project into smaller phases with payments for each?", pt: "Que tal dividirmos o projeto em fases menores com pagamentos por cada uma delas?" }
  },
  {
    id: 'someone-else-simpler',
    trigger: ['otro dev dijo simple', 'más fácil', 'simpler', 'easier'],
    acknowledge: { es: "A veces las cosas parecen más simples de lo que son en la superficie.", en: "Sometimes things seem simpler than they are on the surface.", pt: "Às vezes as coisas parecem mais simples do que são na superfície." },
    reframe: { es: "Yo prefiero ser honesto desde el principio sobre la complejidad técnica para evitar sorpresas.", en: "I prefer to be honest from the beginning about technical complexity to avoid surprises.", pt: "Eu prefiro ser honesto desde o início sobre a complexidade técnica para evitar surpresas." },
    proof: { es: "Un sistema 'simple' sin buena base suele fallar cuando crece el número de usuarios.", en: "A 'simple' system without a good foundation usually fails when the number of users grows.", pt: "Um sistema 'simples' sem uma boa base costuma falhar quando o número de usuários cresce." },
    cta: { es: "¿Quieres que te explique por qué mi enfoque garantiza la escalabilidad?", en: "Would you like me to explain why my approach guarantees scalability?", pt: "Você quer que eu explique por que minha abordagem garante a escalabilidade?" }
  }
];
