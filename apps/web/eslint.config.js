// @ts-check
import path from 'path'
import { fileURLToPath } from 'url'

import { webConfig } from '@repo/eslint-config/web'
import { defineConfig, globalIgnores } from 'eslint/config'

// Use this only if __dirname is not available (which it often isn't in ESM/Flat configs)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Turborepo requires the path to be resolved locally for the parser
const webLocalConfig = defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        // Essential fix for monorepo TS parsing error (TSConfig must point to app root)
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    }
    // Note: All custom rules (import/order, arrow-body-style, etc.) are now in base.js
    // Add any web-specific overrides here.
  }
])

export default defineConfig(
  globalIgnores(['dist']),
  // Extend the shared Web configuration
  ...webConfig,
  // Apply local overrides
  webLocalConfig
)
