/**
 * Every static, user-facing string this library renders — not node titles, which come straight
 * from the sidebar's own `@SidebarNode` titles, and not PrimeNG's own built-in text, which a host
 * configures separately via providePrimeNG's own `translation` option.
 *
 * A host overrides any subset via provideSidebarCrudstone({translations: {...}}); anything left
 * unset falls back to the English default below, so partial/no overrides always render something.
 * Values with `{placeholders}` are filled in by TranslationService#t via simple string
 * replacement — see that file for the exact param names each key expects.
 */
export interface SidebarCrudstoneTranslations {
  loading: string;
  settings: string;

  sidebarNotFound: string; // {name}
  toastErrorSummary: string;
  unknownError: string;
}

/** Replaces every `{name}` in `text` with `params[name]`. Shared by TranslationService and any
 * plain (non-DI) function that needs a translated string with a sensible English fallback. */
export function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) {
    return text;
  }
  let result = text;
  for (const [name, value] of Object.entries(params)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}

export const defaultTranslations: SidebarCrudstoneTranslations = {
  loading: 'Loading...',
  settings: 'Settings',

  sidebarNotFound: 'Sidebar {name} not found',
  toastErrorSummary: 'Error',
  unknownError: 'Unknown error',
};
