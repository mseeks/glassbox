import { describe, expect, it } from 'vitest';
import {
  THEME_PREFS,
  THEME_STORAGE_KEY,
  THEMES,
  coercePref,
  nextPref,
  prefLabel,
  resolveTheme,
} from '../src/shared/theme.js';

describe('theme · constants', () => {
  it('stores under a stable key and exposes the three prefs / two themes', () => {
    expect(THEME_STORAGE_KEY).toBe('glassbox-theme');
    expect(THEME_PREFS).toEqual(['system', 'light', 'dark']);
    expect(THEMES).toEqual(['light', 'dark']);
  });
});

describe('theme · coercePref', () => {
  it('passes through the three valid prefs', () => {
    for (const p of THEME_PREFS) expect(coercePref(p)).toBe(p);
  });

  it('falls back to system for anything unknown / missing', () => {
    for (const bad of [null, undefined, '', 'System', 'LIGHT', 'auto', 0, {}]) {
      expect(coercePref(bad)).toBe('system');
    }
  });
});

describe('theme · resolveTheme (the precedence model)', () => {
  it('an explicit pick always wins, regardless of the OS', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', true)).toBe('dark');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('system follows the OS signal', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('an unknown pref is treated as system (follows the OS)', () => {
    expect(resolveTheme('bogus', true)).toBe('dark');
    expect(resolveTheme(undefined, false)).toBe('light');
  });
});

describe('theme · nextPref (toggle cycle)', () => {
  it('cycles system → light → dark → system', () => {
    expect(nextPref('system')).toBe('light');
    expect(nextPref('light')).toBe('dark');
    expect(nextPref('dark')).toBe('system');
  });

  it('an unknown current pref re-enters the cycle at light (treated as system)', () => {
    expect(nextPref('bogus')).toBe('light');
  });

  it('three steps return to the start', () => {
    expect(nextPref(nextPref(nextPref('system')))).toBe('system');
  });
});

describe('theme · prefLabel', () => {
  it('labels each pref for the accessible name', () => {
    expect(prefLabel('system')).toBe('System');
    expect(prefLabel('light')).toBe('Light');
    expect(prefLabel('dark')).toBe('Dark');
    expect(prefLabel('bogus')).toBe('System');
  });
});
