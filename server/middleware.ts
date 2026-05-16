import session from 'express-session'
import type { Request, Response, NextFunction } from 'express'
import { SESSION_SECRET } from './config.js'

export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
})

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  next()
}
