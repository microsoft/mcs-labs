import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (name: string) => `${import.meta.dirname}/${name}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
  build: {
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 4096,
    rolldownOptions: {
      input: {
        main: page('index.html'),
        redirect: page('redirect.html'),
        relay: page('relay.html'),
      },
    },
  },
})
