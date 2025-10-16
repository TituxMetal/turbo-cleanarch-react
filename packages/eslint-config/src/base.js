import configPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

// Define common rules that apply to both Node and Web TypeScript files
export const baseConfig = defineConfig([
  // START OF CRITICAL FIX: The settings block for the TypeScript resolver
  {
    settings: {
      'import/resolver': {
        // This is necessary to allow the import plugin to resolve aliases
        // that are defined in your application's tsconfig.json files.
        typescript: {
          // Searches for tsconfig.json in the current working directory and subdirectories.
          project: ['**/tsconfig.json']
        },
        node: true
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      }
    }
  },
  // END OF CRITICAL FIX

  // 1. Disable all ESLint rules that conflict with Prettier (should be first)
  configPrettier,
  {
    // 2. Load plugins and define formatting rules
    plugins: {
      import: importPlugin,
      prettier: pluginPrettier
    },
    rules: {
      // General JS/TS Rules
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration',
          message:
            'Use arrow function expressions for components and utility functions instead of function declarations.'
        }
      ],

      // Import Rules (relies on the resolver configured above)
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          pathGroups: [
            { pattern: 'node:*', group: 'builtin' },
            { pattern: '~/**', group: 'internal', position: 'after' }
          ],
          pathGroupsExcludedImportTypes: ['builtin']
        }
      ],
      'import/newline-after-import': [
        'error',
        {
          count: 1,
          considerComments: true
        }
      ],

      // Prettier Rule
      'prettier/prettier': 'error'
    }
  }
])
