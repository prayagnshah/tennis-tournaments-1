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

describe("Profile Page", function () {
  it("Can visit profile page, then log out and redirect to Dashboard", function () {
    logIn();

    cy.get("a").contains("Mty").click();
    cy.hash().should("eq", "#/profile");
    cy.get("div").contains("mmty@example.com");
    cy.get("a").contains("Log out").click();
    cy.hash().should("eq", "#/");

    // cy.get("button").contains("Log out");
  });
});
