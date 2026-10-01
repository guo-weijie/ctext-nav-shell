<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/types/ctext'

const localeStore = useLocaleStore()
const { t } = useI18n()

const options: Locale[] = ['zh-Hans', 'zh-Hant', 'en']
const labelKey: Record<Locale, string> = {
  'zh-Hans': 'lang.zhHans',
  'zh-Hant': 'lang.zhHant',
  en: 'lang.en',
}

function onChange(e: Event): void {
  localeStore.setLocale((e.target as HTMLSelectElement).value as Locale)
}
</script>

<template>
  <select
    :value="localeStore.locale"
    :aria-label="t('lang.label')"
    class="text-sm rounded-lg border border-black/15 dark:border-white/15 bg-white/60 dark:bg-black/20 px-2 py-1.5 outline-none cursor-pointer"
    @change="onChange"
  >
    <option v-for="o in options" :key="o" :value="o">{{ t(labelKey[o]) }}</option>
  </select>
</template>
