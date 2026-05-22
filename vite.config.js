import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()], // 这里也去掉了 cloudflare()
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})