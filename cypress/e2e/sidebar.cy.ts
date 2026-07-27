describe('sb-sidebar (main sidebar, backed by quar-crud-host)', () => {
  beforeEach(() => {
    cy.visit('/main');
    // p-sidebar renders its actual panel content into a portaled element elsewhere in the DOM,
    // not as a child of <p-sidebar> itself (same overlay pattern PrimeNG's Popover/Datepicker
    // panels use) — its own styleClass lands there, so that's what a visibility check must target.
    // Waiting for real tree content (not just the empty panel shell, which is already visible
    // before the SidebarContext fetch even resolves) is what actually confirms data has loaded.
    cy.get('[data-cy="sidebar-link-Studios"]').should('be.visible');
  });

  it('renders the group node expanded by default, with its link nested inside', () => {
    cy.get('[data-cy="sidebar-group-Conventions Management"]').should('be.visible');
    cy.get('[data-cy="sidebar-link-Conventions"]').should('be.visible');
  });

  it('renders a bare top-level link node alongside the group', () => {
    cy.get('[data-cy="sidebar-link-Studios"]').should('be.visible');
  });

  it('collapses and re-expands a group, hiding/showing its nested link', () => {
    cy.get('[data-cy="sidebar-link-Conventions"]').should('be.visible');

    cy.get('[data-cy="sidebar-group-Conventions Management"]').click();
    cy.get('[data-cy="sidebar-link-Conventions"]').should('not.exist');

    cy.get('[data-cy="sidebar-group-Conventions Management"]').click();
    cy.get('[data-cy="sidebar-link-Conventions"]').should('be.visible');
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
