import { createApp } from './main'
import { renderToString } from 'vue/server-renderer'

export async function render(
  url: string,
  context?: { user?: { id: number; username: string; role: { id: number; name: string } | null; menus: { label: string; path: string }[] } | null }
) {
  const { app, router, auth } = createApp()

  if (context?.user) {
    auth.setUser(context.user)
  }

  router.push(url)
  await router.isReady()

  const html = await renderToString(app)
  return { html, auth: { user: auth.state.user } }
}
