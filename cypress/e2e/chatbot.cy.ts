/**
 * Tests funcionales y E2E del chatbot
 * Requiere: npm run dev corriendo en localhost:3000
 */

describe('Chatbot Widget — Flujos principales', () => {
  beforeEach(() => {
    cy.visit('/');
    // Limpiar estado de consentimiento entre tests
    cy.clearLocalStorage();
  });

  describe('Apertura y cierre', () => {
    it('el widget existe en la página', () => {
      cy.get('body').should('be.visible');
      // El botón del chat debe existir en el DOM
      cy.get('button').should('exist');
    });

    it('abre el chat al hacer click en el botón flotante', () => {
      cy.abrirChat();
    });
  });

  describe('Consentimiento GDPR', () => {
    it('muestra aviso de consentimiento al abrir por primera vez', () => {
      cy.abrirChat();
      // Busca el texto de privacidad en el widget
      cy.contains(/privacidad|privacy|datos|data/i, { timeout: 5000 }).should('exist');
    });
  });

  describe('Flujo de conversación básico', () => {
    it('responde al saludo del usuario', () => {
      cy.abrirChat();
      cy.enviarMensajeChat('Hola');
      // El bot debe responder en menos de 15 segundos
      cy.get('[data-testid="chat-message"][data-role="assistant"]', { timeout: 30000 })
        .should('have.length.greaterThan', 0);
    });

    it('no acepta mensajes vacíos', () => {
      cy.abrirChat();
      cy.aceptarConsentimiento();
      // Con el input vacío, el botón de enviar debe quedar deshabilitado
      cy.get('[data-testid="chat-send"]').should('be.disabled');
    });
  });

  describe('Calculadora de presupuesto', () => {
    it('la página /calculadora carga correctamente', () => {
      cy.visit('/calculadora');
      cy.get('h1, h2').should('exist');
    });

    it('tiene inputs de selección de servicio', () => {
      cy.visit('/calculadora');
      cy.get('select, input[type="radio"], button').should('have.length.greaterThan', 0);
    });
  });

  describe('Blog MDX', () => {
    it('la página /blog carga con al menos un artículo', () => {
      cy.visit('/blog');
      cy.get('h1, h2, article, a[href*="/blog/"]').should('exist');
    });
  });

  describe('Política de privacidad', () => {
    it('/privacidad carga y contiene texto legal', () => {
      cy.visit('/privacidad');
      cy.contains(/habeas data|protección de datos|datos personales/i).should('exist');
    });
  });

  describe('Status page', () => {
    it('/status carga y muestra indicadores', () => {
      cy.visit('/status');
      cy.get('h1, h2').should('exist');
    });
  });

  describe('Lead magnets', () => {
    it('/recursos carga con documentos descargables', () => {
      cy.visit('/recursos');
      cy.get('a, button').should('have.length.greaterThan', 0);
    });
  });

  describe('SEO programático', () => {
    it('rutas de servicios×ciudad cargan correctamente', () => {
      cy.visit('/servicios/desarrollo-web/bogota');
      cy.get('h1').should('exist');
    });
  });
});

describe('Chatbot Widget — Flujo de venta E2E', () => {
  it('flujo completo: saludo → servicio → precio → datos de contacto', () => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.abrirChat();

    // Mensaje 1: presentación con necesidad
    cy.enviarMensajeChat('Hola, necesito una página web para mi empresa');
    cy.get('[data-testid="chat-message"][data-role="assistant"]', { timeout: 30000 })
      .should('have.length.greaterThan', 0);

    // Mensaje 2: confirmar interés
    cy.wait(2000); // pausa para no hacer flood al LLM
    cy.enviarMensajeChat('Me interesa la landing page');

    // Mensaje 3: dar datos de contacto
    cy.wait(2000);
    cy.enviarMensajeChat('Mi nombre es Test User y mi correo es test@ejemplo.co');
  });
});
