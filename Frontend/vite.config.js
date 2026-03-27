import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.png', '**/*.glb', '**/*.gltf'],
  server: {
    host: true,      // ✅ expose to network
    port: 5173
  }, build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          tensorflow: ['@tensorflow/tfjs', '@tensorflow-models/face-landmarks-detection'],
          mediapipe: ['@mediapipe/face_mesh']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
