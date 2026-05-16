import path from 'path'

export const PORT = Number(process.env.PORT) || 3000
export const IS_DEV = process.env.NODE_ENV !== 'production'
export const SESSION_SECRET: string =
  process.env.SESSION_SECRET || 'fallback-secret'
export const ROOT = process.cwd()
export const DB_PATH = path.resolve(ROOT, 'app.db')
export const NAVBAR_PATH = path.resolve(ROOT, 'navbar.json')
export const INDEX_HTML = path.resolve(ROOT, 'index.html')
export const CLIENT_DIR = path.resolve(ROOT, 'dist/client')
export const SERVER_BUNDLE = path.resolve(ROOT, 'dist/server/entry-server.js')
