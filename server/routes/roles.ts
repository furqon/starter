import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware.js'
import { getRoleMenusWithChecked } from '../services/rbac.js'

const router = Router()

router.get('/roles', requireAuth, async (_req, res) => {
  const roles = await db.role.findMany({ orderBy: { id: 'asc' } })
  res.json({ roles })
})

router.post('/roles', requireAuth, async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    res.status(400).json({ success: false, message: 'Name required' })
    return
  }

  const role = await db.role.create({
    data: { name, description: description || '' },
  })

  res.json({
    success: true,
    role: {
      id: role.id,
      name: role.name,
      description: role.description,
    },
  })
})

router.put('/roles/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const { name, description } = req.body

  await db.role.update({
    where: { id },
    data: { name, description: description || '' },
  })

  res.json({ success: true })
})

router.delete('/roles/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)

  const assigned = await db.userRole.count({ where: { roleId: id } })

  if (assigned > 0) {
    res
      .status(400)
      .json({ success: false, message: 'Role has assigned users' })
    return
  }

  await db.role.delete({ where: { id } })
  res.json({ success: true })
})

router.get('/roles/:id/menus', requireAuth, async (req, res) => {
  const roleId = Number(req.params.id)
  res.json({ items: await getRoleMenusWithChecked(roleId) })
})

router.put('/roles/:id/menus', requireAuth, async (req, res) => {
  const roleId = Number(req.params.id)
  const { menus } = req.body

  if (!Array.isArray(menus)) {
    res.status(400).json({ success: false, message: 'menus must be an array' })
    return
  }

  await db.$transaction([
    db.roleMenu.deleteMany({ where: { roleId } }),
    db.roleMenu.createMany({
      data: menus.map((m: { path: string; actions?: string[] }) => ({
        roleId,
        menuPath: m.path,
        actions: m.actions ?? [],
      })),
      skipDuplicates: true,
    }),
  ])

  res.json({ success: true })
})

export default router
