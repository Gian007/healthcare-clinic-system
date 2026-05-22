import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BACKEND_URL': 'window.VITE_BACKEND_URL',
      'import.meta.env.VITE_API_BASE_URL': 'window.VITE_API_BASE_URL',
      'import.meta.env.VITE_BACKEND_URL_RAW': JSON.stringify(backendUrl),
      'import.meta.env.VITE_API_BASE_URL_RAW': JSON.stringify(apiBaseUrl),
    },
    server: {
      host: true,
      allowedHosts: true,
      hmr: backendUrl.includes('tunnelmole') ? {
        clientPort: 443,
        protocol: 'wss',
      } : true,
    },
  }
})


