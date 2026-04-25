import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // 小于 100KB 的资源将内联为 base64，避免生成 assets.js
    assetsInlineLimit: 102400
  }
})
