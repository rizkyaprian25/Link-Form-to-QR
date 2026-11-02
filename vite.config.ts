import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Gunakan path relatif ('./') agar aset berjalan sempurna di GitHub Pages (subpath repository)
  // maupun di Vercel, Netlify, atau Cloudflare Pages (root domain).
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  }
});
