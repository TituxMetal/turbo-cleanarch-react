import eslint from '@eslint/js'
import reactDom from 'eslint-plugin-react-dom'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactX from 'eslint-plugin-react-x'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { baseConfig } from './base.js'

export const webConfig = [
  ...baseConfig,
  {
    // Apply this configuration to all Web/React files
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended, // Basic TS recommended (no type-checking needed here)
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended
    ],
    languageOptions: {
      globals: globals.browser,
      sourceType: 'module',
      parserOptions: {
        // Project must be configured locally in the app's eslint.config.js
      }
    },
    rules: {
      // Common TypeScript rules
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
          destructuredArrayIgnorePattern: '^_*',
          argsIgnorePattern: '^_*'
        }
      ],

      // React-specific rules
      'import/no-default-export': 'error' // Enforce named exports for components
    }
  },
  {
    // Configuration for local config files (vite.config.ts, eslint.config.js)
    files: ['vite.config.ts', 'eslint.config.js'],
    rules: {
      'import/no-default-export': 'off', // Allow default exports in config files
      'no-restricted-syntax': 'off' // Allow 'function' keyword in config files
    }
  }
]
