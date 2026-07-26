import {InjectionToken, Provider} from '@angular/core';
import {SidebarCrudstoneTranslations} from './i18n/sidebar-crudstone-translations';

/**
 * Host-app-provided configuration. The library never reads a consuming app's
 * own environment file (it can't — that only resolves inside the same
 * workspace); every consumer supplies this via provideSidebarCrudstone() instead.
 */
export interface SidebarCrudstoneConfig {
  /** Base URL for sidebar-context lookups, e.g. 'http://localhost:9100/sidebar/'. */
  sidebarUrl: string;
  /**
   * Base URL of the app that actually serves each entity's CRUD table (dynamic-crud's own
   * `crudstone` — a different app than this one), e.g. 'http://localhost:5900/'. A link node's
   * resolved `path` (from its own `@CrudstoneEntity`) is appended to this to build its full href
   * — sidebar-crudstone never renders a CRUD table itself, only links out to one.
   */
  crudstoneUrl: string;
  /**
   * When true, sidebar-context requests are read from a static JSON fixture
   * (sidebarUrl + '<name>.json') instead of a live endpoint — useful for demos and offline
   * development.
   */
  localMode?: boolean;
  /**
   * Static overrides for the library's own UI strings (see TranslationService). Only override
   * what you need — anything left unset keeps its English default. Fine for an app with one
   * fixed language; captured once at bootstrap (a plain object, not reactive), so if the host
   * switches locale at runtime, these values don't follow along — use `translate` below instead
   * for that case. Ignored when `translate` is also provided.
   */
  translations?: Partial<SidebarCrudstoneTranslations>;
  /**
   * Bridges the library's own strings into the host app's own i18n mechanism (ngx-translate,
   * transloco, Angular i18n, a plain JSON file — whatever it already uses), instead of this
   * library owning a second, separate translation source. Called on every `t()` lookup, live, so
   * the host's translation files drive this library's strings at runtime: switch the host's
   * active language and the next render reflects it too, no re-bootstrap needed. Takes priority
   * over `translations` when both are set; unset falls back to the English defaults (or
   * `translations`' overrides of them).
   */
  translate?: (key: keyof SidebarCrudstoneTranslations, params?: Record<string, string | number>) => string;
}

export const SIDEBAR_CRUDSTONE_CONFIG = new InjectionToken<SidebarCrudstoneConfig>('SIDEBAR_CRUDSTONE_CONFIG');

export function provideSidebarCrudstone(config: SidebarCrudstoneConfig): Provider[] {
  return [{provide: SIDEBAR_CRUDSTONE_CONFIG, useValue: config}];
}
