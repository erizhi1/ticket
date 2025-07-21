import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/ticket/', // Nombre de tu repositorio
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
