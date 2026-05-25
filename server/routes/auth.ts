import { Router } from 'express'
import db from '../db.js'
import { getFullUser } from '../services/rbac.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await db.user.findFirst({
    where: { username, password },
    select: { id: true, username: true },
  })

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' })
    return
  }

  req.session.user = { id: user.id, username: user.username }
  const full = await getFullUser(user.id)
  res.json({ success: true, user: full })
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.get('/me', async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ user: null })
    return
  }
  const full = await getFullUser(req.session.user.id)
  res.json({ user: full })
})

export default router
