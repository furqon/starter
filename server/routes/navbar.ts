import { Router } from 'express'
import { getNavbarConfig, saveNavbarConfig } from '../services/navbar.js'
import { getUserMenus } from '../services/rbac.js'
import { requireAuth } from '../middleware.js'

const router = Router()

router.get('/navbar', requireAuth, async (req, res) => {
  const menus = await getUserMenus(req.session.user!.id)
  res.json({ items: menus })
})

router.get('/navbar-config', (_req, res) => {
  res.json({ items: getNavbarConfig() })
})

router.put('/navbar-config', (req, res) => {
  const { items } = req.body
  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, message: 'items must be an array' })
    return
  }
  saveNavbarConfig(items)
  res.json({ success: true })
})

export default router
