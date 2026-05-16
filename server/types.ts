import 'express-session'

export interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
  checked?: boolean
}

export interface SessionUser {
  id: number
  username: string
}

export interface FullUser {
  id: number
  username: string
  role: { id: number; name: string } | null
  menus: MenuItem[]
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser
  }
}
