import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // `agents/` is the self-contained Many Hands Engineering loop package (its own
  // tsconfig + node_modules, TypeScript via tsx); it is never part of the app's
  // lint/format/build graph.
  { ignores: ['dist', 'node_modules', 'coverage', 'agents'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Lessons are prose-heavy; smart-quote pedantry is editorial noise, not a defect.
      'react/no-unescaped-entities': 'off',
      // Lessons render literal code samples in JSX text (e.g. "// like this"); not a bug.
      'react/jsx-no-comment-textnodes': 'off',
      // Pedagogical content uses Unicode separators (·, —, etc.) intentionally.
      'no-irregular-whitespace': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
