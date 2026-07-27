import {normalizeSidebarNode, SidebarNode} from './SidebarNode';

export type SidebarSide = 'left' | 'right';
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

// Mirrors context-gen's org.devary.table.sidebar.SidebarContext, served at
// GET {sidebarUrl}{name} — the whole resolved nav tree for one named @Sidebar class.
export interface SidebarContext {
  name: string;
  // this sidebar's own accent color (@Sidebar#theme()) — "primary" means no override, see
  // theme-palettes.ts
  theme: string;
  // layout config (@Sidebar#side()/variant()/collapsible()/overlay()/openOnHover()/
  // dismissable()) — fixed server-side, rendered by sb-sidebar's own hand-written layout
  // engine (data-side/data-variant/data-collapsible-mode host attributes) with no
  // client-facing toggle.
  side: SidebarSide;
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  overlay: boolean;
  openOnHover: boolean;
  dismissable: boolean;
  // whether an open overlay sidebar dims the page behind it. Frontend-side extension (context-gen
  // doesn't serve it): defaults to the `overlay` value itself, so backend-fed sidebars keep the
  // original "overlay implies backdrop" behavior.
  backdrop: boolean;
  nodes: SidebarNode[];
}

/** Fills the defaults for a sidebar context received as raw JSON. */
export function normalizeSidebarContext(raw: Partial<SidebarContext>): SidebarContext {
  return {
    name: raw.name ?? '',
    theme: raw.theme ?? 'primary',
    side: raw.side === 'right' ? 'right' : 'left',
    variant: raw.variant === 'floating' || raw.variant === 'inset' ? raw.variant : 'sidebar',
    collapsible: raw.collapsible === 'offcanvas' || raw.collapsible === 'none' ? raw.collapsible : 'icon',
    overlay: raw.overlay ?? false,
    openOnHover: raw.openOnHover ?? false,
    dismissable: raw.dismissable ?? true,
    backdrop: raw.backdrop ?? raw.overlay ?? false,
    nodes: (raw.nodes ?? []).map(normalizeSidebarNode),
  };
}
