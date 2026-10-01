// 极简 localStorage 缓存（带 TTL）
export interface CacheEntry<T> {
  data: T
  ts: number
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // 配额超限等，忽略
  }
}

export function isFresh(ts: number, ttlMs: number): boolean {
  return Date.now() - ts < ttlMs
}
