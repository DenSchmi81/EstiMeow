import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base, damit der Build unter https://<user>.github.io/<repo>/ funktioniert.
export default defineConfig({
  base: './',
  plugins: [react()],
});
