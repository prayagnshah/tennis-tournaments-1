describe("Landing page", function () {
  it("CAn see tournaments for categories", function () {
    cy.visit("/#/dashboard");
    cy.get("div.card-header").contains("START");
    cy.get("div.card-header").contains("SPORT");
    cy.get("div.card-header").contains("CHALLENGER");
    cy.get("div.card-header")
      .contains("START")
      .parent()
      .should(
        "have.css",
        "background",
        "rgba(0, 0, 0, 0) linear-gradient(rgb(255, 255, 114), rgb(255, 235, 59)) repeat scroll 0% 0% / auto padding-box border-box"
      );
    cy.get("div.card-header")
      .contains("SPORT")
      .parent()
      .should(
        "have.css",
        "background",
        "rgba(0, 0, 0, 0) linear-gradient(rgb(255, 201, 71), rgb(255, 152, 0)) repeat scroll 0% 0% / auto padding-box border-box"
      );
    cy.get("div.card-header")
      .contains("CHALLENGER")
      .parent()
      .should(
        "have.css",
        "background",
        "rgba(0, 0, 0, 0) linear-gradient(rgb(255, 121, 97), rgb(244, 67, 54)) repeat scroll 0% 0% / auto padding-box border-box"
      );
  });
});
