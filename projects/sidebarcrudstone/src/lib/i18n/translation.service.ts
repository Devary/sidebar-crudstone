import {Inject, Injectable, Optional} from '@angular/core';
import {SIDEBAR_CRUDSTONE_CONFIG, SidebarCrudstoneConfig} from '../sidebar-crudstone-config';
import {SidebarCrudstoneTranslations, defaultTranslations, interpolate} from './sidebar-crudstone-translations';

/**
 * Resolves every static string the library renders. Two ways a host can override the English
 * defaults, checked in this order:
 *
 * 1. `SidebarCrudstoneConfig.translate` — a live bridge into the host's own i18n mechanism
 *    (ngx-translate, transloco, etc). Called fresh on every `t()` lookup, so if the host's
 *    translation files change language at runtime, this library's strings follow along on the
 *    next render — no caching here, no re-bootstrap needed.
 * 2. `SidebarCrudstoneConfig.translations` — a plain static object, merged over the English
 *    defaults once at construction. Fine for a single fixed language; ignored if `translate` is set.
 *
 * Neither path is required — with nothing configured, every string just renders in English.
 * Node titles aren't handled here: those come straight from the sidebar's own `@SidebarNode`
 * titles, a per-node concern rather than UI chrome.
 */
@Injectable({providedIn: 'root'})
export class TranslationService {
  private readonly staticTranslations: SidebarCrudstoneTranslations;

  constructor(@Optional() @Inject(SIDEBAR_CRUDSTONE_CONFIG) private config: SidebarCrudstoneConfig | null) {
    this.staticTranslations = {...defaultTranslations, ...config?.translations};
  }

  /**
   * Looks up `key`. With a `translate` bridge configured, `params` is passed through untouched
   * (the host's own i18n mechanism does its own interpolation); otherwise `{name}` placeholders
   * in the static/default string are replaced with `params[name]`.
   */
  t(key: keyof SidebarCrudstoneTranslations, params?: Record<string, string | number>): string {
    if (this.config?.translate) {
      return this.config.translate(key, params);
    }
    return interpolate(this.staticTranslations[key], params);
  }
}
