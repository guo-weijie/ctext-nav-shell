import i18n from '@/i18n'
import type { Locale } from '@/types/ctext'

const SITE = 'https://ctext.keep-silent.com'

// 界面语言 -> HTML lang 属性（利于中文/多语言搜索引擎识别）
const LANG_MAP: Record<Locale, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-HK',
  en: 'en',
}

function upsertMeta(key: 'name' | 'property', value: string, content: string): void {
  const selector = `meta[${key}="${value}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(key, value)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// 按路由设置标题/描述/OG/Twitter/Canonical（文案来自 i18n，跟随当前语言）
export function applySeo(opts: { titleKey?: string; descriptionKey?: string }): void {
  const t = i18n.global.t
  const siteName = t('seo.siteName')
  const pageTitle = opts.titleKey ? t(opts.titleKey) : ''
  const fullTitle = pageTitle ? `${pageTitle} · ${siteName}` : siteName
  document.title = fullTitle
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('name', 'twitter:title', fullTitle)

  if (opts.descriptionKey) {
    const desc = t(opts.descriptionKey)
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('name', 'twitter:description', desc)
  }

  const url = SITE + (location.pathname || '/')
  upsertLink('canonical', url)
  upsertMeta('property', 'og:url', url)
}

// 书籍详情页：用真实书名覆盖路由级标题
export function setPageTitle(rawTitle: string): void {
  const full = `${rawTitle} · ${i18n.global.t('seo.siteName')}`
  document.title = full
  upsertMeta('property', 'og:title', full)
  upsertMeta('name', 'twitter:title', full)
}

export function setHtmlLang(locale: Locale): void {
  document.documentElement.lang = LANG_MAP[locale] ?? 'zh-CN'
}
