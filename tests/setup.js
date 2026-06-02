// Vitest setup, applied to every test file. Engine suites run in the default
// node environment; component suites opt into jsdom with a
// `// @vitest-environment jsdom` docblock at the top of the file.
import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia, which usePrefersReducedMotion calls.
// Stub a stable "no-preference" matcher so component renders don't throw.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
