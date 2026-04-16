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
      { category: 'need-payoff', question: "¿Cómo cambiaría tu día a día tener un panel administrativo a medida?" }
    ],
    en: [
      { category: 'situation', question: "What do you currently have working in your digital presence?" },
      { category: 'problem', question: "What frustrates you the most about your current solution?" },
      { category: 'implication', question: "How much time or money do you think you're losing by not solving this?" },
      { category: 'need-payoff', question: "What impact would it have on your business to have this ready in 4-6 weeks?" },
      { category: 'situation', question: "Do you already have a design or should we start from scratch with Figma?" },
      { category: 'problem', question: "Is your current site slow or difficult to update?" },
      { category: 'implication', question: "Have you noticed if customers leave due to page slowness?" },
      { category: 'need-payoff', question: "How would your daily routine change by having a custom admin panel?" }
    ]
  },
  qualificationBANT: {
    es: {
      budget: "Entiendo. Para proyectos de este tipo, el rango suele estar entre {min} y {max} USD. ¿Este presupuesto se alinea con lo que tenías en mente?",
      authority: "¿Tú lideras la decisión técnica o hay alguien más con quien debamos validar el stack?",
      need: "Por lo que me cuentas, tu prioridad es {need}. ¿Es correcto?",
      timeline: "¿Para cuándo necesitas tener la primera versión en producción?"
    },
    en: {
      budget: "I understand. For projects of this type, the range is usually between {min} and {max} USD. Does this budget align with what you had in mind?",
      authority: "Are you the technical decision-maker or is there someone else we should validate the stack with?",
      need: "From what you're telling me, your priority is {need}. Is that correct?",
      timeline: "When do you need to have the first version in production?"
    }
  },
  closingTechniques: {
    es: [
      { name: "Alternativa", example: "¿Te parece bien si agendamos la llamada inicial para este martes o prefieres el jueves?" },
      { name: "Escasez", example: "Actualmente tengo cupo para iniciar solo 2 proyectos este mes para garantizar la máxima calidad." },
      { name: "Riesgo Invertido", example: "Si en la primera semana de trabajo no estás conforme con el avance, te devuelvo el anticipo sin preguntas." },
      { name: "Suma de Sí", example: "Entonces, ¿buscamos un sitio rápido, que sea fácil de administrar y que esté listo en un mes? ¡Vamos a por ello!" },
      { name: "Urgencia", example: "Si empezamos esta semana, alcanzamos a lanzar antes de tu fecha límite." }
    ],
    en: [
      { name: "Alternative", example: "Does scheduling the initial call for this Tuesday work for you, or do you prefer Thursday?" },
      { name: "Scarcity", example: "I currently have space to start only 2 projects this month to ensure the highest quality." },
      { name: "Inverted Risk", example: "If in the first week of work you are not satisfied with the progress, I'll refund your advance payment, no questions asked." },
      { name: "Sum of Yes", example: "So, we are looking for a fast site, easy to manage, and ready in a month? Let's do it!" },
      { name: "Urgency", example: "If we start this week, we can launch before your deadline." }
    ]
  },
  nextSteps: {
    es: [
      { level: 'cold', action: "Te comparto este caso de éxito similar a lo que buscas.", cta: "Ver proyecto" },
      { level: 'warm', action: "¿Te parece si agendamos 15 min para aterrizar los detalles técnicos?", cta: "Agendar en Cal.com" },
      { level: 'hot', action: "¡Genial! Solo necesito que me confirmes el brief para enviarte el link de anticipo y empezar de una.", cta: "Enviar Brief" }
    ],
    en: [
      { level: 'cold', action: "I'll share this success story similar to what you're looking for.", cta: "See project" },
      { level: 'warm', action: "Should we schedule 15 minutes to pin down the technical details?", cta: "Schedule on Cal.com" },
      { level: 'hot', action: "Great! I just need you to confirm the brief so I can send you the advance payment link and start right away.", cta: "Send Brief" }
    ]
  }
};
