<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import type { ThemeMode } from '@/types/ctext'

const theme = useThemeStore()
const { t } = useI18n()

const options: ThemeMode[] = ['light', 'dark', 'system']
const labelKey: Record<ThemeMode, string> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system',
}

function onChange(e: Event): void {
  theme.setMode((e.target as HTMLSelectElement).value as ThemeMode)
}
</script>

<template>
  <select
    :value="theme.mode"
    :aria-label="t('theme.label')"
    class="text-sm rounded-lg border border-black/15 dark:border-white/15 bg-white/60 dark:bg-black/20 px-2 py-1.5 outline-none cursor-pointer"
    @change="onChange"
  >
    <option v-for="o in options" :key="o" :value="o">{{ t(labelKey[o]) }}</option>
  </select>
</template>
