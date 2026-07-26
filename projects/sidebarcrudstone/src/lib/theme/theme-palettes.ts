/**
 * Fixed preset of accent colors a sidebar can be shown in — picked by `SidebarContext.theme`
 * (from context-gen's `@Sidebar#theme()`) as the initial (and only) value: this component has no
 * runtime theme picker of its own. Values are the same standard Tailwind CSS palette crudstone's
 * own `ThemePalettes.ts` and search-crudstone's own `theme-palettes.ts` use, so a sidebar and
 * whatever entity pages it links to read consistently alongside each other even when given
 * different themes.
 *
 * "primary" is a sentinel, not a real palette: it means "don't override anything, inherit
 * whatever the host app's PrimeNG preset already defines as primary" — see themeVars().
 */
export interface ThemePalette {
  name: string;
  // absent only for the "primary" sentinel entry, which has no palette of its own to apply
  shades?: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  primary: {name: 'Default'},
  emerald: {
    name: 'Emerald',
    shades: {50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'},
  },
  green: {
    name: 'Green',
    shades: {50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16'},
  },
  teal: {
    name: 'Teal',
    shades: {50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e'},
  },
  cyan: {
    name: 'Cyan',
    shades: {50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'},
  },
  blue: {
    name: 'Blue',
    shades: {50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'},
  },
  indigo: {
    name: 'Indigo',
    shades: {50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'},
  },
  violet: {
    name: 'Violet',
    shades: {50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'},
  },
  purple: {
    name: 'Purple',
    shades: {50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764'},
  },
  pink: {
    name: 'Pink',
    shades: {50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724'},
  },
  red: {
    name: 'Red',
    shades: {50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'},
  },
  orange: {
    name: 'Orange',
    shades: {50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407'},
  },
  amber: {
    name: 'Amber',
    shades: {50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'},
  },
};

/**
 * The CSS custom-property overrides for `theme`, meant to be bound directly as an inline
 * `[style]` object — on the component's own host element. Deliberately host-scoped rather than a
 * document-root override: more than one `sb-sidebar` instance (each pointed at a different,
 * differently-themed named sidebar) can coexist on one page, so a global override would make the
 * second instance's theme bleed into the first.
 *
 * "primary" (or an unrecognized name) returns `{}`: no override, inherit whatever the host app's
 * own preset already defines.
 */
export function themeVars(theme: string | null | undefined): Record<string, string> {
  const palette = theme ? THEME_PALETTES[theme] : undefined;
  if (!palette || theme === 'primary' || !palette.shades) {
    return {};
  }
  const s = palette.shades;
  const vars: Record<string, string> = {};
  for (const [shade, color] of Object.entries(s)) {
    vars[`--p-primary-${shade}`] = color;
  }
  vars['--p-primary-color'] = s[500];
  vars['--p-primary-contrast-color'] = '#ffffff';
  vars['--p-primary-hover-color'] = s[600];
  vars['--p-primary-active-color'] = s[700];

  return vars;
}
