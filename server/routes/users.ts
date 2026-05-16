import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware.js'

const router = Router()

router.get('/users', requireAuth, (req, res) => {
  const users = db
    .prepare(
      `SELECT u.id, u.username, u.created_at,
              r.id as role_id, r.name as role_name
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       ORDER BY u.id`
    )
    .all()
  res.json({ users })
})

router.post('/users', requireAuth, (req, res) => {
  const { username, password, role_id } = req.body

  if (!username || !password) {
    res
      .status(400)
      .json({ success: false, message: 'Username and password required' })
    return
  }

  const existing = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(username)
  if (existing) {
    res.status(409).json({ success: false, message: 'Username already exists' })
    return
  }

  const result = db
    .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    .run(username, password)
  const userId = result.lastInsertRowid

  if (role_id) {
    const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id)
    if (role) {
      db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(
        userId,
        role_id
      )
    }
  }

  res.json({ success: true, user: { id: userId, username } })
})

router.delete('/users/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)

  if (id === req.session.user!.id) {
    res
      .status(400)
      .json({ success: false, message: 'Cannot delete yourself' })
    return
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  res.json({ success: true })
})

router.put('/users/:id/role', requireAuth, (req, res) => {
  const userId = Number(req.params.id)
  const { role_id } = req.body

  db.prepare('DELETE FROM user_roles WHERE user_id = ?').run(userId)
  if (role_id) {
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(
      userId,
      role_id
    )
  }

  res.json({ success: true })
})

export default router
