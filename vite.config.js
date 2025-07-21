import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/sistema-turnos-qr/', // Cambia por el nombre de tu repositorio
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
