import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['axios'], // Add more libraries here if needed
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: raises the limit from 500 KB to 1000 KB
  },
});
