import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCatalogStore } from './catalog'
import { toSimplified, ensureConverter, isConverterReady } from '@/utils/normalize'
import type { CtextBook } from '@/types/ctext'

// 搜索优先：目录已落盘本地，直接对书名/URN 做子串匹配（防抖由 SearchBar 控制），无需调用 searchtexts 接口
export const useSearchStore = defineStore('search', () => {
  const catalog = useCatalogStore()
  const query = ref('')
  // 用户是否主动发起过搜索（用于区分"提示输入"与"无结果"两种空态）
  const searched = ref(false)
  // OpenCC 转换器是否就绪（异步加载完成）；就绪后搜索自动切换为繁简归一匹配
  const converterReady = ref(false)
  ensureConverter().then(() => {
    converterReady.value = true
  })

  // 简体书名缓存（urn -> 简体书名），避免每次搜索重复转换全部书目。
  // 仅在转换器就绪后构建，否则留空走回退匹配。
  let cacheRef: unknown = null
  let simplCache = new Map<string, string>()
  function ensureCache(): void {
    if (!isConverterReady()) return
    if (cacheRef === catalog.books && simplCache.size === catalog.books.length) return
    simplCache = new Map()
    for (const b of catalog.books) simplCache.set(b.urn, toSimplified(b.title))
    cacheRef = catalog.books
  }

  // 对给定书目列表应用当前查询（书名/URN 子串匹配），供分类导航叠加搜索复用
  // 书名匹配先做繁简归一（都转简体），使简体/繁体输入都能命中繁体/简体书名
  function applyQuery(list: CtextBook[]): CtextBook[] {
    const term = query.value.trim().toLowerCase()
    if (!term) return list
    const q = toSimplified(term).toLowerCase()
    ensureCache()
    return list.filter((b) => {
      const st = simplCache.get(b.urn) ?? toSimplified(b.title)
      return st.toLowerCase().includes(q) || b.urn.toLowerCase().includes(term)
    })
  }

  // 空查询 → 返回全部书目（浏览模式）；非空 → 书名/URN 子串匹配（繁简互通）
  // 显式读取 converterReady 使其成为依赖：转换器加载完成后自动用归一匹配重算结果
  const filtered = computed<CtextBook[]>(() => {
    void converterReady.value
    return applyQuery(catalog.books)
  })

  function setQuery(q: string): void {
    query.value = q
    searched.value = q.trim().length > 0
  }

  // 供 SearchView 通过 ?q= 进入时调用（与 setQuery 行为一致）
  function runSearch(q: string): void {
    setQuery(q)
  }

  return { query, searched, filtered, applyQuery, setQuery, runSearch }
})
