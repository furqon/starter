import db from '../db.js'
import { getNavbarConfig, filterMenuItems, markChecked } from './navbar.js'
import type { FullUser, MenuItem } from '../types.js'

async function getAllowedMenus(roleId: number): Promise<Map<string, string[]>> {
  const rows = await db.roleMenu.findMany({
    where: { roleId },
    select: { menuPath: true, actions: true },
  })
  const map = new Map<string, string[]>()
  for (const row of rows) {
    map.set(row.menuPath, (row.actions as string[]) ?? [])
  }
  return map
}

function getMenuActionsMap(items: MenuItem[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  function walk(list: MenuItem[]) {
    for (const item of list) {
      if (item.children) {
        walk(item.children)
      } else if (item.path) {
        map.set(item.path, item.actions ?? [])
      }
    }
  }
  walk(items)
  return map
}

async function getRoleId(userId: number): Promise<number | null> {
  const row = await db.userRole.findFirst({
    where: { userId },
    select: { roleId: true },
  })
  return row?.roleId ?? null
}

export async function getUserRole(
  userId: number
): Promise<{ id: number; name: string } | null> {
  const row = await db.userRole.findFirst({
    where: { userId },
    select: { role: { select: { id: true, name: true } } },
  })
  return row?.role ?? null
}

export async function getUserMenus(userId: number): Promise<MenuItem[]> {
  const roleId = await getRoleId(userId)
  if (!roleId) return []
  const allowedMenus = await getAllowedMenus(roleId)
  return filterMenuItems(getNavbarConfig(), allowedMenus)
}

export async function getFullUser(userId: number): Promise<FullUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  })
  if (!user) return null
  const role = await getUserRole(user.id)
  const menus = await getUserMenus(user.id)
  return { id: user.id, username: user.username, role, menus }
}

export async function getRoleMenusWithChecked(
  roleId: number
): Promise<MenuItem[]> {
  const roleActions = await getAllowedMenus(roleId)
  const masterItems = getNavbarConfig()
  const menuActions = getMenuActionsMap(masterItems)
  return markChecked(masterItems, roleActions, menuActions)
}
