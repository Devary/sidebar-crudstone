import {Component, computed, effect, Inject, input, model, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Sidebar as PSidebar} from 'primeng/sidebar';
import {MessageService} from 'primeng/api';
import {SidebarContext} from '../model/SidebarContext';
import {SidebarNode} from '../model/SidebarNode';
import {SIDEBAR_CRUDSTONE_CONFIG, SidebarCrudstoneConfig} from '../sidebar-crudstone-config';
import {SidebarService} from '../service/sidebar.service';
import {MessageTemplateService} from '../service/message-template.service';
import {TranslationService} from '../i18n/translation.service';
import {themeVars} from '../theme/theme-palettes';

/**
 * Renders a named `@Sidebar` (context-gen)'s nav tree — point it at a name and it fetches, then
 * renders, that sidebar generically: no per-app markup, no hardcoded links. A group node expands/
 * collapses its own children; a link node is a plain `<a>` to `crudstoneUrl + that entity's own
 * resolved path` (this library never renders a CRUD table itself, only links out to one hosted
 * elsewhere — see `SidebarCrudstoneConfig.crudstoneUrl`).
 *
 * Chrome is PrimeNG's own `p-sidebar`. `visible` is a `model()` (two-way bindable) rather than a
 * fixed `true`, defaulting open — a persistent site nav is the common case — but a host can wire
 * a hamburger toggle to it for the classic off-canvas-drawer behavior `p-sidebar` is originally
 * built around, e.g. on narrow screens.
 */
@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [NgTemplateOutlet, PSidebar],
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

  /** Two-way bindable open/closed state — defaults open (a persistent nav is the common case). */
  readonly visible = model(true);

  protected readonly loading = signal(false);
  protected readonly sidebarContext = signal<SidebarContext | null>(null);
  protected readonly themeStyle = computed<Record<string, string>>(() => themeVars(this.sidebarContext()?.theme));

  // which group nodes are currently expanded, keyed by object identity (stable for the lifetime
  // of one fetched SidebarContext, since its nodes are never rebuilt in place) — every group
  // starts expanded, so the whole tree is visible/discoverable on first render
  private readonly expandedGroups = signal<ReadonlySet<SidebarNode>>(new Set());

  constructor(private sidebarService: SidebarService,
              private messageService: MessageService,
              private messageTemplate: MessageTemplateService,
              protected i18n: TranslationService,
              @Inject(SIDEBAR_CRUDSTONE_CONFIG) private config: SidebarCrudstoneConfig) {
    effect(() => {
      const name = this.name();
      this.sidebarContext.set(null);
      this.expandedGroups.set(new Set());
      this.loadSidebar(name);
    });
  }

  private loadSidebar(name: string): void {
    this.loading.set(true);
    this.sidebarService.getSidebar(name).subscribe({
      next: context => {
        this.loading.set(false);
        this.sidebarContext.set(context);
        this.expandedGroups.set(new Set(this.allGroupNodes(context.nodes)));
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add(this.messageTemplate.simpleError(this.i18n.t('sidebarNotFound', {name})));
      },
    });
  }

  private allGroupNodes(nodes: SidebarNode[]): SidebarNode[] {
    return nodes.flatMap(node => node.type === 'group' ? [node, ...this.allGroupNodes(node.children)] : []);
  }

  protected isExpanded(node: SidebarNode): boolean {
    return this.expandedGroups().has(node);
  }

  protected toggleGroup(node: SidebarNode): void {
    this.expandedGroups.update(current => {
      const next = new Set(current);
      if (next.has(node)) {
        next.delete(node);
      } else {
        next.add(node);
      }
      return next;
    });
  }

  protected linkHref(node: SidebarNode): string {
    return this.config.crudstoneUrl + (node.path ?? '');
  }
}
