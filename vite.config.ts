import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions CI 用绝对路径 '/lucky-draw/' (GitHub Pages 项目站);
  // 本地用 './' 兼容 file:// 双击打开 HTML (酒店 Mac 离线场景)
  base: process.env.GITHUB_ACTIONS ? '/lucky-draw/' : './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
