<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useSearchStore } from '@/stores/search'
import { useI18n } from 'vue-i18n'
import type { NavSelection } from '@/types/ctext'
import VirtualBookList from '@/components/VirtualBookList.vue'
import CategoryTree from '@/components/CategoryTree.vue'

const catalog = useCatalogStore()
const search = useSearchStore()
const { t } = useI18n()

// 默认不选择任何节点：右侧展示网站说明，而非书籍列表
const selection = ref<NavSelection>({ dimension: 'none', key: null })
const drawerOpen = ref(false)

function onSelect(p: NavSelection): void {
  selection.value = p
}
function onSelectFromDrawer(p: NavSelection): void {
  selection.value = p
  drawerOpen.value = false
}

// 当前分类范围内的书目（未叠加搜索）；'none' 表示尚未选择，返回 null
const scoped = computed<ReturnType<typeof catalog.booksIn> | null>(() => {
  const { dimension, key } = selection.value
  if (dimension === 'none') return null
  if (dimension === 'all') return catalog.books
  return catalog.booksIn(dimension, key ?? undefined)
})

// 是否已输入搜索词
const hasQuery = computed(() => search.query.trim().length > 0)
// 是否显示书单：选中了分类节点 或 输入了搜索词（搜索覆盖全部书目，无需先选分类）
const showList = computed(() => hasSelection.value || hasQuery.value)

// 书单数据：有搜索词时搜索全部书目（49,638 本）；否则展示当前选中分类
const visible = computed(() => (hasQuery.value ? search.filtered : scoped.value ?? []))

const hasSelection = computed(() => selection.value.dimension !== 'none')

// 全量书目（4.2MB）仅在需要展示书单时才加载一次：选中分类节点或输入搜索词时触发
watch(
  showList,
  (on) => {
    if (on) catalog.loadBooks()
  },
  { immediate: true },
)

const scopeLabel = computed(() => {
  if (hasQuery.value) return t('search.title')
  if (!hasSelection.value) return t('intro.title')
  const { dimension, key } = selection.value
  if (dimension === 'all') return t('nav.all')
  if (dimension === 'uncategorized') return t('nav.uncategorized')
  const dimLabel = dimension === 'dynasty' ? t('nav.byDynasty') : t('nav.bySiku')
  return key ? `${dimLabel} · ${key}` : dimLabel
})
</script>

<template>
  <section class="flex h-full min-h-0 gap-4">
    <!-- 桌面端：左侧目录树 -->
    <aside
      class="hidden md:flex md:flex-col w-56 shrink-0 h-full border-r border-black/10 dark:border-white/10 pr-3 min-h-0"
    >
      <CategoryTree :selection="selection" @select="onSelect" class="flex-1 min-h-0" />
    </aside>

    <!-- 移动端：目录抽屉 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="drawerOpen"
          class="md:hidden fixed inset-0 z-40 bg-black/40"
          @click.self="drawerOpen = false"
        >
          <div
            class="absolute left-0 top-0 bottom-0 w-72 max-w-[82%] bg-paper dark:bg-[#22201c] border-r border-black/10 dark:border-white/10 p-3 overflow-y-auto"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">{{ t('nav.tree') }}</span>
              <button
                type="button"
                class="text-xl leading-none px-2 -mr-1 opacity-70 hover:opacity-100"
                @click="drawerOpen = false"
              >
                ×
              </button>
            </div>
            <CategoryTree :selection="selection" @select="onSelectFromDrawer" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 右侧：书列表（仅在选中叶子节点后显示）或网站说明 -->
    <div class="flex-1 min-w-0 flex flex-col min-h-0">
      <div class="flex items-center justify-between mb-2 shrink-0 gap-2">
        <button
          type="button"
          class="md:hidden px-3 py-1 rounded-md border border-black/15 dark:border-white/15 text-sm shrink-0"
          @click="drawerOpen = true"
        >
          ☰ {{ scopeLabel }}
        </button>
        <h2 class="hidden md:block text-lg font-semibold truncate">{{ scopeLabel }}</h2>
        <span
          v-if="showList"
          class="text-sm opacity-70 tabular-nums shrink-0 md:ml-auto"
        >{{ t('search.results', { n: visible.length }) }}</span>
      </div>

      <!-- 未选择任何节点：网站说明 + ctext 链接 -->
      <div
        v-if="!showList"
        class="flex-1 min-h-0 overflow-y-auto rounded-lg border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/10 p-6 flex flex-col justify-center gap-4"
      >
        <h3 class="text-xl font-bold">{{ t('intro.title') }}</h3>
        <p class="text-sm leading-relaxed opacity-80 max-w-2xl">{{ t('intro.desc') }}</p>
        <ul class="text-sm leading-relaxed opacity-80 max-w-2xl list-disc pl-5 space-y-1">
          <li>{{ t('intro.tip1') }}</li>
          <li>{{ t('intro.tip2') }}</li>
        </ul>
        <a
          :href="t('intro.ctextUrl')"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 w-fit text-blue-700 dark:text-blue-300 underline text-sm"
        >
          {{ t('intro.ctextLink') }} ↗
        </a>
        <p class="text-xs opacity-50 max-w-2xl">{{ t('intro.note') }}</p>
      </div>

      <!-- 已选择节点：书籍网格（书单数据按需加载时显示加载态） -->
      <p
        v-if="catalog.loadingBooks"
        class="flex-1 min-h-0 flex items-center justify-center text-sm opacity-60"
      >
        {{ t('common.loading') }}
      </p>
      <VirtualBookList v-else :books="visible" class="flex-1 min-h-0" />
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
