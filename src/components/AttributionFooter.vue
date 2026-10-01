<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
  <footer
    class="px-6 text-center py-4 text-xs opacity-60 border-t border-black/10 dark:border-white/10 leading-relaxed"
  >
    <p>
      {{ t("footer.attributionPrefix") }}
      <a
        :href="t('footer.ctextUrl')"
        target="_blank"
        rel="noopener noreferrer"
        class="underline hover:text-blue-600 dark:hover:text-blue-400 hover:opacity-100 transition-colors"
        >{{ t("footer.sourceName") }}</a
      >
    </p>
    <p>{{ t("footer.note") }}</p>
  </footer>
</template>
