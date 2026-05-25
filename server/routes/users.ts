import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware.js'

const router = Router()

router.get('/users', requireAuth, async (_req, res) => {
  const rows = await db.user.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      username: true,
      createdAt: true,
      roles: {
        take: 1,
        select: { role: { select: { id: true, name: true } } },
      },
    },
  })
  const users = rows.map((user) => {
    const role = user.roles[0]?.role
    return {
      id: user.id,
      username: user.username,
      created_at: user.createdAt,
      role_id: role?.id ?? null,
      role_name: role?.name ?? null,
    }
  })
  res.json({ users })
})

router.post('/users', requireAuth, async (req, res) => {
  const { username, password, role_id } = req.body

  if (!username || !password) {
    res
      .status(400)
      .json({ success: false, message: 'Username and password required' })
    return
  }

  const existing = await db.user.findUnique({ where: { username } })
  if (existing) {
    res.status(409).json({ success: false, message: 'Username already exists' })
    return
  }

  const user = await db.user.create({ data: { username, password } })

  if (role_id) {
    const roleId = Number(role_id)
    const role = await db.role.findUnique({ where: { id: roleId } })
    if (role) {
      await db.userRole.create({ data: { userId: user.id, roleId } })
    }
  }

  res.json({ success: true, user: { id: user.id, username } })
})

router.delete('/users/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)

  if (id === req.session.user!.id) {
    res
      .status(400)
      .json({ success: false, message: 'Cannot delete yourself' })
    return
  }

  await db.user.delete({ where: { id } })
  res.json({ success: true })
})

router.put('/users/:id/role', requireAuth, async (req, res) => {
  const userId = Number(req.params.id)
  const { role_id } = req.body

  await db.userRole.deleteMany({ where: { userId } })
  if (role_id) {
    await db.userRole.create({
      data: { userId, roleId: Number(role_id) },
    })
  }

  res.json({ success: true })
})

export default router
