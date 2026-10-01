import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClassifiedBook, CatalogFile, DynastiesFile, Dynasty } from '@/types/ctext'

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
  const books = ref<ClassifiedBook[]>([])
  const dynastyOrder = ref<string[]>([])
  const sikuOrder = ref<string[]>([])
  const dynasties = ref<Dynasty[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 目录数据来自本地静态文件 public/data/catalog.json（同源读取，稳定、无外部请求）
  async function loadCatalog(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${base}data/catalog.json`)
      if (!res.ok) throw new Error(`catalog ${res.status}`)
      const data: CatalogFile = await res.json()
      books.value = data.books ?? []
      dynastyOrder.value = data.dynastyOrder ?? []
      sikuOrder.value = data.sikuOrder ?? []
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  // 朝代元数据来自本地 public/data/dynasties.json（仅作参考，当前导航以静态分类为准）
  async function loadDynasties(): Promise<void> {
    try {
      const res = await fetch(`${base}data/dynasties.json`)
      if (!res.ok) throw new Error(`dynasties ${res.status}`)
      const data: DynastiesFile = await res.json()
      dynasties.value = data.dynasties ?? []
    } catch {
      dynasties.value = []
    }
  }

  // 各维度分类（含计数），顺序与源文件 dynastyOrder / sikuOrder 一致
  const dynastyCategories = computed<CategoryRef[]>(() =>
    dynastyOrder.value.map((key) => ({
      key,
      count: books.value.reduce((n, b) => (b.dynasty === key ? n + 1 : n), 0),
    })),
  )
  const sikuCategories = computed<CategoryRef[]>(() =>
    sikuOrder.value.map((key) => ({
      key,
      count: books.value.reduce((n, b) => (b.siku === key ? n + 1 : n), 0),
    })),
  )
  // 四部两级树：拆「经部·春秋类」为 部「经部」+ 类「春秋类」；无·键（如「经部」）与部名重复，不单列子类，其计数已并入部
  const sikuTree = computed<SikuSection[]>(() => {
    const map = new Map<string, CategoryRef[]>()
    for (const key of sikuOrder.value) {
      const sec = key.includes('·') ? key.slice(0, key.indexOf('·')) : key
      const ref: CategoryRef = {
        key,
        count: books.value.reduce((n, b) => (b.siku === key ? n + 1 : n), 0),
      }
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
  const uncategorizedCount = computed(() =>
    books.value.reduce((n, b) => (!b.dynasty && !b.siku ? n + 1 : n), 0),
  )

  // 取某维度下的书目：
  // - uncategorized → 两字段皆空的书
  // - dynasty/siku 且未给 key → 该维度全部（有归属的书）
  // - dynasty/siku 且给 key → 仅该分类键下的书
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
    dynasties,
    dynastyCategories,
    sikuCategories,
    sikuTree,
    uncategorizedCount,
    booksIn,
    findByUrn,
    loading,
    error,
    loadCatalog,
    loadDynasties,
  }
})
