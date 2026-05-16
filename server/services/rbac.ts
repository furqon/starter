import db from '../db.js'
import { getNavbarConfig, filterMenuItems, markChecked } from './navbar.js'
import type { FullUser, MenuItem } from '../types.js'

function getRoleId(userId: number): number | null {
  const row = db
    .prepare('SELECT role_id FROM user_roles WHERE user_id = ?')
    .get(userId) as any
  return row?.role_id ?? null
}

function getAllowedPaths(roleId: number): string[] {
  const rows = db
    .prepare('SELECT menu_path FROM role_menus WHERE role_id = ?')
    .all(roleId) as any[]
  return rows.map((r) => r.menu_path)
}

export function getUserRole(
  userId: number
): { id: number; name: string } | null {
  const row = db
    .prepare(
      'SELECT r.id, r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ?'
    )
    .get(userId) as any
  return row ?? null
}

export function getUserMenus(userId: number): MenuItem[] {
  const roleId = getRoleId(userId)
  if (!roleId) return []
  const paths = getAllowedPaths(roleId)
  return filterMenuItems(getNavbarConfig(), new Set(paths))
}

export function getFullUser(userId: number): FullUser | null {
  const user = db
    .prepare('SELECT id, username FROM users WHERE id = ?')
    .get(userId) as any
  if (!user) return null
  const role = getUserRole(user.id)
  const menus = getUserMenus(user.id)
  return { id: user.id, username: user.username, role, menus }
}

export function getRoleMenusWithChecked(roleId: number): MenuItem[] {
  const paths = getAllowedPaths(roleId)
  return markChecked(getNavbarConfig(), new Set(paths))
}
