import {Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {SidebarCollapsible, SidebarComponent, SidebarContext, SidebarSide, SidebarVariant} from 'sidebarcrudstone';

/**
 * Interactive playground for every sidebar variant, collapsible mode, side, overlay,
 * open-on-hover and backdrop — demo-app only, not part of the published library. The whole
 * Acme Inc tree is a locally-supplied context (sb-sidebar's `context` input, no backend
 * fetch), so the controls simply rewrite that object and the sidebar re-applies it.
 */
@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [FormsModule, Select, ToggleSwitch, SidebarComponent],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
})
export class PlaygroundComponent {

  protected readonly variantOptions = [
    {label: 'Sidebar', value: 'sidebar' as SidebarVariant},
    {label: 'Floating', value: 'floating' as SidebarVariant},
    {label: 'Inset', value: 'inset' as SidebarVariant},
  ];
  protected readonly collapsibleOptions = [
    {label: 'Icon', value: 'icon' as SidebarCollapsible},
    {label: 'Offcanvas', value: 'offcanvas' as SidebarCollapsible},
    {label: 'None', value: 'none' as SidebarCollapsible},
  ];

  protected variant: SidebarVariant = 'sidebar';
  protected collapsible: SidebarCollapsible = 'icon';
  protected readonly side = signal<SidebarSide>('left');
  protected overlay = false;
  protected openOnHover = false;
  protected backdrop = false;

  protected readonly sidebarOpen = signal(true);

  // control values mirrored into signals via (ngModelChange) so the context recomputes; plain
  // ngModel fields alone wouldn't trigger the computed below
  private readonly variantSig = signal<SidebarVariant>('sidebar');
  private readonly collapsibleSig = signal<SidebarCollapsible>('icon');
  private readonly overlaySig = signal(false);
  private readonly openOnHoverSig = signal(false);
  private readonly backdropSig = signal(false);

  protected readonly acmeContext = computed<Partial<SidebarContext>>(() => ({
    name: 'Acme Inc',
    theme: 'violet',
    side: this.side(),
    variant: this.variantSig(),
    collapsible: this.collapsibleSig(),
    overlay: this.overlaySig(),
    openOnHover: this.openOnHoverSig(),
    dismissable: true,
    backdrop: this.backdropSig(),
    nodes: [
      {
        title: 'Navigation', type: 'group', children: [
          {title: 'Home', icon: 'pi pi-home', type: 'link', path: 'home', children: []},
          {title: 'Inbox', icon: 'pi pi-inbox', type: 'link', path: 'inbox', badge: '12', children: []},
          {title: 'Search', icon: 'pi pi-search', type: 'link', path: 'search', children: []},
          {title: 'Notifications', icon: 'pi pi-bell', type: 'link', path: 'notifications', badge: '3', children: []},
        ],
      },
      {
        title: 'Projects', type: 'group', children: [
          {
            title: 'Analytics', icon: 'pi pi-chart-bar', type: 'group', children: [
              {title: 'Overview', type: 'link', path: 'overview', children: []},
              {title: 'Reports', type: 'link', path: 'reports', children: []},
              {title: 'Real-time', type: 'link', path: 'real-time', children: []},
            ],
          },
          {title: 'Team', icon: 'pi pi-users', type: 'link', path: 'team', children: []},
          {title: 'Calendar', icon: 'pi pi-calendar', type: 'link', path: 'calendar', children: []},
          {
            title: 'Documents', icon: 'pi pi-folder', type: 'group', defaultOpen: false, children: [
              {title: 'Contracts', type: 'link', path: 'contracts', children: []},
              {title: 'Invoices', type: 'link', path: 'invoices', children: []},
            ],
          },
        ],
      },
      {
        title: 'Billing', type: 'group', children: [
          {title: 'Payments', icon: 'pi pi-credit-card', type: 'link', path: 'payments', children: []},
          {title: 'Orders', icon: 'pi pi-shopping-cart', type: 'link', path: 'orders', children: []},
          {title: 'Subscriptions', icon: 'pi pi-star', type: 'link', path: 'subscriptions', children: []},
        ],
      },
    ],
  }));

  protected setVariant(value: SidebarVariant): void {
    this.variantSig.set(value);
  }

  protected setCollapsible(value: SidebarCollapsible): void {
    this.collapsibleSig.set(value);
  }

  protected setSide(value: SidebarSide): void {
    this.side.set(value);
  }

  protected setOverlay(value: boolean): void {
    this.overlaySig.set(value);
  }

  protected setOpenOnHover(value: boolean): void {
    this.openOnHoverSig.set(value);
  }

  protected setBackdrop(value: boolean): void {
    this.backdropSig.set(value);
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }
}
