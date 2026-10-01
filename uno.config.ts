import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  theme: {
    colors: {
      // 古籍气质配色：米纸白 / 墨黑 / 暖灰
      paper: '#f5f1e8',
      ink: '#2b2b2b',
    },
    fontFamily: {
      serif: '"Noto Serif SC", "Songti SC", "Source Han Serif SC", serif',
    },
  },
})
