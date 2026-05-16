# Monolith App

TypeScript + Express + Vite + Vue SSR + Tailwind + SQLite

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — login with `admin` / `1`

## Features

- **Vue SSR** — server-side rendered Vue 3 with client hydration
- **RBAC** — role-based access control with per-role menu visibility
- **Multi-level navbar** — JSON-configured navbar with dropdown support
- **User management** — CRUD users, assign roles
- **Role management** — CRUD roles, assign menu access via checkboxes
- **Menu management** — edit `navbar.json` directly from the Role Management UI
- **Light mode** — clean, compact, full-width design

## Stack

| Layer | Tech |
|-------|------|
| Server | Express + express-session |
| Frontend | Vue 3 + Vue Router 4 |
| SSR | Vite custom SSR |
| Styling | Tailwind CSS 3 |
| Database | SQLite via better-sqlite3 |
| Language | TypeScript |

## Project Structure

```
├── server/
│   ├── index.ts           Entry: Express + Vite SSR dev/prod
│   ├── config.ts          Constants, paths, env defaults
│   ├── types.ts           Shared types + session augmentation
│   ├── db.ts              Database connection
│   ├── schema.ts          Table creation + seed data
│   ├── middleware.ts      Session + requireAuth middleware
│   ├── services/
│   │   ├── navbar.ts      Navbar config read/write, menu filtering
│   │   └── rbac.ts        RBAC queries (getUserMenus, getFullUser)
│   └── routes/
│       ├── index.ts       Route aggregator
│       ├── auth.ts        POST /login, POST /logout, GET /me
│       ├── navbar.ts      GET|PUT /navbar-config, GET /navbar
│       ├── users.ts       CRUD /users + role assignment
│       └── roles.ts       CRUD /roles + menu permissions
├── src/
│   ├── entry-client.ts    Browser entry (hydration)
│   ├── entry-server.ts    Server-side render function
│   ├── main.ts            Universal app factory (auth guard)
│   ├── router.ts          Vue Router config
│   ├── App.vue            Root layout
│   ├── stores/auth.ts     Reactive auth store
│   ├── pages/
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── Settings.vue
│   │   └── Management.vue      Tab container with router-view
│   └── components/
│       ├── Navbar.vue          Multi-level dropdown navbar
│       ├── MenuTree.vue        Recursive menu checkboxes
│       ├── UserManagement.vue  User CRUD
│       └── RoleManagement.vue  Role CRUD + menu picker
├── navbar.json            Master menu config (editable via UI)
├── .env                   Environment config
├── index.html             HTML template
├── tailwind.config.cjs
└── postcss.config.cjs
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/login | Login (returns user with role + menus) |
| POST | /api/logout | Destroy session |
| GET | /api/me | Current user info |

### Navbar
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/navbar | Menu items for current user's role |
| GET | /api/navbar-config | All available menu items (master config) |
| PUT | /api/navbar-config | Update navbar.json |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List users with roles |
| POST | /api/users | Create user |
| DELETE | /api/users/:id | Delete user |
| PUT | /api/users/:id/role | Assign role to user |

### Roles
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/roles | List roles |
| POST | /api/roles | Create role |
| PUT | /api/roles/:id | Update role |
| DELETE | /api/roles/:id | Delete role |
| GET | /api/roles/:id/menus | Get role menu permissions (hierarchical with checked flags) |
| PUT | /api/roles/:id/menus | Set role menu permissions |

## RBAC Model

- **Roles** — each role has a name and description
- **Role Menus** — each role is assigned a set of leaf menu paths
- **User Roles** — each user has one role
- **Navbar** — built by filtering `navbar.json` against the user's role menu paths
- **Menu groups** (items with `children` in `navbar.json`) appear as dropdowns when any child is allowed

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build client + SSR bundles |
| `npm start` | Production server |
