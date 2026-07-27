import {Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, PrimeTemplate} from 'primeng/api';
import {SidebarCollapsible, SidebarComponent, SidebarContext, SidebarSide, SidebarVariant} from 'sidebarcrudstone';

interface SidebarSettings {
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
  overlay: boolean;
  openOnHover: boolean;
  backdrop: boolean;
}

const DEFAULT_SETTINGS: SidebarSettings = {
  variant: 'sidebar',
  collapsible: 'icon',
  side: 'left',
  overlay: false,
  openOnHover: false,
  backdrop: false,
};

/**
 * Demo page: the Acme Inc sidebar pinned to the screen edge, its layout params living in a
 * Settings modal opened from the sidebar's own brand dropdown (sb-sidebar's `settingsMenu`
 * mode). Modal follows the ecosystem-wide CRUD-modal pattern: staged edits, confirm-before-save,
 * confirm-before-discard when dirty, no free close. Demo-app only, not part of the library.
 */
@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [FormsModule, Select, ToggleSwitch, Dialog, Button, ConfirmDialog, PrimeTemplate, SidebarComponent],
  providers: [ConfirmationService],
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
  protected readonly sideOptions = [
    {label: 'Left', value: 'left' as SidebarSide},
    {label: 'Right', value: 'right' as SidebarSide},
  ];

  /** The applied settings — what the sidebar actually renders with. */
  protected readonly settings = signal<SidebarSettings>({...DEFAULT_SETTINGS});

  /** The modal's staged working copy — only committed on a confirmed Save. */
  protected staged: SidebarSettings = {...DEFAULT_SETTINGS};

  protected readonly settingsOpen = signal(false);
  protected readonly sidebarOpen = signal(true);

  constructor(private confirmationService: ConfirmationService) {
  }

  protected readonly acmeContext = computed<Partial<SidebarContext>>(() => ({
    name: 'Acme Inc',
    theme: 'violet',
    side: this.settings().side,
    variant: this.settings().variant,
    collapsible: this.settings().collapsible,
    overlay: this.settings().overlay,
    openOnHover: this.settings().openOnHover,
    dismissable: true,
    backdrop: this.settings().backdrop,
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

  /**
   * The content area's offset for the pinned sidebar: full width when open, the icon rail when
   * icon-collapsed, nothing in overlay mode (the sidebar floats over the content instead of
   * pushing it). Floating/inset variants carry their own 0.5rem padding on each side.
   */
  protected readonly contentStyle = computed<Record<string, string>>(() => {
    const applied = this.settings();
    if (applied.overlay) {
      return {} as Record<string, string>;
    }
    const variantPad = applied.variant === 'sidebar' ? 0 : 1;
    const width = this.sidebarOpen() || applied.collapsible === 'none'
      ? `${16 + variantPad}rem`
      : applied.collapsible === 'icon' ? `${3.25 + variantPad}rem`
        : '0rem';
    return applied.side === 'left' ? {'margin-left': width} : {'margin-right': width};
  });

  protected openSettings(): void {
    this.staged = {...this.settings()};
    this.settingsOpen.set(true);
  }

  private get dirty(): boolean {
    const applied = this.settings();
    return (Object.keys(applied) as (keyof SidebarSettings)[]).some(key => this.staged[key] !== applied[key]);
  }

  protected saveSettings(): void {
    if (!this.dirty) {
      this.settingsOpen.set(false);
      return;
    }
    this.confirmationService.confirm({
      header: 'Apply settings',
      message: 'Apply these sidebar settings?',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Yes, apply',
      rejectLabel: 'Keep editing',
      accept: () => {
        this.settings.set({...this.staged});
        this.settingsOpen.set(false);
      },
    });
  }

  protected cancelSettings(): void {
    if (!this.dirty) {
      this.settingsOpen.set(false);
      return;
    }
    this.confirmationService.confirm({
      header: 'Discard changes',
      message: 'You have unsaved changes. Discard them?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, discard',
      rejectLabel: 'Keep editing',
      accept: () => this.settingsOpen.set(false),
    });
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }
}
