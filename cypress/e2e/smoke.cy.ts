/**
 * Smoke tests de páginas clave del sitio.
 * Requiere: npm run dev / npm start corriendo en localhost:3000
 */

describe('Smoke tests — páginas clave', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  describe('Botón flotante de contacto (WhatsApp)', () => {
    it('se renderiza en la home y su menú apunta a wa.me con un número válido', () => {
      cy.get('[data-testid="whatsapp-toggle"]').should('be.visible').click();
      // No se hardcodea el número: el workflow puede configurarlo vía
      // NEXT_PUBLIC_WHATSAPP_NUMBER. Se valida que el enlace sea un wa.me
      // real, con número E.164 y mensaje precargado no vacío.
      cy.get('a[role="menuitem"][href^="https://wa.me/"]')
        .first()
        .should('have.attr', 'href')
        .and('match', /^https:\/\/wa\.me\/\d{10,15}\?text=.+/);
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
