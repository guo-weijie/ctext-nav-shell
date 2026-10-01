import type { CtextBook, SearchResult, TextInfo, Dynasty, DictionaryHeadword } from '@/types/ctext'
import { useLocaleStore } from '@/stores/locale'

// 开发/预览环境经 Vite 代理（/ctext-api）同源转发，规避浏览器直连被重置 + CORS；
// 生产构建则直连 api.ctext.org（其 CORS 已开放）。可用 VITE_API_BASE 覆盖。
const BASE: string =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '/ctext-api' : 'https://api.ctext.org')

// if 参数随界面语言变化：en 模式请求英文元数据，其余用 zh
function ifParam(): string {
  const loc = useLocaleStore().locale
  return loc === 'en' ? 'if=en' : 'if=zh'
}

// 路径若已含查询参数则用 & 拼接，否则用 ? 拼接
function buildUrl(path: string): string {
  const sep = path.includes('?') ? '&' : '?'
  return `${BASE}/${path}${sep}${ifParam()}`
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  // 客户端 30s 超时：上游大响应可能很慢，超时即失败，由调用方回落到本地缓存
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 30000)
  if (signal) signal.addEventListener('abort', () => ctrl.abort())
  try {
    const res = await fetch(buildUrl(path), { signal: ctrl.signal })
    if (!res.ok) throw new Error(`ctext api ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export interface CtextListBooks {
  books: CtextBook[]
}

export const ctextApi = {
  listBooks: () => get<CtextListBooks>('gettexttitles'),

  searchBooks: (title: string) =>
    get<SearchResult>(`searchtexts?title=${encodeURIComponent(title)}`),

  getTextInfo: (urn: string) =>
    get<TextInfo>(`gettextinfo?urn=${encodeURIComponent(urn)}`),

  getDynasties: () => get<{ dynasties: Dynasty[] }>('getdynasties'),

  // getlink 返回规范阅读 URL（纯字符串或 {url} 对象），解析为字符串
  getLink: async (urn: string): Promise<string> => {
    const data = await get<unknown>(`getlink?urn=${encodeURIComponent(urn)}`)
    if (typeof data === 'string') return data
    if (data && typeof data === 'object') {
      const url = (data as { url?: string }).url
      if (url) return url
    }
    return ''
  },

  getDictionaryHeadwords: () => get<{ words: DictionaryHeadword[] }>('getdictionaryheadwords'),
}
