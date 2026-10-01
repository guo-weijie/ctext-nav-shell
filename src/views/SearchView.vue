<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useSearchStore } from '@/stores/search'
import { useI18n } from 'vue-i18n'
import VirtualBookList from '@/components/VirtualBookList.vue'

const route = useRoute()
const catalog = useCatalogStore()
const search = useSearchStore()
const { t } = useI18n()

onMounted(() => {
  const q = (route.query.q as string) || ''
  if (q) search.runSearch(q)
})

const filtered = computed(() => search.filtered)
</script>

<template>
  <section class="flex flex-col h-full min-h-0">
    <div class="flex items-center justify-between mb-2 shrink-0">
      <h2 class="text-lg font-semibold">{{ t('search.title') }}</h2>
      <span class="text-sm opacity-70 tabular-nums">{{ t('search.results', { n: filtered.length }) }}</span>
    </div>

    <p v-if="!search.searched" class="text-sm opacity-70 py-4">{{ t('search.hint') }}</p>
    <div
      v-else-if="catalog.error && filtered.length === 0"
      class="text-sm text-red-600 py-4"
    >
      {{ t('common.error') }}: {{ catalog.error }}
    </div>
    <p v-else-if="filtered.length === 0" class="text-sm opacity-60 py-4">{{ t('search.empty') }}</p>
    <VirtualBookList v-else :books="filtered" class="flex-1 min-h-0" />
  </section>
</template>
