import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isCI = !!process.env.GITHUB_ACTIONS

// https://vite.dev/config/
export default defineConfig({
  // CI: '/lucky-draw/' (GitHub Pages 项目站);
  // 本地: './' + singlefile 内联 JS/CSS → 双击 HTML 即可离线打开
  base: isCI ? '/lucky-draw/' : './',
  plugins: [
    react(),
    tailwindcss(),
    ...(!isCI ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
