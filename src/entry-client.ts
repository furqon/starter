import { createApp } from './main'
import './style.css'

async function init() {
  const { app, router, auth } = createApp()

  const initial = (window as any).__INITIAL_STATE__
  if (initial?.user) {
    auth.setUser(initial.user)
  } else {
    try {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        auth.setUser(data.user)
      }
    } catch {}
  }

  await router.isReady()
  app.mount('#app')
}

init()
