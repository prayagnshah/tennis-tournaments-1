describe("Landing page", function () {
  it("CAn see tournaments for categories", function () {
    cy.visit("/#/");
    cy.get("div.card-header").contains("START");
    cy.get("div.card-header").contains("SPORT");
    cy.get("div.card-header").contains("CHALLENGER");
    cy.get("div.card-header")
      .contains("START")
      .parent()
      .should("have.css", "background-color", "rgb(255, 255, 0)");
    cy.get("div.card-header")
      .contains("SPORT")
      .parent()
      .should("have.css", "background-color", "rgb(243, 156, 18)");
    cy.get("div.card-header")
      .contains("CHALLENGER")
      .parent()
      .should("have.css", "background-color", "rgb(231, 76, 60)");
  });
});
