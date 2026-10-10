<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { urnToUrl } from '@/utils/url'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const catalog = useCatalogStore()
const { t } = useI18n()

const urn = computed(() => decodeURIComponent((route.params.urn as string) || ''))
const url = computed(() => urnToUrl(urn.value))
catalog.loadBooks()
const title = computed(() => catalog.findByUrn(urn.value)?.title ?? urn.value)
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold mb-2 break-all">{{ title }}</h2>
    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-block text-blue-700 dark:text-blue-300 underline text-sm"
    >
      {{ t('book.openOriginal') }} ↗
    </a>
  </section>
</template>
