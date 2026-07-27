// variant coverage: exercises every backend-configurable layout combination by intercepting the
// served SidebarContext and overriding its layout config (the real quar-crud-host fixture only
// ever serves side=left/variant=sidebar/collapsible=icon), with a screenshot per variant for
// visual inspection
const base = {
  name: 'main', theme: 'blue', side: 'left', variant: 'sidebar', collapsible: 'icon',
  overlay: false, openOnHover: false, dismissable: true,
  nodes: [
    {
      title: 'Conventions Management', icon: 'pi pi-calendar', type: 'group', entityName: null, path: null,
      children: [{title: 'Conventions', icon: 'pi pi-list', type: 'link', entityName: 'conventions', path: 'conventions', children: []}],
    },
    {title: 'Studios', icon: 'pi pi-building', type: 'link', entityName: 'studios', path: 'studios', children: []},
  ],
};

function visitWith(overrides: object) {
  cy.intercept('GET', '**/sidebar/main', {body: {...base, ...overrides}});
  cy.visit('/main');
  cy.get('[data-cy="sidebar-link-Studios"]').should('exist');
}

describe('variant screenshots', () => {
  it('sidebar expanded', () => {
    visitWith({});
    cy.screenshot('01-sidebar-expanded', {capture: 'viewport'});
  });

  it('icon collapsed', () => {
    visitWith({});
    cy.get('[data-cy="sidebar-trigger"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');
    cy.screenshot('02-icon-collapsed', {capture: 'viewport'});
  });

  it('floating', () => {
    visitWith({variant: 'floating'});
    cy.screenshot('03-floating', {capture: 'viewport'});
  });

  it('inset', () => {
    visitWith({variant: 'inset'});
    cy.screenshot('04-inset', {capture: 'viewport'});
  });

  it('right side', () => {
    visitWith({side: 'right'});
    cy.screenshot('05-right-side', {capture: 'viewport'});
  });

  it('offcanvas collapsed', () => {
    visitWith({collapsible: 'offcanvas'});
    cy.get('[data-cy="sidebar-trigger"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');
    cy.screenshot('06-offcanvas-collapsed', {capture: 'viewport'});
  });

  it('overlay open with backdrop', () => {
    visitWith({overlay: true, collapsible: 'offcanvas'});
    cy.get('[data-cy="sidebar-backdrop"]').should('exist');
    cy.screenshot('07-overlay', {capture: 'viewport'});
  });

  it('overlay backdrop click dismisses (dismissable)', () => {
    visitWith({overlay: true, collapsible: 'offcanvas'});
    cy.get('[data-cy="sidebar-backdrop"]').click({force: true});
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');
  });
});
