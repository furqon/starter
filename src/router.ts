import {
  createRouter as createVueRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router'
import Login from './pages/Login.vue'
import Dashboard from './pages/Dashboard.vue'

export function createRouter() {
  return createVueRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('./pages/Settings.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/management',
        name: 'Management',
        component: () => import('./pages/Management.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/login',
        name: 'Login',
        component: Login,
      },
    ],
  })
}
