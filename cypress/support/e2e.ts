// Comandos personalizados.
// Ojo: NO usar button[type="submit"] genérico — el formulario de contacto de
// la página también lo matchea y el click termina en el botón equivocado.
Cypress.Commands.add('abrirChat', () => {
  cy.get('[data-testid="chat-toggle"]').click();
  cy.get('[data-testid="chat-input"]', { timeout: 5000 }).should('exist');
});

// El input está disabled hasta aceptar el consentimiento GDPR
Cypress.Commands.add('aceptarConsentimiento', () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button:contains("Acepto y Continuar"), button:contains("Accept and Continue")');
    if (btn.length) {
      cy.wrap(btn.first()).click();
    }
  });
  cy.get('[data-testid="chat-input"]').should('not.be.disabled');
});

Cypress.Commands.add('enviarMensajeChat', (mensaje: string) => {
  cy.aceptarConsentimiento();
  cy.get('[data-testid="chat-input"]').type(mensaje);
  cy.get('[data-testid="chat-send"]').click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      abrirChat(): Chainable<void>;
      aceptarConsentimiento(): Chainable<void>;
      enviarMensajeChat(mensaje: string): Chainable<void>;
    }
  }
}
