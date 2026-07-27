import {Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, PrimeTemplate} from 'primeng/api';
import {SidebarCollapsible, SidebarComponent, SidebarContext, SidebarService, SidebarSide, SidebarVariant, THEME_PALETTES} from 'sidebarcrudstone';

interface SidebarSettings {
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
  overlay: boolean;
  openOnHover: boolean;
  backdrop: boolean;
  theme: string;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: SidebarSettings = {
  variant: 'sidebar',
  collapsible: 'icon',
  side: 'left',
  overlay: false,
  openOnHover: false,
  backdrop: false,
  // matches dynamic-crud's own boot defaults: light Aura, host-default (emerald) primary
  theme: 'primary',
  darkMode: false,
};

/**
 * Demo page: the REAL "main" sidebar (quar-crud-host's MainSidebar class, same data /main shows)
 * pinned to the screen edge, its layout params living in a Settings modal opened from the footer
 * user dropdown (sb-sidebar's `settingsMenu` mode). The context is fetched once, the applied
 * settings are seeded from what the backend served, and the merged context (backend nodes +
 * client-side setting overrides) feeds sb-sidebar's `context` input. Modal follows the
 * ecosystem-wide CRUD-modal pattern: staged edits, confirm-before-save, confirm-before-discard
 * when dirty, no free close. Demo-app only, not part of the library.
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
  /** Every palette the ecosystem's theme-palettes module defines, plus the host-default sentinel. */
  protected readonly themeOptions = Object.entries(THEME_PALETTES).map(([value, palette]) => ({
    label: palette.name,
    value,
    color: palette.shades?.[500] ?? null,
  }));

  /** The applied settings — what the sidebar actually renders with. */
  protected readonly settings = signal<SidebarSettings>({...DEFAULT_SETTINGS});

  /** The modal's staged working copy — only committed on a confirmed Save. */
  protected staged: SidebarSettings = {...DEFAULT_SETTINGS};

  protected readonly settingsOpen = signal(false);
  protected readonly sidebarOpen = signal(true);

  /** The backend-served MainSidebar context — nodes and initial layout/theme come from here. */
  private readonly fetched = signal<SidebarContext | null>(null);

  constructor(private confirmationService: ConfirmationService, sidebarService: SidebarService) {
    sidebarService.getSidebar('main').subscribe(context => {
      this.fetched.set(context);
      // the backend's own @Sidebar config is the starting point; settings override from there
      this.settings.update(current => ({
        ...current,
        variant: context.variant,
        collapsible: context.collapsible,
        side: context.side,
        overlay: context.overlay,
        openOnHover: context.openOnHover,
        backdrop: context.backdrop,
        theme: context.theme,
      }));
    });
  }

  /** Backend nodes/name + the applied client-side setting overrides. */
  protected readonly mainContext = computed<Partial<SidebarContext> | null>(() => {
    const fetched = this.fetched();
    if (!fetched) {
      return null;
    }
    const applied = this.settings();
    return {
      ...fetched,
      side: applied.side,
      variant: applied.variant,
      collapsible: applied.collapsible,
      overlay: applied.overlay,
      openOnHover: applied.openOnHover,
      backdrop: applied.backdrop,
      theme: applied.theme,
    };
  });

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
        document.documentElement.classList.toggle('app-dark', this.staged.darkMode);
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
