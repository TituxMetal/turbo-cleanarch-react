import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { baseConfig } from './base.js'

export const nodeConfig = [
  ...baseConfig,
  {
    // Apply this configuration to all Node/TS files
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked // Use TypeChecked for NestJS
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      // Note: NestJS should be run as 'module' if package.json has "type": "module"
      sourceType: 'module',
      parserOptions: {
        // Project must be configured locally in the app's eslint.config.js
        projectService: true
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

      // NestJS Specific Overrides (from your legacy node.js)
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off'
    }
  }
]
