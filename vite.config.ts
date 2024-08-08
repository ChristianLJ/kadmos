import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  root: "./examples",
  build: {
    outDir: 'dist'
  },
  server: {
    port: 1234
  },
})
