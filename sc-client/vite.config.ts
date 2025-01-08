import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001, // Set the Vite server to run on port 3001 (or any other available port)
  },
  build: {
    sourcemap: true, // Enable source maps
    outDir: 'dist', // Output directory for built files
  },
});
