import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()] as PluginOption[],
  server: { port: 4321 },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  }
})
