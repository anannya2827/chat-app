import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are resolved relative to the deployment index.html
  build: {
    outDir: 'dist', // The output directory where production files are built
  }
})
