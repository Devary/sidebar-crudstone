import {normalizeSidebarNode, SidebarNode} from './SidebarNode';

// Mirrors context-gen's org.devary.table.sidebar.SidebarContext, served at
// GET {sidebarUrl}{name} — the whole resolved nav tree for one named @Sidebar class.
export interface SidebarContext {
  name: string;
  // this sidebar's own accent color (@Sidebar#theme()) — "primary" means no override, see
  // theme-palettes.ts
  theme: string;
  nodes: SidebarNode[];
}

/** Fills the defaults for a sidebar context received as raw JSON. */
export function normalizeSidebarContext(raw: Partial<SidebarContext>): SidebarContext {
  return {
    name: raw.name ?? '',
    theme: raw.theme ?? 'primary',
    nodes: (raw.nodes ?? []).map(normalizeSidebarNode),
  };
}
