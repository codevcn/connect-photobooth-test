import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ các thiết bị khác trong mạng
    port: 3000, // Cổng mặc định, có thể đổi nếu cần
    strictPort: true, // Nếu port bị chiếm, không tự động đổi
    allowedHosts: true, // Cho phép tất cả hosts
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
