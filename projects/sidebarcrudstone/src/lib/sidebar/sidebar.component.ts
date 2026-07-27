import {Component, computed, effect, Inject, input, model, signal} from '@angular/core';
import {MessageService} from 'primeng/api';
import {SidebarContext} from '../model/SidebarContext';
import {SidebarNode} from '../model/SidebarNode';
import {SIDEBAR_CRUDSTONE_CONFIG, SidebarCrudstoneConfig} from '../sidebar-crudstone-config';
import {SidebarService} from '../service/sidebar.service';
import {MessageTemplateService} from '../service/message-template.service';
import {TranslationService} from '../i18n/translation.service';
import {themeVars} from '../theme/theme-palettes';

/**
 * Renders a named `@Sidebar` (context-gen)'s nav tree as a hand-written compound sidebar —
 * structure, variants, and behavior modeled on the PrimeNG 20+/shadcn-style compound Sidebar
 * ("Variants" demo), but implemented entirely in this library's own markup and CSS so it runs on
 * the free MIT PrimeNG. `side`/`variant`/`collapsible`/`overlay`/`openOnHover`/`dismissable` are
 * never a client-facing toggle: they come off the fetched `SidebarContext`, fixed server-side by
 * whoever wrote the `@Sidebar` class, and drive the `data-side`/`data-variant`/
 * `data-collapsible-mode`/`data-state` attributes the stylesheet keys off — the same attribute
 * contract the compound API uses, so tests and consumers see an identical surface.
 *
 * A link node is a plain `<a>` to `crudstoneUrl + that entity's own resolved path` (this library
 * never renders a CRUD table itself, only links out to one hosted elsewhere — see
 * `SidebarCrudstoneConfig.crudstoneUrl`).
 */
@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
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

  // temporary hover-expansion while collapsed (only when the backend set openOnHover) — visual
  // only: data-state stays "collapsed", the stylesheet widens on [data-hover-open] instead
  protected readonly hoverOpen = signal(false);

  /** "expanded" | "collapsed" — collapsible "none" can never collapse, whatever `open` says. */
  protected readonly state = computed(() =>
    this.sidebarContext()?.collapsible === 'none' || this.open() ? 'expanded' : 'collapsed');

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
  // unbounded in principle, but the sub-menu renders plain links — one level of nested
  // collapsible group is the deepest this menu structure renders, matching the compound API)
  private nestedGroupNodes(nodes: SidebarNode[]): SidebarNode[] {
    return nodes.flatMap(node => node.type === 'group' ? node.children.filter(child => child.type === 'group') : []);
  }

  protected isSubMenuOpen(node: SidebarNode): boolean {
    return this.openSubMenus().has(node);
  }

  protected toggleSubMenu(node: SidebarNode): void {
    this.openSubMenus.update(current => {
      const next = new Set(current);
      if (next.has(node)) {
        next.delete(node);
      } else {
        next.add(node);
      }
      return next;
    });
  }

  protected toggle(): void {
    if (this.sidebarContext()?.collapsible === 'none') {
      return;
    }
    this.hoverOpen.set(false);
    this.open.update(open => !open);
  }

  protected onMouseEnter(): void {
    if (this.sidebarContext()?.openOnHover && this.state() === 'collapsed') {
      this.hoverOpen.set(true);
    }
  }

  protected onMouseLeave(): void {
    this.hoverOpen.set(false);
  }

  protected onBackdropClick(): void {
    if (this.sidebarContext()?.dismissable) {
      this.open.set(false);
    }
  }

  protected linkHref(node: SidebarNode): string {
    return this.config.crudstoneUrl + (node.path ?? '');
  }
}
