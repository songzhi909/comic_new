import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', component: () => import('@/views/HomeView.vue') },
        { path: 'library', component: () => import('@/views/LibraryView.vue') },
        { path: 'library/:id', component: () => import('@/views/LibraryView.vue') },
        { path: 'comic/:id', component: () => import('@/views/ComicDetailView.vue') },
        { path: 'comic/:id/read', component: () => import('@/views/ReaderView.vue') },
        { path: 'comic/:id/episodes', component: () => import('@/views/ComicDetailView.vue') },
        { path: 'comic/:id/episodes/:epId/read', component: () => import('@/views/ReaderView.vue') },
        { path: 'tags', component: () => import('@/views/TagsView.vue') },
        { path: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'admin/users', component: () => import('@/views/admin/UsersView.vue') },
        { path: 'admin/invite-codes', component: () => import('@/views/admin/InviteCodesView.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
});

export default router;
