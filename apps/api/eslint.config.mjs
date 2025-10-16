// @ts-check
import { nodeConfig } from '@repo/eslint-config/node'
import { defineConfig } from 'eslint/config'

// Turborepo requires the path to be resolved locally for the parser
const apiLocalConfig = defineConfig([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Essential fix for monorepo TS parsing error (TSConfig must point to app root)
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
    // The rules below are defined in the shared config, but you can override here if needed.
    // rules: {
    //   '@typescript-eslint/no-explicit-any': 'off',
    //   '@typescript-eslint/no-floating-promises': 'warn',
    //   '@typescript-eslint/no-unsafe-argument': 'warn',
    // },
  }
])

export default defineConfig(
  {
    ignores: ['dist', 'coverage', '.turbo', '**/*spec.ts', '**/*test.ts']
  },
  // Extend the shared Node configuration
  ...nodeConfig,
  // Apply local overrides
  apiLocalConfig
)
