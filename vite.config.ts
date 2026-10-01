import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL as NodeURL } from 'node:url'

// 注意：MVP 阶段目录/朝代数据已落盘为 public/data/*.json，
// 页面直接同源读取本地文件渲染，运行时不再请求 api.ctext.org（彻底规避慢/断流问题）。
// 待拿到授权后需要正文时，再启用 src/api/ctext.ts 中的接口封装。
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@': fileURLToPath(new NodeURL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
})
