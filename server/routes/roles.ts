import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware.js'
import { getRoleMenusWithChecked } from '../services/rbac.js'

const router = Router()

router.get('/roles', requireAuth, (_req, res) => {
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all()
  res.json({ roles })
})

router.post('/roles', requireAuth, (req, res) => {
  const { name, description } = req.body

  if (!name) {
    res.status(400).json({ success: false, message: 'Name required' })
    return
  }

  const result = db
    .prepare('INSERT INTO roles (name, description) VALUES (?, ?)')
    .run(name, description || '')

  res.json({
    success: true,
    role: {
      id: result.lastInsertRowid,
      name,
      description: description || '',
    },
  })
})

router.put('/roles/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const { name, description } = req.body

  db.prepare('UPDATE roles SET name = ?, description = ? WHERE id = ?').run(
    name,
    description || '',
    id
  )

  res.json({ success: true })
})

router.delete('/roles/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)

  const assigned = db
    .prepare('SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?')
    .get(id) as any

  if (assigned.count > 0) {
    res
      .status(400)
      .json({ success: false, message: 'Role has assigned users' })
    return
  }

  db.prepare('DELETE FROM roles WHERE id = ?').run(id)
  res.json({ success: true })
})

router.get('/roles/:id/menus', requireAuth, (req, res) => {
  const roleId = Number(req.params.id)
  res.json({ items: getRoleMenusWithChecked(roleId) })
})

router.put('/roles/:id/menus', requireAuth, (req, res) => {
  const roleId = Number(req.params.id)
  const { paths } = req.body

  if (!Array.isArray(paths)) {
    res.status(400).json({ success: false, message: 'paths must be an array' })
    return
  }

  db.prepare('DELETE FROM role_menus WHERE role_id = ?').run(roleId)
  const insert = db.prepare(
    'INSERT INTO role_menus (role_id, menu_path) VALUES (?, ?)'
  )
  for (const p of paths) {
    insert.run(roleId, p)
  }

  res.json({ success: true })
})

export default router
