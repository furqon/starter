import { Router } from 'express'
import authRoutes from './auth.js'
import navbarRoutes from './navbar.js'
import userRoutes from './users.js'
import roleRoutes from './roles.js'

const router = Router()

router.use(authRoutes)
router.use(navbarRoutes)
router.use(userRoutes)
router.use(roleRoutes)

export default router
