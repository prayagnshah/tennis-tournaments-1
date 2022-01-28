describe("Navigation", function () {
  it("Can navigate to sign up from home", function () {
    cy.visit("/#/");
    cy.get("a").contains("Sign up").click();
    cy.hash().should("eq", "#/sign-up");
  });

  it("Can navigate to log in from home", function () {
    cy.visit("/#/");
    cy.get("a").contains("Log in").click();
    cy.hash().should("eq", "#/log-in");
  });
});
