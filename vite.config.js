import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Using a relative base makes this easier to deploy to GitHub Pages
  // without having to manually change the repo name in most cases.
  base: './',
})
