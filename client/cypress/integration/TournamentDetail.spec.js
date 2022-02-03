const logIn = () => {
  const { username, password } = Cypress.env("credentials");

  // Capture HTTP requests.
  cy.intercept("POST", "log_in").as("logIn");

  // Log into the app.
  cy.visit("/#/log-in");
  cy.get("input#username").type(username);
  cy.get("input#password").type(password, { log: false });
  cy.get("button").contains("Log in").click();
  cy.wait("@logIn");
};

describe("Tournament detail page", function () {
  it("Can see tournament detail", function () {
    logIn();
    // cy.intercept("GET", "tournaments").as("landing");
    // cy.wait("@landing");
    cy.intercept("/tennis/tournament/*").as("getTournament");
    cy.visit("/#/tournament/1");
    cy.wait("@getTournament");
    cy.get("p").contains("Date");
    cy.get("button").contains("Register for the tournament");
    cy.get("button").contains("Registered");
    cy.get("button").contains("Interested");
    cy.get("button").contains("Withdrawn");
  });
});
