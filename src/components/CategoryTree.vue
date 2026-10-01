<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from 'vue-i18n'
import type { NavSelection } from '@/types/ctext'

const props = defineProps<{ selection: NavSelection }>()
const emit = defineEmits<{ (e: 'select', p: NavSelection): void }>()

const catalog = useCatalogStore()
const { t } = useI18n()

// 分组展开状态：朝代 / 四部 默认展开
const expanded = ref<Set<string>>(new Set(['dynasty', 'siku']))
// 四部内各「部」默认展开（经/史/子/集）
const expandedSections = ref<Set<string>>(new Set(['经部', '史部', '子部', '集部']))

const dynastyTotal = computed(() =>
  catalog.dynastyCategories.reduce((n, c) => n + c.count, 0),
)
const sikuTotal = computed(() =>
  catalog.sikuCategories.reduce((n, c) => n + c.count, 0),
)

function toggle(group: 'dynasty' | 'siku'): void {
  const next = new Set(expanded.value)
  if (next.has(group)) next.delete(group)
  else next.add(group)
  expanded.value = next
}
function toggleSection(sec: string): void {
  const next = new Set(expandedSections.value)
  if (next.has(sec)) next.delete(sec)
  else next.add(sec)
  expandedSections.value = next
}
function isSectionOpen(sec: string): boolean {
  return expandedSections.value.has(sec)
}

function isActive(dimension: NavSelection['dimension'], key: string | null): boolean {
  return props.selection.dimension === dimension && props.selection.key === key
}

function select(p: NavSelection): void {
  emit('select', p)
}
</script>

<template>
  <nav class="h-full overflow-y-auto pr-1 text-sm select-none scrollbar-hide">
    <ul class="space-y-0.5">
      <!-- 全部书目 -->
      <li>
        <button
          type="button"
          class="w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors"
          :class="
            isActive('all', null)
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'hover:bg-black/5 dark:hover:bg-white/10'
          "
          @click="select({ dimension: 'all', key: null })"
        >
          <span class="truncate">{{ t('nav.all') }}</span>
          <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ catalog.books.length }}</span>
        </button>
      </li>

      <!-- 按朝代（可展开/折叠） -->
      <li>
        <button
          type="button"
          class="w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          @click="toggle('dynasty')"
        >
          <span class="flex items-center gap-1 truncate">
            <span class="w-3 inline-block text-xs opacity-60">{{ expanded.has('dynasty') ? '▾' : '▸' }}</span>
            {{ t('nav.byDynasty') }}
          </span>
          <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ dynastyTotal }}</span>
        </button>
        <ul
          v-if="expanded.has('dynasty')"
          class="ml-3 border-l border-black/10 dark:border-white/10 pl-1 space-y-0.5 mt-0.5"
        >
          <li v-for="c in catalog.dynastyCategories" :key="c.key">
            <button
              type="button"
              class="w-full text-left px-2 py-1 rounded-md flex items-center justify-between transition-colors truncate"
              :class="
                isActive('dynasty', c.key)
                  ? 'bg-blue-500 text-white dark:bg-blue-400'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              "
              :title="c.key"
              @click="select({ dimension: 'dynasty', key: c.key })"
            >
              <span class="truncate">{{ c.key }}</span>
              <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ c.count }}</span>
            </button>
          </li>
        </ul>
      </li>

      <!-- 按四部（可展开/折叠，内部为 部 → 类 两级树） -->
      <li>
        <button
          type="button"
          class="w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          @click="toggle('siku')"
        >
          <span class="flex items-center gap-1 truncate">
            <span class="w-3 inline-block text-xs opacity-60">{{ expanded.has('siku') ? '▾' : '▸' }}</span>
            {{ t('nav.bySiku') }}
          </span>
          <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ sikuTotal }}</span>
        </button>
        <ul
          v-if="expanded.has('siku')"
          class="ml-3 border-l border-black/10 dark:border-white/10 pl-1 space-y-0.5 mt-0.5"
        >
          <!-- 部（经/史/子/集），可再展开为各类 -->
          <li v-for="sec in catalog.sikuTree" :key="sec.section">
            <div class="flex items-center">
              <button
                type="button"
                class="shrink-0 w-5 text-xs opacity-60 hover:opacity-100"
                :title="isSectionOpen(sec.section) ? '收起' : '展开'"
                @click="toggleSection(sec.section)"
              >
                {{ isSectionOpen(sec.section) ? '▾' : '▸' }}
              </button>
              <button
                type="button"
                class="flex-1 text-left px-1 py-1 rounded-md flex items-center justify-between transition-colors truncate hover:bg-black/5 dark:hover:bg-white/10"
                @click="toggleSection(sec.section)"
              >
                <span class="truncate">{{ sec.section }}</span>
                <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ sec.count }}</span>
              </button>
            </div>
            <ul v-if="isSectionOpen(sec.section)" class="ml-5 space-y-0.5 mt-0.5">
              <li v-for="cat in sec.categories" :key="cat.key">
                <button
                  type="button"
                  class="w-full text-left px-2 py-1 rounded-md flex items-center justify-between transition-colors truncate"
                  :class="
                    isActive('siku', cat.key)
                      ? 'bg-blue-400 text-white dark:bg-blue-300'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  "
                  :title="cat.key"
                  @click="select({ dimension: 'siku', key: cat.key })"
                >
                  <span class="truncate">{{ cat.title }}</span>
                  <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ cat.count }}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>

      <!-- 未分类 -->
      <li>
        <button
          type="button"
          class="w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors"
          :class="
            isActive('uncategorized', null)
              ? 'bg-blue-600 text-white dark:bg-blue-500'
              : 'hover:bg-black/5 dark:hover:bg-white/10'
          "
          @click="select({ dimension: 'uncategorized', key: null })"
        >
          <span class="truncate">{{ t('nav.uncategorized') }}</span>
          <span class="opacity-60 tabular-nums ml-2 shrink-0">{{ catalog.uncategorizedCount }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
