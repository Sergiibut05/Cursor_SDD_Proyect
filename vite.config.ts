import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const githubPagesBase = '/Cursor_SDD_Proyect/'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? githubPagesBase : '/',
  plugins: [react(), tailwindcss()],
}))
