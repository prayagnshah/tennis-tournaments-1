describe('Authentication', function () {
    it('Can log in.', function () {
      cy.visit('/#/log-in');
      cy.get('input#username').type('gary.cole@example.com');
      cy.get('input#password').type('pAssw0rd', { log: false });  // Adding { log: false } to the type() function prevents Cypress from printing the content on the screen. Use it to hide sensitive information like passwords.
      cy.get('button').contains('Log in').click();
      cy.hash().should('eq', '#/');
    });

    it('Can sign up.', function () {
        cy.visit('/#/sign-up');
        cy.get('input#username').type('gary.cole@example.com');
        cy.get('input#firstName').type('Gary');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('button').contains('Sign up').click();
        cy.hash().should('eq', '#/log-in');
      });
  });
