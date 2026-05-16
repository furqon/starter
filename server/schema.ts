import db from './db.js'

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      UNIQUE(user_id, role_id)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS role_menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      menu_path TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      UNIQUE(role_id, menu_path)
    )
  `)
}

export function seed(): void {
  const adminUser = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get('admin') as any
  if (!adminUser) {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(
      'admin',
      '1'
    )
  }

  let adminRole = db
    .prepare('SELECT id FROM roles WHERE name = ?')
    .get('Admin') as any
  if (!adminRole) {
    const result = db
      .prepare('INSERT INTO roles (name, description) VALUES (?, ?)')
      .run('Admin', 'Full access')
    adminRole = { id: result.lastInsertRowid }
  }

  let userRole = db
    .prepare('SELECT id FROM roles WHERE name = ?')
    .get('User') as any
  if (!userRole) {
    const result = db
      .prepare('INSERT INTO roles (name, description) VALUES (?, ?)')
      .run('User', 'Basic access')
    userRole = { id: result.lastInsertRowid }
  }

  const currentAdmin = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get('admin') as any
  const hasRole = db
    .prepare('SELECT id FROM user_roles WHERE user_id = ?')
    .get(currentAdmin.id)
  if (!hasRole) {
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').run(
      currentAdmin.id,
      adminRole.id
    )
  }

  const adminMenuCount = db
    .prepare('SELECT COUNT(*) as count FROM role_menus WHERE role_id = ?')
    .get(adminRole.id) as any
  if (adminMenuCount.count === 0) {
    const allPaths = ['/', '/settings', '/management/users', '/management/roles']
    const insert = db.prepare(
      'INSERT OR IGNORE INTO role_menus (role_id, menu_path) VALUES (?, ?)'
    )
    for (const p of allPaths) {
      insert.run(adminRole.id, p)
    }
  }

  const userMenuCount = db
    .prepare('SELECT COUNT(*) as count FROM role_menus WHERE role_id = ?')
    .get(userRole.id) as any
  if (userMenuCount.count === 0) {
    const basicPaths = ['/', '/settings']
    const insert = db.prepare(
      'INSERT OR IGNORE INTO role_menus (role_id, menu_path) VALUES (?, ?)'
    )
    for (const p of basicPaths) {
      insert.run(userRole.id, p)
    }
  }
}
