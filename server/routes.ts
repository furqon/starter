import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import db from './db.js'

export function getNavbarConfig() {
  const p = path.resolve(process.cwd(), 'navbar.json')
  if (!fs.existsSync(p)) {
    const defaults = [
      { label: 'Dashboard', path: '/' },
      { label: 'Settings', path: '/settings' },
      { label: 'Management', path: '/management' },
    ]
    fs.writeFileSync(p, JSON.stringify(defaults, null, 2))
    return defaults
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

export function getUserMenus(userId: number) {
  const row = db.prepare('SELECT role_id FROM user_roles WHERE user_id = ?').get(userId) as any
  if (!row) return []
  const allowed = db.prepare('SELECT menu_path FROM role_menus WHERE role_id = ?').all(row.role_id) as any[]
  const allowedSet = new Set(allowed.map((r) => r.menu_path))
  return getNavbarConfig().filter((item: any) => allowedSet.has(item.path))
}

export function getUserRole(userId: number) {
  const row = db.prepare(
    'SELECT r.id, r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ?'
  ).get(userId) as any
  return row || null
}

export function getFullUser(userId: number) {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as any
  if (!user) return null
  const role = getUserRole(user.id)
  const menus = getUserMenus(user.id)
  return { id: user.id, username: user.username, role, menus }
}

const router = Router()

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string }
  }
}

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT id, username FROM users WHERE username = ? AND password = ?').get(username, password) as any
  if (user) {
    req.session.user = { id: user.id, username: user.username }
    const full = getFullUser(user.id)
    res.json({ success: true, user: full })
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.get('/me', (req, res) => {
  if (req.session.user) {
    const full = getFullUser(req.session.user.id)
    res.json({ user: full })
  } else {
    res.status(401).json({ user: null })
  }
})

router.get('/navbar', (req, res) => {
  if (req.session.user) {
    const menus = getUserMenus(req.session.user.id)
    res.json({ items: menus })
  } else {
    res.status(401).json({ items: [] })
  }
})

router.get('/navbar-config', (_req, res) => {
  res.json({ items: getNavbarConfig() })
})

router.put('/navbar-config', (req, res) => {
  const { items } = req.body
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'items must be an array' })
  }
  const p = path.resolve(process.cwd(), 'navbar.json')
  fs.writeFileSync(p, JSON.stringify(items, null, 2))
  res.json({ success: true })
})

router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.created_at, r.id as role_id, r.name as role_name
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    ORDER BY u.id
  `).all()
  res.json({ users })
})

router.post('/users', (req, res) => {
  const { username, password, role_id } = req.body
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ success: false, message: 'Username already exists' })
  }
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password)
  const userId = result.lastInsertRowid
  if (role_id) {
    const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id)
    if (role) {
      db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(userId, role_id)
    }
  }
  res.json({ success: true, user: { id: userId, username } })
})

router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id)
  if (id === req.session.user?.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete yourself' })
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  res.json({ success: true })
})

router.put('/users/:id/role', (req, res) => {
  const userId = Number(req.params.id)
  const { role_id } = req.body
  db.prepare('DELETE FROM user_roles WHERE user_id = ?').run(userId)
  if (role_id) {
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(userId, role_id)
  }
  res.json({ success: true })
})

router.get('/roles', (_req, res) => {
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all()
  res.json({ roles })
})

router.post('/roles', (req, res) => {
  const { name, description } = req.body
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name required' })
  }
  const result = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)').run(name, description || '')
  res.json({ success: true, role: { id: result.lastInsertRowid, name, description: description || '' } })
})

router.put('/roles/:id', (req, res) => {
  const id = Number(req.params.id)
  const { name, description } = req.body
  db.prepare('UPDATE roles SET name = ?, description = ? WHERE id = ?').run(name, description || '', id)
  res.json({ success: true })
})

router.delete('/roles/:id', (req, res) => {
  const id = Number(req.params.id)
  const assigned = db.prepare('SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?').get(id) as any
  if (assigned.count > 0) {
    return res.status(400).json({ success: false, message: 'Role has assigned users' })
  }
  db.prepare('DELETE FROM roles WHERE id = ?').run(id)
  res.json({ success: true })
})

router.get('/roles/:id/menus', (req, res) => {
  const roleId = Number(req.params.id)
  const paths = db.prepare('SELECT menu_path FROM role_menus WHERE role_id = ?').all(roleId) as any[]
  const master = getNavbarConfig()
  const menus = master.filter((m: any) => paths.some((p: any) => p.menu_path === m.path))
  res.json({ menus })
})

router.put('/roles/:id/menus', (req, res) => {
  const roleId = Number(req.params.id)
  const { paths } = req.body
  if (!Array.isArray(paths)) {
    return res.status(400).json({ success: false, message: 'paths must be an array' })
  }
  db.prepare('DELETE FROM role_menus WHERE role_id = ?').run(roleId)
  const insert = db.prepare('INSERT INTO role_menus (role_id, menu_path) VALUES (?, ?)')
  for (const p of paths) {
    insert.run(roleId, p)
  }
  res.json({ success: true })
})

export default router
