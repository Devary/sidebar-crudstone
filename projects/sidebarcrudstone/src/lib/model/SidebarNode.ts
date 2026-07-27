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
  // optional short counter/label rendered as a pill on the row's right edge (e.g. "12" unread).
  // Frontend-side extension — context-gen doesn't serve it (yet), so backend-fed sidebars simply
  // never show one; a locally-provided context (SidebarComponent's `context` input) can.
  badge?: string | null;
  // nested group nodes only: start collapsed instead of the default-expanded behavior.
  // Frontend-side extension, same caveat as `badge`.
  defaultOpen?: boolean;
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
    badge: raw.badge,
    defaultOpen: raw.defaultOpen ?? true,
    children: (raw.children ?? []).map(normalizeSidebarNode),
  };
}
