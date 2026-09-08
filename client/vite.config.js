// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//       }
//     }
//   }
// })
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: "https://skillswap-iit.onrender.com", // use the env variable
          changeOrigin: true,
        }
      }
    }
  }
})
