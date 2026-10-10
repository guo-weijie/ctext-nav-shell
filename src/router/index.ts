import { createRouter, createWebHistory } from 'vue-router'
import { applySeo, setHtmlLang } from '@/utils/seo'
import { useLocaleStore } from '@/stores/locale'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { seoKey: 'seo.home' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { seoKey: 'seo.search' },
    },
    {
      path: '/book/:urn',
      name: 'book',
      component: () => import('@/views/BookView.vue'),
      meta: { seoKey: 'seo.book' },
    },
  ],
})

// 每次路由切换后更新标题/描述/OG 与 html lang
router.afterEach((to) => {
  const seoKey = to.meta.seoKey as string | undefined
  if (seoKey) {
    applySeo({ titleKey: `${seoKey}.title`, descriptionKey: `${seoKey}.description` })
  }
  setHtmlLang(useLocaleStore().locale)
})

export default router
