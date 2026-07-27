// playground smoke tests + screenshots: pinned sidebar, footer (user) dropdown -> Settings modal
// (staged edits, confirm-before-save, confirm-before-discard), no on-page controls
describe('playground', () => {
  beforeEach(() => {
    cy.viewport(1200, 900);
    cy.visit('/playground');
    cy.get('[data-cy="sidebar-link-Studios"]').should('be.visible');
  });

  it('renders the pinned sidebar with no on-page controls, and captures it', () => {
    cy.get('[data-cy="pg-variant"]').should('not.exist');
    cy.get('[data-cy="sidebar-brand"]').should('contain.text', 'Main');
    cy.screenshot('playground-dark', {capture: 'viewport'});
  });

  it('collapses to the icon rail via the content toggle', () => {
    cy.get('[data-cy="pg-toggle"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');
    cy.screenshot('playground-collapsed', {capture: 'viewport'});
  });

  it('opens the Settings modal from the footer dropdown, over a blurred backdrop', () => {
    cy.get('[data-cy="sidebar-footer"]').click();
    cy.get('[data-cy="sidebar-footer-settings"]').should('be.visible').click();
    cy.get('.p-dialog').should('be.visible').and('contain.text', 'Settings');
    cy.get('[data-cy="pg-variant"]').should('be.visible');
    cy.get('.p-dialog-mask').should($mask => {
      expect(getComputedStyle($mask[0]).backdropFilter).to.eq('blur(6px)');
    });
    cy.screenshot('playground-settings-modal', {capture: 'viewport'});
  });

  it('applies staged settings only after the Save confirmation', () => {
    cy.get('[data-cy="sidebar-footer"]').click();
    cy.get('[data-cy="sidebar-footer-settings"]').click();
    cy.get('[data-cy="pg-variant"]').click();
    cy.get('.p-select-overlay').contains('.p-select-option', 'Floating').click();
    // staged, not applied yet
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-variant', 'sidebar');
    cy.get('[data-cy="pg-settings-save"] button').click();
    cy.contains('.p-confirmdialog', 'Apply these sidebar settings?').should('be.visible');
    cy.contains('.p-confirmdialog button', 'Yes, apply').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-variant', 'floating');
    cy.get('.p-dialog').should('not.exist');
  });

  it('asks before discarding dirty changes on Cancel, and keeps the applied settings', () => {
    cy.get('[data-cy="sidebar-footer"]').click();
    cy.get('[data-cy="sidebar-footer-settings"]').click();
    cy.get('[data-cy="pg-overlay"]').click();
    cy.get('[data-cy="pg-settings-cancel"] button').click();
    cy.contains('.p-confirmdialog', 'Discard them?').should('be.visible');
    cy.contains('.p-confirmdialog button', 'Yes, discard').click();
    cy.get('.p-dialog').should('not.exist');
    cy.get('[data-cy="sidebar-root"]').should('not.have.attr', 'data-overlay');
  });

  it('boots light with the host-default primary, like dynamic-crud', () => {
    cy.get('html').should('not.have.class', 'app-dark');
    cy.get('[data-cy="sidebar-root"]').should('be.visible');
  });

  it('switches theme and dark mode from settings after confirmation', () => {
    cy.get('[data-cy="sidebar-footer"]').click();
    cy.get('[data-cy="sidebar-footer-settings"]').click();
    cy.get('[data-cy="pg-theme"]').click();
    cy.get('.p-select-overlay').contains('.p-select-option', 'Purple').click();
    cy.get('[data-cy="pg-dark-mode"]').click();
    cy.get('[data-cy="pg-settings-save"] button').click();
    cy.contains('.p-confirmdialog button', 'Yes, apply').click();
    cy.get('html').should('have.class', 'app-dark');
    cy.get('sb-sidebar').should($el => {
      expect(getComputedStyle($el[0]).getPropertyValue('--p-primary-color').trim()).to.eq('#a855f7');
    });
    cy.get('.p-dialog').should('not.exist');
    cy.get('.p-dialog-mask').should('not.exist');
    cy.screenshot('playground-dark-blue', {capture: 'viewport'});
  });

  it('closes silently on Cancel when nothing changed', () => {
    cy.get('[data-cy="sidebar-footer"]').click();
    cy.get('[data-cy="sidebar-footer-settings"]').click();
    cy.get('[data-cy="pg-settings-cancel"] button').click();
    cy.get('.p-confirmdialog').should('not.exist');
    cy.get('.p-dialog').should('not.exist');
  });
});
