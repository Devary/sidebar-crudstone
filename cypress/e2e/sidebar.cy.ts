describe('sb-sidebar (main sidebar, backed by quar-crud-host)', () => {
  beforeEach(() => {
    cy.visit('/main');
    // waiting for real tree content (not just the root/panel shell, which is already present
    // before the SidebarContext fetch even resolves) is what actually confirms data has loaded
    cy.get('[data-cy="sidebar-link-Studios"]').should('be.visible');
  });

  it('renders the group node with its link nested inside, and a bare top-level link alongside it', () => {
    cy.get('[data-cy="sidebar-group-Conventions Management"]').should('be.visible').and('contain.text', 'Conventions Management');
    cy.get('[data-cy="sidebar-link-Conventions"]').should('be.visible');
    cy.get('[data-cy="sidebar-link-Studios"]').should('be.visible');
  });

  it('renders the nested sub-group expanded by default, with its own sub-links, and collapses on click', () => {
    cy.get('[data-cy="sidebar-group-Administration"]').should('be.visible').and('contain.text', 'Administration');
    cy.get('[data-cy="sidebar-link-All Conventions"]').should('be.visible');
    cy.get('[data-cy="sidebar-link-All Studios"]').should('be.visible');

    cy.get('[data-cy="sidebar-group-Administration"]').click();
    cy.get('[data-cy="sidebar-link-All Conventions"]').should('not.exist');

    cy.get('[data-cy="sidebar-group-Administration"]').click();
    cy.get('[data-cy="sidebar-link-All Studios"]').should('be.visible');
  });

  it('renders each node\'s icon', () => {
    cy.get('[data-cy="sidebar-group-Conventions Management"] .pi-calendar').should('exist');
    cy.get('[data-cy="sidebar-link-Conventions"] .pi-list').should('exist');
    cy.get('[data-cy="sidebar-link-Studios"] .pi-building').should('exist');
  });

  it('collapses the whole sidebar into icon mode via its own trigger, backend-configured (not a user toggle for variant/side)', () => {
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-collapsible-mode', 'icon');
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'expanded');

    cy.get('[data-cy="sidebar-trigger"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'collapsed');

    cy.get('[data-cy="sidebar-trigger"]').click();
    cy.get('[data-cy="sidebar-root"]').should('have.attr', 'data-state', 'expanded');
  });

  it('applies the layout config exactly as served, with no client-facing override', () => {
    cy.get('[data-cy="sidebar-root"]')
      .should('have.attr', 'data-side', 'left')
      .and('have.attr', 'data-variant', 'sidebar');
  });

  it("each link points at its own entity's CRUD route on the crudstone app, not this one", () => {
    cy.get('[data-cy="sidebar-link-Conventions"]')
      .should('have.attr', 'href', 'http://localhost:5900/conventions');
    cy.get('[data-cy="sidebar-link-Studios"]')
      .should('have.attr', 'href', 'http://localhost:5900/studios');
  });

  it('applies the sidebar\'s own theme as a host-scoped CSS custom property', () => {
    // .should() with a callback retries until it passes (or times out) — needed here since the
    // theme style updates asynchronously alongside the SidebarContext fetch, same as the tree
    // content itself; a one-shot .then() can run before that update lands
    cy.get('sb-sidebar').should($el => {
      const primaryColor = getComputedStyle($el[0]).getPropertyValue('--p-primary-color').trim();
      expect(primaryColor).to.eq('#3b82f6'); // "blue" preset, per MainSidebar's own @Sidebar(theme = "blue")
    });
  });

  it('shows an error toast for an unknown sidebar name instead of crashing', () => {
    cy.visit('/does-not-exist');
    cy.contains('.p-toast-message', 'not found').should('be.visible');
  });
});
