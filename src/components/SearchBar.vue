<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useI18n } from 'vue-i18n'

const search = useSearchStore()
const { t } = useI18n()

const input = ref(search.query)

let timer: ReturnType<typeof setTimeout> | null = null
function schedule(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => search.setQuery(input.value), 200)
}
function onInput(): void {
  schedule()
}
function onEnter(): void {
  if (timer) clearTimeout(timer)
  search.setQuery(input.value)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

// 外部（如 SearchView 通过 ?q=）修改 query 时，同步回填输入框
watch(
  () => search.query,
  (q) => {
    if (q !== input.value) input.value = q
  },
)
</script>

<template>
  <div class="relative">
    <input
      v-model="input"
      type="search"
      :placeholder="t('nav.placeholder')"
      class="w-full px-3 py-2 rounded-lg border border-black/15 dark:border-white/15 bg-white/60 dark:bg-black/20 text-sm outline-none focus:border-black/40 dark:focus:border-white/40"
      @input="onInput"
      @keyup.enter="onEnter"
    />
  </div>
</template>
