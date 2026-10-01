<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from 'vue-i18n'
import SearchBar from './SearchBar.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import AttributionFooter from './AttributionFooter.vue'

const catalog = useCatalogStore()
const { t } = useI18n()

// 目录/朝代静态数据仅加载一次（壳级），所有视图共享
onMounted(() => {
  catalog.loadCatalog()
  catalog.loadDynasties()
})
</script>

<template>
  <div
    class="h-screen overflow-hidden flex flex-col bg-paper text-ink dark:bg-[#22201c] dark:text-[#e8e2d4] font-serif transition-colors"
  >
    <header
      class="border-b border-black/10 dark:border-white/10 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-4 shrink-0"
    >
      <h1 class="text-lg font-bold tracking-wide shrink-0">{{ t('app.title') }}</h1>
      <div class="flex-1 min-w-0">
        <SearchBar />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>

    <main class="flex-1 min-h-0 flex flex-col px-4 py-4">
      <RouterView />
    </main>

    <AttributionFooter class="shrink-0" />
  </div>
</template>
