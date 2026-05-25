import fs from 'fs'
import { NAVBAR_PATH } from '../config.js'
import type { MenuItem } from '../types.js'

const defaults: MenuItem[] = [
  { label: 'Dashboard', path: '/', actions: ['view'] },
  { label: 'Settings', path: '/settings', actions: ['view', 'edit'] },
  { label: 'Management', path: '/management' },
]

export function getNavbarConfig(): MenuItem[] {
  if (!fs.existsSync(NAVBAR_PATH)) {
    saveNavbarConfig(defaults)
    return defaults
  }
  return JSON.parse(fs.readFileSync(NAVBAR_PATH, 'utf-8'))
}

export function saveNavbarConfig(items: MenuItem[]): void {
  fs.writeFileSync(NAVBAR_PATH, JSON.stringify(items, null, 2))
}

export function filterMenuItems(
  items: MenuItem[],
  allowedMenus: Map<string, string[]>
): MenuItem[] {
  const result: MenuItem[] = []
  for (const item of items) {
    if (item.children) {
      const filtered = filterMenuItems(item.children, allowedMenus)
      if (filtered.length > 0) {
        result.push({ label: item.label, children: filtered })
      }
    } else if (item.path && allowedMenus.has(item.path)) {
      const allowedActions = allowedMenus.get(item.path)!
      result.push({
        ...item,
        allowedActions,
      })
    }
  }
  return result
}

export function collectLeafPaths(items: MenuItem[]): string[] {
  const paths: string[] = []
  for (const item of items) {
    if (item.children) {
      paths.push(...collectLeafPaths(item.children))
    } else if (item.path) {
      paths.push(item.path)
    }
  }
  return paths
}

export function markChecked(
  items: MenuItem[],
  roleActions: Map<string, string[]>,
  menuActions: Map<string, string[]>
): MenuItem[] {
  return items.map((item) => {
    if (item.children) {
      return {
        label: item.label,
        children: markChecked(item.children, roleActions, menuActions),
      }
    }
    const path = item.path ?? ''
    const checkedActions = roleActions.get(path) ?? []
    return {
      ...item,
      checked: roleActions.has(path),
      actions: menuActions.get(path) ?? [],
      allowedActions: checkedActions,
    }
  })
}
