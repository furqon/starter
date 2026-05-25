import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { PORT, IS_DEV, INDEX_HTML, CLIENT_DIR, SERVER_BUNDLE } from './config.js'
import { sessionMiddleware } from './middleware.js'
import { initSchema, seed } from './schema.js'
import routes from './routes/index.js'
import { getFullUser } from './services/rbac.js'

await initSchema()
await seed()

const app = express()
app.use(express.json())
app.use(sessionMiddleware)
app.use('/api', routes)

if (IS_DEV) {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    try {
      const template = fs.readFileSync(INDEX_HTML, 'utf-8')
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const userData = req.session?.user
        ? await getFullUser(req.session.user.id)
        : null
      const { html, auth: authState } = await render(req.originalUrl, {
        user: userData,
      })
      const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify({ user: authState.user })}</script>`
      const rendered = template.replace('<!--ssr-outlet-->', html + stateScript)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered)
    } catch (e: any) {
      vite.ssrFixStacktrace(e)
      console.error('SSR error:', e)
      res.status(500).end(e.message)
    }
  })
} else {
  app.use('/assets', express.static(path.resolve(CLIENT_DIR, 'assets')))

  app.use('*', async (req, res) => {
    try {
      const template = fs.readFileSync(
        path.resolve(CLIENT_DIR, 'index.html'),
        'utf-8'
      )
      const { render } = await import(SERVER_BUNDLE)
      const userData = req.session?.user
        ? await getFullUser(req.session.user.id)
        : null
      const { html, auth: authState } = await render(req.originalUrl, {
        user: userData,
      })
      const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify({ user: authState.user })}</script>`
      const rendered = template.replace('<!--ssr-outlet-->', html + stateScript)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered)
    } catch (e: any) {
      console.error('SSR error:', e)
      res.status(500).end(e.message)
    }
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
