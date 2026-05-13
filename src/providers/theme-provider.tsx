/**
 * Theme_Provider: single source of truth for the admin panel color mode.
 *
 * Responsibilities (design.md §3, Requirements 3.5, 3.6):
 *   - Track the user's preference (`"light" | "dark" | "system"`) and
 *     persist it under the `localloom-admin-theme` localStorage key so
 *     reloads keep the same mode.
 *   - Resolve `"system"` by consulting `matchMedia("(prefers-color-scheme:
 *     dark)")`, and re-resolve whenever that media query changes — but
 *     only while the user's preference is `"system"`. Explicit `"light"`
 *     or `"dark"` wins and ignores the OS.
 *   - Toggle the `dark` class on `document.documentElement` so shadcn's
 *     `.dark` token overrides in `tokens.css` take effect across the tree
 *     in one place rather than via per-component props.
 *
 * `useTheme()` throws when consumed outside the provider so a missing
 * wrapper fails loudly in development rather than silently defaulting.
 */

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "localloom-admin-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export interface ThemeContextValue {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => readStoredTheme());
  const [resolved, setResolved] = React.useState<ResolvedTheme>(() =>
    resolveTheme(readStoredTheme()),
  );

  // Apply the resolved mode to <html>, persist the user's choice, and
  // keep `resolved` in sync when the preference itself changes. System
  // tracking is handled separately below so we don't rebind the media
  // query listener on every render.
  React.useEffect(() => {
    const next = resolveTheme(theme);
    setResolved(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Only listen to OS changes while the user explicitly opted into
  // `"system"`. Binding unconditionally would leak dark-mode flips into
  // an explicit `"light"`/`"dark"` choice.
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia(DARK_MEDIA_QUERY);
    const handler = (event: MediaQueryListEvent) => {
      const next: ResolvedTheme = event.matches ? "dark" : "light";
      setResolved(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
