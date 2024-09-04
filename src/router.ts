import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  routes: [
    {
      path: '/',
      component: () => import('./index.vue'),
    },
    {
      path: '/match/:id',
      component: () => import('./match.vue'),
    },
  ],
  history: createWebHistory(),
})

export default router
