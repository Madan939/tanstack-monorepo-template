import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@workspace/ui/components/primitives': path.resolve(__dirname, '../../packages/ui/src/components/design'),
    },
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  ssr: {
    noExternal: [/^@workspace\/.*/],
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, "../.."),
        path.resolve(__dirname, "../../node_modules"),
        path.resolve(__dirname, "../../packages"),
        path.resolve(__dirname, "."),
      ],
    },
  },
})

export default config
