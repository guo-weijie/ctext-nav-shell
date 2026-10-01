<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import type { CtextBook } from "@/types/ctext";
import { urnToUrl } from "@/utils/url";

const props = defineProps<{ books: CtextBook[] }>();

// 布局常量
const GAP = 12; // 卡片间距（px），与模板 gap-3 一致
const ROW_H = 40; // 单行卡片高度（px）
const PAD_X = 28; // 卡片左右内边距（px-3.5 左右各 14）
const ARROW_W = 18; // 末尾 ↗ 图标占用宽度
const MAX_W = 720; // 单卡最大宽度（px），防超长书名撑破布局
const MIN_W = 80; // 单卡最小宽度（px）
const BUFFER = 4; // 可视区上下额外缓冲行数
const CJK_W = 15; // 估算中文/全角字符宽度（px，略大于实际 → 保守避免裁切）
const OTHER_W = 8.5; // 估算英文/数字宽度（px）

// 粗略判断字符是否按「全角/CJK」宽度估算
function charWidth(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;
  if (
    (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2e80 && code <= 0x303e) ||
    (code >= 0x3041 && code <= 0x33ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xa000 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe4f) ||
    (code >= 0xff00 && code <= 0xffef) ||
    (code >= 0x20000 && code <= 0x3fffd)
  ) {
    return CJK_W;
  }
  return OTHER_W;
}

// 按书名内容估算卡片宽度：中文/全角按 15px、其余按 8.5px，含内边距与图标位
function itemWidth(title: string): number {
  let w = PAD_X + ARROW_W;
  for (const ch of title) w += charWidth(ch);
  return Math.min(MAX_W, Math.max(MIN_W, Math.round(w)));
}

const container = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const viewportH = ref(600);
const width = ref(0);

function onScroll(e: Event): void {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
}
function measure(): void {
  if (!container.value) return;
  viewportH.value = container.value.clientHeight;
  width.value = container.value.clientWidth;
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  if (container.value && "ResizeObserver" in window) {
    ro = new ResizeObserver(measure);
    ro.observe(container.value);
  }
  measure();
});
onBeforeUnmount(() => ro?.disconnect());

// 流布局：按容器宽度把书顺序排入各行（每行宽度累计超过容器则换行）
// rowStart[i] = 第 i 行第一个书在 books 中的索引
const rowStart = computed<number[]>(() => {
  const arr = [0];
  if (width.value <= 0) return arr;
  const W = width.value;
  let lineW = 0;
  for (let i = 0; i < props.books.length; i++) {
    const w = itemWidth(props.books[i].title) + GAP;
    if (lineW > 0 && lineW + w > W) {
      arr.push(i);
      lineW = w;
    } else {
      lineW += w;
    }
  }
  return arr;
});

const rowCount = computed(() => rowStart.value.length);
const totalHeight = computed(() => Math.max(0, rowCount.value * ROW_H + (rowCount.value - 1) * GAP));

const startRow = computed(() => Math.max(0, Math.floor(scrollTop.value / (ROW_H + GAP)) - BUFFER));
const endRow = computed(() =>
  Math.min(rowCount.value, Math.ceil((scrollTop.value + viewportH.value) / (ROW_H + GAP)) + BUFFER),
);

// 可视行（含缓冲）：每行携带其书列表与纵向偏移
const visibleRows = computed(() => {
  if (width.value <= 0) return [];
  const out: { index: number; top: number; books: CtextBook[] }[] = [];
  for (let r = startRow.value; r < endRow.value; r++) {
    const s = rowStart.value[r];
    const e = rowStart.value[r + 1] ?? props.books.length;
    out.push({ index: r, top: r * (ROW_H + GAP), books: props.books.slice(s, e) });
  }
  return out;
});

function openUrl(book: CtextBook): void {
  window.open(urnToUrl(book.urn), "_blank", "noopener");
}
function onKey(e: KeyboardEvent, book: CtextBook): void {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openUrl(book);
  }
}

// 过滤结果变化（新搜索 / 目录加载完成）时，重置滚动位置到顶部
watch(
  () => props.books,
  () => container.value?.scrollTo({ top: 0 }),
);
</script>

<template>
  <div
    ref="container"
    class="relative h-full overflow-y-auto overflow-x-hidden rounded-lg scrollbar-hide"
    @scroll="onScroll"
  >
    <div :style="{ height: totalHeight + 'px' }" class="relative">
      <div
        v-for="row in visibleRows"
        :key="row.index"
        :style="{ transform: `translateY(${row.top}px)` }"
        class="absolute left-0 right-0 flex flex-wrap gap-3"
      >
        <button
          v-for="b in row.books"
          :key="b.urn"
          type="button"
          :style="{ width: itemWidth(b.title) + 'px', height: ROW_H + 'px' }"
          class="group flex items-center px-3.5 text-left rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/15 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-sm transition-all"
          :title="b.title"
          @click="openUrl(b)"
          @keydown="onKey($event, b)"
        >
          <span class="flex-1 min-w-0 whitespace-nowrap text-sm font-medium">{{ b.title }}</span>
          <span class="shrink-0 ml-2 text-xs opacity-0 group-hover:opacity-60 transition-opacity">↗</span>
        </button>
      </div>
    </div>
  </div>
</template>
