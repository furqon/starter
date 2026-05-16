import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist/client',
  },
  ssr: {
    noExternal: ['vue-router'],
  },
})
