import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeMode } from '@/types/ctext'

const KEY = 'ctext:theme'

const mq =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

function resolve(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return mq?.matches ? 'dark' : 'light'
  return mode
}

function apply(resolved: 'light' | 'dark'): void {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }
}

export const useThemeStore = defineStore('theme', () => {
  const saved =
    (typeof localStorage !== 'undefined' ? (localStorage.getItem(KEY) as ThemeMode | null) : null) ?? 'system'
  const mode = ref<ThemeMode>(saved)
  const resolved = ref<'light' | 'dark'>(resolve(mode.value))

  function setMode(m: ThemeMode): void {
    mode.value = m
    resolved.value = resolve(m)
    apply(resolved.value)
    localStorage.setItem(KEY, m)
  }

  function init(): void {
    apply(resolved.value)
    if (mq?.addEventListener) {
      mq.addEventListener('change', () => {
        if (mode.value === 'system') {
          resolved.value = resolve('system')
          apply(resolved.value)
        }
      })
    }
  }

  return { mode, resolved, setMode, init }
})
