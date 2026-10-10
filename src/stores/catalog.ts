import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClassifiedBook, CatalogMeta } from '@/types/ctext'

const base = import.meta.env.BASE_URL

// 分类导航的三个维度：按朝代 / 按四部（经史子集）/ 未分类
export type CategoryDimension = 'dynasty' | 'siku' | 'uncategorized'
export interface CategoryRef {
  key: string // 朝代名 / 四部类名
  count: number
}
// 四部两级树：部（经/史/子/集）→ 类（如 春秋类）
export interface SikuCategoryRef extends CategoryRef {
  title: string // 类显示名（去掉部前缀，如「春秋类」）；无·键则同 key
}
export interface SikuSection {
  section: string // 部名，如「经部」
  count: number
  categories: SikuCategoryRef[]
}
// 标准四部顺序（仅对实际存在的部排序）
const SIKU_SECTION_ORDER = ['经部', '史部', '子部', '集部']

export const useCatalogStore = defineStore('catalog', () => {
  // 去重后的扁平书目（含 dynasty/siku 归属），来自本地静态文件
  // 初始化仅加载极小的 catalog.json（分类顺序+计数）；4.9 万本书延后到 loadBooks()
  const books = ref<ClassifiedBook[]>([])
  const dynastyOrder = ref<string[]>([])
  const sikuOrder = ref<string[]>([])
  const dynastyCounts = ref<Record<string, number>>({})
  const sikuCounts = ref<Record<string, number>>({})
  const uncategorized = ref(0)
  const loading = ref(false) // 元数据加载
  const loadingBooks = ref(false) // 全量书目加载（按需）
  const booksLoaded = ref(false)
  const error = ref<string | null>(null)

  // 目录元数据来自本地静态文件 public/data/catalog.json（同源读取，稳定、无外部请求）
  async function loadCatalog(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${base}data/catalog.json`)
      if (!res.ok) throw new Error(`catalog ${res.status}`)
      const data: CatalogMeta = await res.json()
      dynastyOrder.value = data.dynastyOrder ?? []
      sikuOrder.value = data.sikuOrder ?? []
      dynastyCounts.value = data.dynastyCounts ?? {}
      sikuCounts.value = data.sikuCounts ?? {}
      uncategorized.value = data.uncategorized ?? 0
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // 全量书目来自 public/data/books.json（4.2MB），仅在用户选中分类或搜索时才加载一次
  async function loadBooks(): Promise<void> {
    if (booksLoaded.value || loadingBooks.value) return
    loadingBooks.value = true
    try {
      const res = await fetch(`${base}data/books.json`)
      if (!res.ok) throw new Error(`books ${res.status}`)
      books.value = (await res.json()) as ClassifiedBook[]
      booksLoaded.value = true
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingBooks.value = false
    }
  }

  // 各维度分类（含计数）直接读预计算的计数表，顺序与源文件一致——无需遍历 4.9 万本书
  const dynastyCategories = computed<CategoryRef[]>(() =>
    dynastyOrder.value.map((key) => ({ key, count: dynastyCounts.value[key] ?? 0 })),
  )
  const sikuCategories = computed<CategoryRef[]>(() =>
    sikuOrder.value.map((key) => ({ key, count: sikuCounts.value[key] ?? 0 })),
  )
  // 四部两级树：拆「经部·春秋类」为 部「经部」+ 类「春秋类」；无·键（如「经部」）与部名重复，不单列子类，其计数已并入部
  const sikuTree = computed<SikuSection[]>(() => {
    const map = new Map<string, CategoryRef[]>()
    for (const key of sikuOrder.value) {
      const sec = key.includes('·') ? key.slice(0, key.indexOf('·')) : key
      const ref: CategoryRef = { key, count: sikuCounts.value[key] ?? 0 }
      if (!map.has(sec)) map.set(sec, [])
      map.get(sec)!.push(ref)
    }
    return SIKU_SECTION_ORDER.filter((s) => map.has(s)).map((sec) => {
      const refs = map.get(sec)!
      return {
        section: sec,
        count: refs.reduce((n, c) => n + c.count, 0),
        categories: refs
          .filter((c) => c.key.includes('·') || c.key !== sec)
          .map((c) => ({
            ...c,
            title: c.key.includes('·') ? c.key.slice(c.key.indexOf('·') + 1) : c.key,
          })),
      }
    })
  })
  const uncategorizedCount = computed(() => uncategorized.value)

  // 取某维度下的书目：
  // - uncategorized → 两字段皆空的书
  // - dynasty/siku 且未给 key → 该维度全部（有归属的书）
  // - dynasty/siku 且给 key → 仅该分类键下的书
  // 注意：依赖 loadBooks() 已触发，否则返回空数组
  function booksIn(dimension: CategoryDimension, key?: string): ClassifiedBook[] {
    if (dimension === 'uncategorized') return books.value.filter((b) => !b.dynasty && !b.siku)
    const field = dimension === 'dynasty' ? 'dynasty' : 'siku'
    if (!key) return books.value.filter((b) => !!b[field])
    // 四部：选中「部名」（无·）时匹配该部全部类及同名无·键（如「经部」）
    if (dimension === 'siku' && !key.includes('·')) {
      return books.value.filter((b) => b.siku === key || (b.siku?.startsWith(key + '·') ?? false))
    }
    return books.value.filter((b) => b[field] === key)
  }

  const byUrn = computed(() => {
    const m = new Map<string, ClassifiedBook>()
    books.value.forEach((b) => m.set(b.urn, b))
    return m
  })

  // 按 URN 精确查找书目（用于详情页回显书名）
  function findByUrn(urn: string): ClassifiedBook | undefined {
    return byUrn.value.get(urn)
  }

  return {
    books,
    dynastyOrder,
    sikuOrder,
    dynastyCategories,
    sikuCategories,
    sikuTree,
    uncategorizedCount,
    booksIn,
    findByUrn,
    loading,
    loadingBooks,
    booksLoaded,
    error,
    loadCatalog,
    loadBooks,
  }
})
