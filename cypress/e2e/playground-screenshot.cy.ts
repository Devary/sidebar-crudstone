// playground smoke tests + screenshots (dark-mode Acme demo with local context, no backend)
describe('playground screenshot', () => {
  it('captures the playground', () => {
    cy.viewport(1200, 900);
    cy.visit('/playground');
    cy.get('[data-cy="sidebar-link-Home"]').should('be.visible');
    cy.screenshot('playground-dark', {capture: 'viewport'});
  });
  it('captures icon-collapsed via content toggle', () => {
    cy.viewport(1200, 900);
    cy.visit('/playground');
    cy.get('[data-cy="sidebar-link-Home"]').should('be.visible');
    cy.get('[data-cy="pg-toggle"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');
    cy.screenshot('playground-collapsed', {capture: 'viewport'});
  });
});
