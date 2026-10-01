import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/scrollbar.css'
import './styles/form.css'
import { useThemeStore } from './stores/theme'
import { useLocaleStore } from './stores/locale'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

// 初始化主题（读取 localStorage + 系统偏好）与界面语言
useThemeStore().init()
useLocaleStore().init()

app.mount('#app')
