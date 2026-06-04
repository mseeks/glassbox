import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY, coercePref, nextPref, resolveTheme } from './theme.js';

/* The DOM + React binding for the pure precedence model in theme.js.
 *
 * A single module-level store is the source of truth: it reads the persisted
 * preference, tracks the OS `prefers-color-scheme` live, applies the resolved
 * theme to `<html data-theme>` (+ `color-scheme` + the theme-color meta), and
 * fans changes out to every useTheme() consumer via useSyncExternalStore.
 *
 * First paint is handled by the inline script in index.html (no flash); this
 * store mirrors the same resolution and then owns every change after hydration. */

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// The painted background per theme. MUST match --paper in src/shared/tokens.css
// so the mobile browser chrome (theme-color) agrees with the page.
const META_COLOR = { dark: '#0a0a0f', light: '#f4efe4' };

function systemPrefersDark() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

function readStoredPref() {
  try {
    return coercePref(
      typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null,
    );
  } catch {
    return 'system'; // storage blocked (private mode, etc.) → follow the OS
  }
}

// ── Module store: one instance shared by every consumer ─────────────────────
let pref = readStoredPref();
let theme = resolveTheme(pref, systemPrefersDark());
let snapshot = { pref, theme }; // cached so getSnapshot returns a stable ref
const listeners = new Set();

function applyDom() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLOR[theme]);
}

function recompute() {
  const nextTheme = resolveTheme(pref, systemPrefersDark());
  if (nextTheme === theme && snapshot.pref === pref) return; // nothing changed
  theme = nextTheme;
  snapshot = { pref, theme };
  applyDom();
  for (const listener of listeners) listener();
}

// Track the OS preference live (wired once at module scope). When in 'system'
// mode this flips the painted theme; an explicit pick simply ignores it.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mql = window.matchMedia(COLOR_SCHEME_QUERY);
  if (mql.addEventListener) mql.addEventListener('change', recompute);
  else if (mql.addListener) mql.addListener(recompute); // older Safari
}

// Reconcile the DOM with the store once at import (idempotent with the inline
// script; also covers any context where that script didn't run).
applyDom();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

/** Set the explicit preference ('system' | 'light' | 'dark'), persist it, repaint. */
export function setPref(next) {
  pref = coercePref(next);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // ignore storage failures — the in-memory pref still drives this session
  }
  recompute();
}

/** Advance the preference one step: system → light → dark → system. */
export function cyclePref() {
  setPref(nextPref(pref));
}

/**
 * Subscribe to the site-wide theme.
 *
 *   pref  — 'system' | 'light' | 'dark' (the user's choice; 'system' tracks OS)
 *   theme — 'light' | 'dark' (what is actually painted right now)
 */
export function useTheme() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { pref: snap.pref, theme: snap.theme, cyclePref, setPref };
}
