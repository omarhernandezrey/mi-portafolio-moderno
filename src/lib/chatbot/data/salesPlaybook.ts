export const SALES_PLAYBOOK = {
  discoveryQuestions: {
    es: [
      { category: 'situation', question: "¿Qué tienes hoy funcionando en tu presencia digital?" },
      { category: 'problem', question: "¿Qué es lo que más te frustra de tu solución actual?" },
      { category: 'implication', question: "¿Cuánto tiempo o dinero crees que estás perdiendo por no resolver esto?" },
      { category: 'need-payoff', question: "¿Qué impacto tendría en tu negocio tener esto listo en 4-6 semanas?" },
      { category: 'situation', question: "¿Ya tienes un diseño o empezamos desde cero con Figma?" },
      { category: 'problem', question: "¿Tu sitio actual es lento o difícil de actualizar?" },
      { category: 'implication', question: "¿Has notado si los clientes se van por la lentitud de la página?" },
      { category: 'need-payoff', question: "¿Cómo cambiaría tu día a día tener un panel administrativo a medida?" },
      { category: 'situation', question: "¿Qué stack tecnológico están usando actualmente?" },
      { category: 'problem', question: "¿El costo de mantenimiento actual es demasiado elevado?" },
      { category: 'implication', question: "¿Cómo está afectando esto a la moral de tu equipo técnico?" },
      { category: 'need-payoff', question: "¿Qué tan valioso sería reducir los tiempos de carga a la mitad?" },
      { category: 'situation', question: "¿Cuántos usuarios activos manejas mensualmente?" },
      { category: 'problem', question: "¿Te preocupa la escalabilidad ante un pico de tráfico?" },
      { category: 'implication', question: "¿Cuánto pierdes por cada hora que el sistema está caído?" },
      { category: 'need-payoff', question: "¿Cómo mejoraría tu tasa de conversión con un flujo de pago optimizado?" },
      { category: 'situation', question: "¿Tienen ya un presupuesto aprobado para este proyecto?" },
      { category: 'problem', question: "¿La falta de integraciones automáticas les obliga a hacer mucho trabajo manual?" },
      { category: 'implication', question: "¿Cuántos leads están dejando de captar por no tener un chatbot 24/7?" },
      { category: 'need-payoff', question: "¿Cómo impactaría en tu ROI automatizar el 80% de las consultas frecuentes?" }
    ],
    en: [
      { category: 'situation', question: "What do you currently have working in your digital presence?" },
      { category: 'problem', question: "What frustrates you the most about your current solution?" },
      { category: 'implication', question: "How much time or money do you think you're losing by not solving this?" },
      { category: 'need-payoff', question: "What impact would it have on your business to have this ready in 4-6 weeks?" },
      { category: 'situation', question: "Do you already have a design or should we start from scratch with Figma?" },
      { category: 'problem', question: "Is your current site slow or difficult to update?" },
      { category: 'implication', question: "Have you noticed if customers leave due to page slowness?" },
      { category: 'need-payoff', question: "How would your daily routine change by having a custom admin panel?" },
      { category: 'situation', question: "What technology stack are you currently using?" },
      { category: 'problem', question: "Is the current maintenance cost too high?" },
      { category: 'implication', question: "How is this affecting your technical team's morale?" },
      { category: 'need-payoff', question: "How valuable would it be to cut loading times by half?" },
      { category: 'situation', question: "How many monthly active users do you handle?" },
      { category: 'problem', question: "Are you concerned about scalability during traffic spikes?" },
      { category: 'implication', question: "How much do you lose for every hour the system is down?" },
      { category: 'need-payoff', question: "How would your conversion rate improve with an optimized checkout flow?" },
      { category: 'situation', question: "Do you already have an approved budget for this project?" },
      { category: 'problem', question: "Does the lack of automatic integrations force you to do a lot of manual work?" },
      { category: 'implication', question: "How many leads are you missing out on by not having a 24/7 chatbot?" },
      { category: 'need-payoff', question: "How would it impact your ROI to automate 80% of frequent queries?" }
    ]
  },
  qualificationBANT: {
    es: {
      budget: "Entiendo perfectamente. Para proyectos con esta complejidad, el rango de inversión suele estar entre {min} y {max} USD. ¿Este presupuesto se alinea con lo que tenías proyectado para esta etapa?",
      authority: "¿Tú eres quien lidera la decisión técnica del proyecto o hay otros stakeholders (como socios o directores) con quienes debamos validar la propuesta final?",
      need: "Basado en lo que hemos hablado, tu prioridad número uno es {need} para evitar que el negocio se vea afectado. ¿Estamos en la misma página?",
      timeline: "¿Cuál es tu fecha ideal de lanzamiento? Saber esto me ayuda a organizar mi agenda y garantizar que lleguemos con la máxima calidad.",
      analysis: "Antes de avanzar, ¿qué tan crítico es para ustedes que la solución sea escalable a largo plazo vs. un lanzamiento rápido hoy?",
      competition: "¿Estás evaluando otras opciones o proveedores actualmente para comparar enfoques?"
    },
    en: {
      budget: "I completely understand. For projects of this complexity, the investment range is usually between {min} and {max} USD. Does this budget align with what you had projected for this stage?",
      authority: "Are you leading the technical decision for the project, or are there other stakeholders (like partners or directors) we should validate the final proposal with?",
      need: "Based on what we've discussed, your number one priority is {need} to prevent the business from being affected. Are we on the same page?",
      timeline: "What is your ideal launch date? Knowing this helps me organize my schedule and ensure we deliver with the highest quality.",
      analysis: "Before moving forward, how critical is it for you that the solution is scalable in the long term vs. a quick launch today?",
      competition: "Are you currently evaluating other options or vendors to compare approaches?"
    }
  },
  closingTechniques: {
    es: [
      { name: "Alternativa", example: "¿Te parece bien si agendamos la llamada inicial para este martes a las 10am o prefieres el jueves por la tarde?" },
      { name: "Escasez", example: "Actualmente tengo cupo para iniciar solo un proyecto de gran escala este mes. Si reservamos hoy, aseguramos tu espacio." },
      { name: "Riesgo Invertido", example: "Mi prioridad es tu satisfacción. Si tras la primera semana no ves el valor que esperas, cancelamos el contrato y te devuelvo el anticipo." },
      { name: "Suma de Sí", example: "Entonces, ¿buscamos una web rápida, conectada a tu inventario y que se pueda lanzar antes del Cyber Monday? ¡Démosle gas!" },
      { name: "Urgencia", example: "Si logramos cerrar los detalles del brief esta semana, puedo comprometerme a tener el MVP listo antes de tu reunión con inversores." },
      { name: "Cierre Directo", example: "Tengo claridad total sobre el problema. ¿Quieres que te envíe el link de pago para empezar con el setup del repositorio hoy mismo?" },
      { name: "Técnica del Cachorro", example: "Probemos con la consultoría inicial de una hora. Si no sientes que te dio claridad absoluta sobre el camino a seguir, no me pagas nada." },
      { name: "Cierre Negativo", example: "Si sientes que todavía no es el momento adecuado para invertir en calidad, no hay problema. Podemos hablar cuando estés listo para escalar." },
      { name: "Cierre de Ben Franklin", example: "Hagamos una lista: por un lado los beneficios de lanzar hoy mismo y por otro las dudas. Verás que el valor supera cualquier riesgo." },
      { name: "Cierre de la Próxima Semana", example: "¿Quieres que empecemos con el diseño este lunes o preferirías que Omar se encargue de la infraestructura primero?" }
    ],
    en: [
      { name: "Alternative", example: "Does scheduling the initial call for this Tuesday at 10am work for you, or do you prefer Thursday afternoon?" },
      { name: "Scarcity", example: "I currently have space to start only one large-scale project this month. If we book today, we secure your spot." },
      { name: "Inverted Risk", example: "My priority is your satisfaction. If after the first week you don't see the value you expect, we cancel the contract and I'll refund your advance." },
      { name: "Sum of Yes", example: "So, we are looking for a fast site, connected to your inventory, and ready to launch before Cyber Monday? Let's go for it!" },
      { name: "Urgency", example: "If we can finalize the brief details this week, I can commit to having the MVP ready before your investor meeting." },
      { name: "Direct Close", example: "I have total clarity on the problem. Do you want me to send you the payment link to start with the repository setup today?" },
      { name: "Puppy Dog Close", example: "Let's try the initial one-hour consultancy. If you don't feel it gave you absolute clarity on the way forward, you don't owe me anything." },
      { name: "Negative Close", example: "If you feel it's not the right time to invest in quality yet, no problem. We can talk when you're ready to scale." },
      { name: "Ben Franklin Close", example: "Let's make a list: on one side the benefits of launching today and on the other the doubts. You'll see the value outweighs any risk." },
      { name: "Next Week Close", example: "Would you like to start with the design this Monday or would you prefer Omar to handle the infrastructure first?" }
    ]
  },
  nextSteps: {
    es: [
      { level: 'cold', action: "Te comparto este caso de éxito similar a lo que buscas para que veas cómo resolví un reto parecido.", cta: "Ver proyecto" },
      { level: 'warm', action: "¿Te parece si agendamos 15 min para aterrizar los detalles técnicos y darte un presupuesto exacto?", cta: "Agendar en Cal.com" },
      { level: 'hot', action: "¡Excelente! Solo necesito que me confirmes el brief final para enviarte el link de anticipo y reservar mi disponibilidad.", cta: "Enviar Brief" },
      { level: 'follow-up', action: "Sigo pensando en tu proyecto de {service}. He tenido una idea para la integración. ¿Hablamos?", cta: "Reanudar chat" },
      { level: 'onboarding', action: "Pago recibido. Aquí tienes el acceso a tu dashboard de proyecto para que veas el avance en tiempo real.", cta: "Ir a Admin" },
      { level: 'discovery-call', action: "He preparado una agenda para nuestra llamada. ¿Te gustaría revisarla antes?", cta: "Ver Agenda" },
      { level: 'post-proposal', action: "¿Pudiste revisar la propuesta que te envié? Tengo un par de ideas extra.", cta: "Revisar Propuesta" }
    ],
    en: [
      { level: 'cold', action: "I'll share this success story similar to what you're looking for so you can see how I solved a similar challenge.", cta: "See project" },
      { level: 'warm', action: "Should we schedule 15 minutes to pin down the technical details and give you an exact quote?", cta: "Schedule on Cal.com" },
      { level: 'hot', action: "Excellent! I just need you to confirm the final brief so I can send you the advance payment link and reserve my availability.", cta: "Send Brief" },
      { level: 'follow-up', action: "I'm still thinking about your {service} project. I had an idea for the integration. Should we talk?", cta: "Resume chat" },
      { level: 'onboarding', action: "Payment received. Here is access to your project dashboard so you can see progress in real-time.", cta: "Go to Admin" },
      { level: 'discovery-call', action: "I've prepared an agenda for our call. Would you like to review it beforehand?", cta: "See Agenda" },
      { level: 'post-proposal', action: "Were you able to review the proposal I sent? I have a couple of extra ideas.", cta: "Review Proposal" }
    ]
  },
  scripts: {
    es: {
      initialContact: "Hola, soy el asistente de Omar. He visto que te interesa {topic}. Para ayudarte mejor, ¿es un proyecto nuevo o una mejora de algo existente?",
      pricingObjection: "Entiendo que el precio sea un factor. Mis tarifas reflejan la garantía de un código mantenible que no te dará dolores de cabeza en 6 meses. ¿Prefieres ahorrar hoy o ahorrar en reparaciones mañana?",
      agileProcess: "Omar trabaja con metodologías ágiles. Esto significa que verás avances funcionales cada semana y no al final de dos meses. ¿Qué tan importante es para ti tener visibilidad continua?",
      stackRecommendation: "Para un proyecto de {service}, Omar recomienda usar Next.js y Supabase por su rapidez de desarrollo y escalabilidad. ¿Tienes alguna preferencia técnica distinta?",
      qualityGuarantee: "Cada línea de código que entrega Omar pasa por una auditoría rigurosa. No solo entregamos funcionalidad, entregamos tranquilidad técnica."
    },
    en: {
      initialContact: "Hi, I'm Omar's assistant. I see you're interested in {topic}. To help you better, is this a new project or an improvement on something existing?",
      pricingObjection: "I understand that price is a factor. My rates reflect the guarantee of maintainable code that won't give you headaches in 6 months. Do you prefer to save today or save on repairs tomorrow?",
      agileProcess: "Omar works with agile methodologies. This means you'll see functional progress every week rather than just at the end of two months. How important is continuous visibility to you?",
      stackRecommendation: "For a {service} project, Omar recommends using Next.js and Supabase for their development speed and scalability. Do you have any different technical preference?",
      qualityGuarantee: "Every line of code Omar delivers undergoes a rigorous audit. We don't just deliver functionality, we deliver technical peace of mind."
    }
  },
  objectionHandlingStrategy: {
    es: {
      empathyFirst: "Nunca discutas con el cliente. Valida su preocupación primero: 'Entiendo perfectamente que {concern} sea importante para ti'.",
      reframeToValue: "Desplaza la conversación del costo al valor: 'Más que un gasto, esto es una inversión en {benefit} que te ahorrará {pain} en el futuro'.",
      socialProof: "Cita casos anteriores: 'Precisamente ayudé a un cliente con un reto similar en {industry} y logramos {result}'.",
      clarityOverConfusion: "Si el cliente está confundido, simplifica: 'Básicamente, lo que haremos es {action} para lograr {goal}'."
    },
    en: {
      empathyFirst: "Never argue with the client. Validate their concern first: 'I completely understand that {concern} is important to you'.",
      reframeToValue: "Shift the conversation from cost to value: 'More than an expense, this is an investment in {benefit} that will save you {pain} in the future'.",
      socialProof: "Cite previous cases: 'I actually helped a client with a similar challenge in {industry} and we achieved {result}'.",
      clarityOverConfusion: "If the client is confused, simplify: 'Basically, what we'll do is {action} to achieve {goal}'."
    }
  }
};
