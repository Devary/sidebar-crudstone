// Mirrors context-gen's org.devary.table.sidebar.SidebarNodeContext. A node's role is carried by
// `type`, not inferred client-side: "group" nests other nodes and links nowhere itself; "link"
// points at one entity's own CRUD route (entityName/path, resolved server-side from that class's
// @CrudstoneEntity) and nests nothing further.
export interface SidebarNode {
  title: string;
  // a PrimeIcons class name (e.g. "pi pi-home"), or null/undefined if the node had none
  icon?: string | null;
  type: 'group' | 'link';
  // link nodes only
  entityName?: string | null;
  path?: string | null;
  // group nodes only — empty (not undefined) for a link node, so a consumer never needs a null
  // check before iterating
  children: SidebarNode[];
}

/** Fills the defaults for one sidebar node received as raw JSON, recursively. */
export function normalizeSidebarNode(raw: Partial<SidebarNode>): SidebarNode {
  return {
    title: raw.title ?? '',
    icon: raw.icon,
    type: raw.type === 'link' ? 'link' : 'group',
    entityName: raw.entityName,
    path: raw.path,
    children: (raw.children ?? []).map(normalizeSidebarNode),
  };
}
