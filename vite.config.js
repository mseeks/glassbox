import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Vitest transforms JSX via esbuild; opt into the automatic runtime so source
  // files (which don't import React) render in tests. The production build uses
  // oxc, which ignores (and warns about) this option, so set it only for tests.
  ...(mode === 'test' ? { esbuild: { jsx: 'automatic' } } : {}),
  test: {
    // Engine suites run in node; component suites opt into jsdom per-file with
    // a `// @vitest-environment jsdom` docblock.
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      // Gate the pure engines — the logic the unit suites actually exercise.
      // The React/CSS layer is covered by the Playwright smoke, not line
      // coverage, so it would only dilute a meaningful threshold here.
      include: ['src/lessons/*/engine/**/*.js'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
}));
