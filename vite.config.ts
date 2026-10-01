import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL as NodeURL } from 'node:url'

// 注意：目录/朝代数据已落盘为 public/data/catalog.json，
// 页面直接同源读取本地文件渲染，运行时零外部请求（彻底规避 api.ctext.org 慢/断流问题）。
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
