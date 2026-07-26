# sidebarcrudstone

A metadata-driven **navigation sidebar** for Angular: point `<sb-sidebar>`
at a named sidebar (served by [`context-gen`](../../context-gen)) and it
renders that nav tree generically — groups that expand/collapse, links
that point out to each entity's own CRUD table (rendered by
[`crudstone`](https://github.com/devary/crudstone), a *different* app). No
per-app markup, no hardcoded menu, no per-entity code.

Unlike `crudstone`/`searchcrudstone`, this library never touches an
entity's own rows or fields at all — a sidebar links *out* to other
entities' pages, it doesn't render any of them itself.

## Install

```bash
npm install sidebarcrudstone
```

Peer dependencies: `@angular/{core,common,forms,router}` ^19.1, `primeng`
^19.0.5, `@primeng/themes` ^19.0.5.

## Getting started

```ts
// app.config.ts
import {provideSidebarCrudstone} from 'sidebarcrudstone';

providers: [
  // ...
  provideSidebarCrudstone({
    sidebarUrl: 'http://localhost:9100/sidebar/',
    crudstoneUrl: 'http://localhost:5900/',
  }),
],
```

```ts
// in your app shell
import {SidebarComponent} from 'sidebarcrudstone';

@Component({
  imports: [SidebarComponent],
  template: `<sb-sidebar name="main"/>`,
})
export class AppShellComponent {
}
```

Or drop in the ready-made route-driven page component, same shape as
crudstone's own `EntityPageComponent`/search-crudstone's own
`EntitySearchPageComponent` — though unlike those, it exists purely for
convenience: `SidebarComponent` takes `name` directly and fetches its own
context, there's no separate context object a route needs to resolve first.

```ts
// app.routes.ts
import {SidebarPageComponent} from 'sidebarcrudstone';

export const routes: Routes = [
  {path: ':name', component: SidebarPageComponent},
];
```

## `SidebarComponent` (`sb-sidebar`)

| Input/Output | Type | Description |
|---|---|---|
| `name` | `string` (required) | Which `@Sidebar(name = ...)` to fetch and render. |
| `visible` | `model<boolean>`, default `true` | Two-way bindable open/closed state. Defaults open (a persistent site nav is the common case), but can be wired to a hamburger-menu toggle for `p-sidebar`'s original off-canvas-drawer behavior, e.g. on narrow screens. |

The sidebar's tree comes from context-gen's `@Sidebar`/`SidebarNode` — see
its own [Sidebars](../../context-gen/DOCUMENTATION.md#sidebars) section for
the annotation reference. A group node (nests other nodes) starts
expanded and toggles via its own header button; a link node is a plain
`<a>` whose `href` is `crudstoneUrl` + that entity's own resolved
`path` (from its `@CrudstoneEntity`) — this library never renders a CRUD
table itself, only links out to wherever `crudstone` is actually hosted.

Chrome is PrimeNG's own `p-sidebar`
([primeng.dev/sidebar](https://primeng.dev/sidebar)), rendered with
`modal=false`/`dismissible=false` so it sits as a persistent, non-blocking
panel rather than a temporary overlay with a backdrop — the classic
off-canvas-drawer usage `p-sidebar` is originally built around is still
available by binding `[(visible)]` to your own toggle instead of leaving
it at its default `true`.

## `provideSidebarCrudstone(config)`

| Option | Default | Description |
|---|---|---|
| `sidebarUrl` | — | Base URL for sidebar-context lookups, e.g. `'http://localhost:9100/sidebar/'`. |
| `crudstoneUrl` | — | Base URL of the app that actually serves each entity's CRUD table (a *different* app than this one) — a link node's own resolved `path` is appended to this to build its full `href`. |
| `localMode` | `false` | Read from a static JSON fixture (`sidebarUrl + '<name>.json'`) instead of a live endpoint. |
| `translations` / `translate` | — | Same override mechanism as crudstone/search-crudstone — see `SidebarCrudstoneTranslations`. |

## Theming

A sidebar's accent color is set server-side via context-gen's
`@Sidebar(theme = "blue")` (same fixed preset names
`@CrudstoneEntity#theme()`/`@Searchable#theme()` draw from) — there's no
client-side config for it and no runtime picker.
`SidebarContext.theme` carries the value; `SidebarComponent` applies it as
CSS custom-property overrides (`theme-palettes.ts`'s `themeVars()`) scoped
to its own host element — never a global/document-root override, since
more than one `sb-sidebar` instance (each pointed at a different,
differently-themed named sidebar) can coexist on one page.

## The `SidebarContext`/`SidebarNode` model

Mirrors context-gen's own `SidebarContext`/`SidebarNodeContext`:

```ts
interface SidebarContext {
  name: string;
  theme: string;
  nodes: SidebarNode[];
}

interface SidebarNode {
  title: string;
  type: 'group' | 'link';
  entityName?: string | null; // link nodes only
  path?: string | null;       // link nodes only
  children: SidebarNode[];    // group nodes only — empty (not undefined) for a link node
}
```

Fetched via `SidebarService.getSidebar(name)`, cached per name for the
lifetime of the page.

## Building

```bash
ng build sidebarcrudstone   # from the workspace root, output to dist/sidebarcrudstone
cd dist/sidebarcrudstone
npm publish                # unscoped package, no --access flag needed
```
