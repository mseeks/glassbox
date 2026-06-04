// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ThemeToggle from '../src/shared/ThemeToggle.jsx';
import { setPref } from '../src/shared/useTheme.js';

// useTheme is a module-level store, so normalize it (and localStorage + the
// <html data-theme> it writes) before each test. The jsdom matchMedia stub in
// tests/setup.js reports matches:false, so 'system' resolves to light here.
beforeEach(() => {
  localStorage.clear();
  setPref('system');
});
afterEach(cleanup);

describe('ThemeToggle', () => {
  it('starts in System mode, following the OS (light under the stub)', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /Theme: System/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('cycles System → Light → Dark → System, applying data-theme + persisting', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');

    fireEvent.click(btn); // → light
    expect(screen.getByRole('button', { name: /Theme: Light/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('glassbox-theme')).toBe('light');

    fireEvent.click(btn); // → dark
    expect(screen.getByRole('button', { name: /Theme: Dark/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('glassbox-theme')).toBe('dark');

    fireEvent.click(btn); // → back to system
    expect(screen.getByRole('button', { name: /Theme: System/i })).toBeInTheDocument();
    expect(localStorage.getItem('glassbox-theme')).toBe('system');
  });

  it('keeps color-scheme in sync with the painted theme', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn); // light
    expect(document.documentElement.style.colorScheme).toBe('light');
    fireEvent.click(btn); // dark
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
