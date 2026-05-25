import { reactive } from 'vue'

export type User = {
  id: number
  username: string
  role: { id: number; name: string } | null
  menus: { label: string; path?: string; children?: any[]; allowedActions?: string[] }[]
} | null

export function createAuthStore() {
  const state = reactive({
    user: null as User,
    isAuthenticated: false,
  })

  function setUser(user: User) {
    state.user = user
    state.isAuthenticated = !!user
  }

  return { state, setUser }
}

export type AuthStore = ReturnType<typeof createAuthStore>
