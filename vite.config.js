import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'rentex-analyzer' with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/rentex-analyzer/',
})
