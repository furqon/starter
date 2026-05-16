import { Router } from 'express'
import db from '../db.js'
import { getFullUser } from '../services/rbac.js'

const router = Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db
    .prepare('SELECT id, username FROM users WHERE username = ? AND password = ?')
    .get(username, password) as any

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    return
  }

  req.session.user = { id: user.id, username: user.username }
  const full = getFullUser(user.id)
  res.json({ success: true, user: full })
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.get('/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ user: null })
    return
  }
  const full = getFullUser(req.session.user.id)
  res.json({ user: full })
})

export default router
