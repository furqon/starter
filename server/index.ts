import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const isDev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
)

import './db.js'
import routes, { getFullUser } from './routes.js'

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string }
  }
}

app.use('/api', routes)

if (isDev) {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl
      const template = fs.readFileSync(path.resolve('./index.html'), 'utf-8')
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const userData = req.session?.user ? getFullUser(req.session.user.id) : null
      const { html, auth: authState } = await render(url, { user: userData })
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
  app.use('/assets', express.static(path.resolve('./dist/client/assets')))

  app.use('*', async (req, res) => {
    try {
      const template = fs.readFileSync(
        path.resolve('./dist/client/index.html'),
        'utf-8'
      )
      const { render } = await import(
        path.resolve('./dist/server/entry-server.js')
      )
      const userData = req.session?.user ? getFullUser(req.session.user.id) : null
      const { html, auth: authState } = await render(req.originalUrl, { user: userData })
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
