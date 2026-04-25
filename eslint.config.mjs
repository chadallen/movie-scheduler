import nextConfig from 'eslint-config-next/core-web-vitals';

// Extract the @typescript-eslint/parser instance that eslint-config-next
// already bundles (it's not a hoisted dep so we can't import it directly).
// The 'next/typescript' config entry holds it in languageOptions.parser.
const tsConfig = nextConfig.find((c) => c.name === 'next/typescript');
const tsParser = tsConfig?.languageOptions?.parser;

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    // Override parser for all files: the babel-based parser bundled with
    // eslint-config-next is incompatible with ESLint 10 (scopeManager API
    // change). Use @typescript-eslint/parser for the whole project instead
    // (this is a pure TypeScript project with no plain JS source files).
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        // Explicit version avoids a getFilename() call removed in ESLint 10
        // (eslint-plugin-react 7.x "detect" path).
        version: '19',
      },
    },
    rules: {
      // react-hooks/set-state-in-effect is a new stricter rule introduced in
      // eslint-plugin-react-hooks v6 (shipped with Next.js 16). The existing
      // codebase pre-dates this rule; disable it to maintain prior behaviour.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
