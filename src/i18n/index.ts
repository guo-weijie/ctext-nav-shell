import { createI18n } from 'vue-i18n'
import zhHans from './messages/zh-Hans'
import zhHant from './messages/zh-Hant'
import en from './messages/en'

// 仅控制 UI 文案；古籍内容（书名/朝代等）由 API 原样返回，不做任何转换
export default createI18n({
  legacy: false,
  locale: 'zh-Hans',
  fallbackLocale: 'en',
  messages: {
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
    en,
  },
})
