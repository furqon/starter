import db from './db.js'

export async function initSchema(): Promise<void> {
  await db.$connect()
}

export async function seed(): Promise<void> {
  const adminUser = await db.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: '1' },
  })

  const adminRole = await db.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Full access' },
  })

  const userRole = await db.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User', description: 'Basic access' },
  })

  const hasRole = await db.userRole.findFirst({
    where: { userId: adminUser.id },
  })
  if (!hasRole) {
    await db.userRole.create({
      data: { userId: adminUser.id, roleId: adminRole.id },
    })
  }

  const adminMenuCount = await db.roleMenu.count({
    where: { roleId: adminRole.id },
  })
  if (adminMenuCount === 0) {
    const allMenus = [
      { menuPath: '/', actions: ['view'] },
      { menuPath: '/settings', actions: ['view', 'edit', 'submit', 'tab'] },
      { menuPath: '/management/users', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { menuPath: '/management/roles', actions: ['view', 'create', 'edit', 'delete'] },
    ]
    await db.roleMenu.createMany({
      data: allMenus.map((m) => ({ roleId: adminRole.id, ...m })),
      skipDuplicates: true,
    })
  }

  const userMenuCount = await db.roleMenu.count({
    where: { roleId: userRole.id },
  })
  if (userMenuCount === 0) {
    const basicMenus = [
      { menuPath: '/', actions: ['view'] },
      { menuPath: '/settings', actions: ['view'] },
    ]
    await db.roleMenu.createMany({
      data: basicMenus.map((m) => ({ roleId: userRole.id, ...m })),
      skipDuplicates: true,
    })
  }
}
