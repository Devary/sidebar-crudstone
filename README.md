# Sidebar CrudStone — `sidebarcrudstone` workspace

This is the Angular CLI workspace that builds and demos
[**`sidebarcrudstone`**](projects/sidebarcrudstone) — a metadata-driven
**navigation sidebar** library: point it at a named sidebar (a nav tree of
section groups and links to entities, declared server-side) and it renders
that tree generically, letting a user navigate to any entity's own CRUD
table without a hardcoded menu. It's a sibling of
[`dynamic-crud`](../dynamic-crud)'s own `crudstone` (a full CRUD table
library) and [`search-crudstone`](../search-crudstone) (a search-and-pick
library) — same backend ([`context-gen`](../context-gen)), a third,
independent UI concern: this one doesn't render any entity's own fields at
all, it only links out to pages that do.

The workspace has two projects:

- **`projects/sidebarcrudstone`** — the publishable library. All the
  reusable code (the sidebar model, service, component) lives here. See
  [its README](projects/sidebarcrudstone/README.md) for installation and
  API details.
- **`sidebar-crudstone`** (this app, `src/`) — a thin demo/playground that
  consumes `sidebarcrudstone` like any other project would:
  `provideSidebarCrudstone(...)` in `app.config.ts`, and a `:name` route
  pointed at `SidebarPageComponent` (e.g. `/main`). It exists to develop
  and exercise the library against a real context host, and to run the
  Cypress e2e suite.

## Metadata-driven architecture

Nothing in the library is hardcoded to any app's own menu — the whole tree
is rendered from a **`SidebarContext`**: a named nav tree of group/link
nodes, reflected off a plain `@Sidebar`-annotated class on the server (see
[`context-gen`](../context-gen) and the reference host
[`quar-crud-host`](../quar-crud-host)).

```
GET /sidebar/{name}   → SidebarContext (theme + a tree of group/link nodes)
```

A link node's `path` (resolved server-side from its entity's own
`@CrudstoneEntity`) is appended to `crudstoneUrl` (this library's own
config — the base URL of the *separate* app that actually serves that
entity's CRUD table) to build its full `href`. This library never fetches
or renders any entity's own rows/fields — it only knows enough to link to
where they live.

Adding a new entity to the nav takes zero new Angular code: add
`SidebarNode.link("Title", YourEntity.class)` to the `@Sidebar` class's own
`nodes` field on the server (see
[`quar-crud-host`](../quar-crud-host)'s `MainSidebar`) and it appears.

See [`projects/sidebarcrudstone/README.md`](projects/sidebarcrudstone/README.md)
for the full breakdown of what each exported piece (`SidebarComponent`,
`SidebarPageComponent`, `SidebarService`, the `SidebarContext`/`SidebarNode`
model, `provideSidebarCrudstone`) does.

---

## Development

```bash
npm install
npm start          # ng serve sidebar-crudstone --port 5902, expects a context host on :9100 (see quar-crud-host)
```

This app's own `provideSidebarCrudstone(...)` call (in
`src/app/app.config.ts`) reads `src/environments/environment.ts` — three
environments exist: `dev`/default (`localhost:9100`, linking out to
`crudstone` on `localhost:5900`), `local` (a static fixture under
`src/assets/data/main.json`, no backend needed), `prod`.

```bash
ng build sidebarcrudstone  # build the library only, output to dist/sidebarcrudstone
ng build sidebar-crudstone # build this demo app (resolves sidebarcrudstone from
                           # projects/sidebarcrudstone/src/public-api.ts directly,
                           # no separate library build needed during development)
```

## Testing

```bash
npm test    # Karma/Jasmine unit tests
npm run e2e # Cypress, needs the app + a context host running (see quar-crud-host)
```

---

## Deployment

Same shape as `dynamic-crud`'s own Jenkinsfile: builds + Docker-pushes the
demo app, and separately version-gates a build+publish of the
`sidebarcrudstone` library itself. Demo app serves on port 5902 (nginx,
see `Dockerfile`/`nginx.conf`) — a different port than `dynamic-crud`'s
5900 and `search-crudstone`'s 5901, so all three can run side by side.
