import '@testing-library/cypress';

// Comandos personalizados
Cypress.Commands.add('abrirChat', () => {
  cy.get('[data-testid="chat-toggle"], button[aria-label*="chat" i], button[aria-label*="asistente" i]')
    .first()
    .click();
  cy.get('[data-testid="chat-input"], input[placeholder*="mensaje" i], textarea[placeholder*="mensaje" i]', { timeout: 5000 })
    .should('be.visible');
});

Cypress.Commands.add('enviarMensajeChat', (mensaje: string) => {
  cy.get('[data-testid="chat-input"], input[placeholder*="mensaje" i], textarea[placeholder*="mensaje" i]')
    .type(mensaje);
  cy.get('[data-testid="chat-send"], button[aria-label*="enviar" i], button[type="submit"]')
    .first()
    .click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      abrirChat(): Chainable<void>;
      enviarMensajeChat(mensaje: string): Chainable<void>;
    }
  }
}
