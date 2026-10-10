// ctext.org 数据模型

export interface CtextBook {
  title: string
  urn: string // 例: "ctp:analects" / "ctp:wb163544"
}

// 项目静态目录里每本书的归属（由 书籍分类结果 落盘而来）
// dynasty / siku 为分类键；未分类书两者皆为 null
export interface ClassifiedBook extends CtextBook {
  dynasty: string | null // 朝代分类键，如 "唐"
  siku: string | null // 四部分类键，如 "经部·易类"
}

// 初始化即加载的「目录元数据」（public/data/catalog.json，体积极小）
// 仅含分类顺序与计数，不含 4.9 万本书——树渲染无需等待全量书目
export interface CatalogMeta {
  dynastyOrder: string[]
  sikuOrder: string[]
  dynastyCounts: Record<string, number>
  sikuCounts: Record<string, number>
  uncategorized: number
}

// 主题模式 / 界面语言
export type ThemeMode = 'light' | 'dark' | 'system'
export type Locale = 'zh-Hans' | 'zh-Hant' | 'en'

// 左侧目录树 / 分类导航的当前选择：dimension 决定维度，key 为具体分类键（朝代名 / 四部类名）
// dimension = 'none' 表示尚未选择任何节点（默认进入时显示网站说明，而非书籍列表）
export type NavSelection = {
  dimension: 'none' | 'all' | 'dynasty' | 'siku' | 'uncategorized'
  key: string | null
}
