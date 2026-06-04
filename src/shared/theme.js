/* The precedence model behind the site-wide light/dark switch — kept pure
   (no React, no DOM) so it can be unit-tested in node (tests/theme.test.js) and
   so the pre-paint inline script in index.html can mirror it exactly without
   importing anything.

   The "friendly precedence" pattern: three preference states, where an explicit
   pick always wins and 'system' tracks the OS live.

     pref = 'system'  →  follow `prefers-color-scheme`, live  (the default)
     pref = 'light'   →  forced light, persisted
     pref = 'dark'    →  forced dark, persisted

   The toggle cycles system → light → dark → system. resolveTheme() collapses a
   preference + the OS signal down to the one theme actually painted. */

/** localStorage key holding the user's explicit preference. */
export const THEME_STORAGE_KEY = 'glassbox-theme';

/** The three preference states (also the toggle's cycle order). */
export const THEME_PREFS = ['system', 'light', 'dark'];

/** The two resolved themes that actually get painted onto `<html data-theme>`. */
export const THEMES = ['light', 'dark'];

/** Coerce any stored / raw value into a valid preference. Unknown → 'system'. */
export function coercePref(raw) {
  return THEME_PREFS.includes(raw) ? raw : 'system';
}

/**
 * Resolve a preference + the OS signal into the theme to paint.
 * Explicit 'light' / 'dark' win; 'system' (or anything unknown) follows the OS.
 */
export function resolveTheme(pref, systemPrefersDark) {
  const p = coercePref(pref);
  if (p === 'light' || p === 'dark') return p;
  return systemPrefersDark ? 'dark' : 'light';
}

/** Cycle order for the toggle: system → light → dark → system. */
export function nextPref(pref) {
  const i = THEME_PREFS.indexOf(coercePref(pref));
  return THEME_PREFS[(i + 1) % THEME_PREFS.length];
}

/** Human-readable label for a preference (used in the toggle's accessible name). */
export function prefLabel(pref) {
  return { system: 'System', light: 'Light', dark: 'Dark' }[coercePref(pref)];
}
