const faker = require("faker");

const randomEmail = faker.internet.exampleEmail();
// eslint-disable-next-line no-unused-vars
const { username, password } = Cypress.env("credentials");

const logIn = () => {
  // eslint-disable-next-line no-unused-vars
  // const { username, password } = Cypress.env("credentials");

  // Capture HTTP requests.
  cy.intercept("POST", "log_in").as("logIn");

  // Log into the app.
  cy.visit("/#/log-in");
  cy.get("input#username").type(randomEmail);
  cy.get("input#password").type(password, { log: false });
  cy.get("button").contains("Log in").click();
  cy.wait("@logIn");
};

describe("Authentication with random user - API calls", function () {
  it("Can sign up.", function () {
    cy.intercept("POST", "sign_up").as("signUp");

    cy.visit("/#/sign-up");
    cy.get("input#username").type(randomEmail);
    cy.get("input#firstName").type("Maty");
    cy.get("input#lastName").type("Mty");
    cy.get("input#password").type(password, { log: false });

    cy.get("button").contains("Sign up").click();
    cy.wait("@signUp");
    cy.hash().should("eq", "#/log-in");
  });

  it("Can log in.", function () {
    logIn();

    cy.hash().should("eq", "#/dashboard");
    cy.get("a").contains("Log out");
  });

  it("Cannot visit the login page when logged in.", function () {
    logIn();
    cy.visit("/#/log-in");
    cy.hash().should("eq", "#/");
  });

  it("Cannot visit the sign up page when logged in.", function () {
    logIn();

    cy.visit("/#/sign-up");
    cy.hash().should("eq", "#/");
  });

  it("Can log out.", function () {
    logIn();
    cy.get("a")
      .contains("Log out")
      .click()
      .should(() => {
        expect(window.localStorage.getItem("tennis.auth")).to.be.null;
      });
    cy.get("a").contains("Log out").should("not.exist");
  });
});
