import {Component, computed, effect, Inject, input, model, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  Sidebar as PSidebar,
  SidebarAside,
  SidebarBackdrop,
  SidebarContent as PSidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLayout,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarPanel,
  SidebarRail,
  SidebarSpacer,
  SidebarTrigger,
} from 'primeng/sidebar';
import {MessageService} from 'primeng/api';
import {SidebarContext} from '../model/SidebarContext';
import {SidebarNode} from '../model/SidebarNode';
import {SIDEBAR_CRUDSTONE_CONFIG, SidebarCrudstoneConfig} from '../sidebar-crudstone-config';
import {SidebarService} from '../service/sidebar.service';
import {MessageTemplateService} from '../service/message-template.service';
import {TranslationService} from '../i18n/translation.service';
import {themeVars} from '../theme/theme-palettes';

/**
 * Renders a named `@Sidebar` (context-gen)'s nav tree on PrimeNG's own compound Sidebar
 * (https://primeng.dev/sidebar) — the same structure/behavior as its "Variants" demo, except
 * `side`/`variant`/`collapsible`/`overlay`/`openOnHover`/`dismissable` are never a client-facing
 * toggle here: they're bound straight off the fetched `SidebarContext`, fixed server-side by
 * whoever wrote the `@Sidebar` class. A link node is a plain `<a>` to `crudstoneUrl + that
 * entity's own resolved path` (this library never renders a CRUD table itself, only links out to
 * one hosted elsewhere — see `SidebarCrudstoneConfig.crudstoneUrl`).
 *
 * This component owns just the nav widget, not a page's main content area, so there's no
 * `p-sidebar-main` here — but `p-sidebar-layout` itself is still required even for a single
 * standalone sidebar: `.p-sidebar-aside`'s `position: absolute; height: 100%` only resolves
 * against a real height because `.p-sidebar` is a flex item of `.p-sidebar-layout` (which sets
 * `min-height: 100svh`); without that ancestor, `.p-sidebar` has no height of its own and the
 * whole panel collapses to zero. `SidebarTrigger`/`SidebarBackdrop` both resolve their target
 * Sidebar via ancestor injection when undeclared, so no `id`/`target` wiring is needed either way.
 */
@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [
    SidebarLayout,
    PSidebar,
    SidebarSpacer,
    SidebarAside,
    SidebarPanel,
    SidebarHeader,
    PSidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarTrigger,
    SidebarRail,
    SidebarBackdrop,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    // host-scoped, not global: more than one sb-sidebar (different named sidebars, possibly
    // different themes) can coexist on one page, so a document-root override would bleed one
    // instance's theme into another's
    '[style]': 'themeStyle()',
  },
})
export class SidebarComponent {

  /** Which `@Sidebar(name = ...)` to fetch and render. */
  readonly name = input.required<string>();

  /** Two-way bindable open/closed (expanded/icon-only, or shown/hidden in offcanvas) state. */
  readonly open = model(true);

  protected readonly loading = signal(false);
  protected readonly sidebarContext = signal<SidebarContext | null>(null);
  protected readonly themeStyle = computed<Record<string, string>>(() => themeVars(this.sidebarContext()?.theme));

  // which nested (level-2) group nodes are currently expanded, keyed by object identity (stable
  // for the lifetime of one fetched SidebarContext, since its nodes are never rebuilt in place) —
  // every nested group starts expanded, so the whole tree is visible/discoverable on first render
  private readonly openSubMenus = signal<ReadonlySet<SidebarNode>>(new Set());

  constructor(private sidebarService: SidebarService,
              private messageService: MessageService,
              private messageTemplate: MessageTemplateService,
              protected i18n: TranslationService,
              @Inject(SIDEBAR_CRUDSTONE_CONFIG) private config: SidebarCrudstoneConfig) {
    effect(() => {
      const name = this.name();
      this.sidebarContext.set(null);
      this.openSubMenus.set(new Set());
      this.loadSidebar(name);
    });
  }

  private loadSidebar(name: string): void {
    this.loading.set(true);
    this.sidebarService.getSidebar(name).subscribe({
      next: context => {
        this.loading.set(false);
        this.sidebarContext.set(context);
        this.openSubMenus.set(new Set(this.nestedGroupNodes(context.nodes)));
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add(this.messageTemplate.simpleError(this.i18n.t('sidebarNotFound', {name})));
      },
    });
  }

  // only a top-level group's own children can themselves be a group (@Sidebar's tree is
  // unbounded in principle, but p-sidebar-menu-sub-item's own content is a plain button — one
  // level of nested collapsible group is the deepest PrimeNG's own menu structure renders)
  private nestedGroupNodes(nodes: SidebarNode[]): SidebarNode[] {
    return nodes.flatMap(node => node.type === 'group' ? node.children.filter(child => child.type === 'group') : []);
  }

  protected isSubMenuOpen(node: SidebarNode): boolean {
    return this.openSubMenus().has(node);
  }

  protected setSubMenuOpen(node: SidebarNode, isOpen: boolean): void {
    this.openSubMenus.update(current => {
      const next = new Set(current);
      if (isOpen) {
        next.add(node);
      } else {
        next.delete(node);
      }
      return next;
    });
  }

  protected linkHref(node: SidebarNode): string {
    return this.config.crudstoneUrl + (node.path ?? '');
  }
}
