import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Locale } from '@/types/ctext'
import i18n from '@/i18n'
import { setHtmlLang } from '@/utils/seo'

const KEY = 'ctext:locale'

function detect(): Locale {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'zh-Hans'
  const lower = nav.toLowerCase()
  if (lower.startsWith('en')) return 'en'
  if (lower.startsWith('zh')) {
    // 粗判繁体区域
    if (/(hk|tw|mo|hant)/i.test(nav)) return 'zh-Hant'
    return 'zh-Hans'
  }
  return 'zh-Hans'
}

export const useLocaleStore = defineStore('locale', () => {
  const saved =
    (typeof localStorage !== 'undefined' ? (localStorage.getItem(KEY) as Locale | null) : null) ?? detect()
  const locale = ref<Locale>(saved)

  function setLocale(l: Locale): void {
    locale.value = l
    i18n.global.locale.value = l
    localStorage.setItem(KEY, l)
    setHtmlLang(l)
    // 目录/朝代均为本地静态文件且语言无关（书名恒为中文），切换界面语言无需重载数据
  }

  function init(): void {
    i18n.global.locale.value = locale.value
    setHtmlLang(locale.value)
  }

  return { locale, setLocale, init }
})
