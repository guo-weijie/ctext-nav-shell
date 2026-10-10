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
      // 古籍气质：Windows 优先宋体/仿宋，macOS 回退 Songti SC / STSong，最后通用衬线
      serif:
        '"SimSun", "宋体", "NSimSun", "FangSong", "仿宋", "STFangsong", "Songti SC", "STSong", "Source Han Serif SC", serif',
    },
  },
})
