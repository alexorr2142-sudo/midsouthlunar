import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH is "/midsouthlunar/" on the github.io project site and "/" once
// the site is served from midsouthlunar.org. Set by the deploy workflow.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
