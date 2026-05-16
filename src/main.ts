import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createAuthStore, type AuthStore } from './stores/auth'
import type { Router } from 'vue-router'

type AppContext = {
  app: ReturnType<typeof createSSRApp>
  router: Router
  auth: AuthStore
}

export function createApp(): AppContext {
  const app = createSSRApp(App)
  const router = createRouter()
  const auth = createAuthStore()

  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !auth.state.isAuthenticated) {
      return '/login'
    }
    if (to.path === '/login' && auth.state.isAuthenticated) {
      return '/'
    }
  })

  app.provide('auth', auth)
  app.use(router)

  return { app, router, auth }
}
