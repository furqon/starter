<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm text-gray-500">Manage system users and role assignments.</p>
      <button
        @click="showAdd = true"
        class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        + Add User
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th class="px-4 py-2.5">Username</th>
            <th class="px-4 py-2.5">Role</th>
            <th class="px-4 py-2.5">Created</th>
            <th class="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
            <td class="px-4 py-2.5 text-gray-900">{{ u.username }}</td>
            <td class="px-4 py-2.5">
              <select
                :value="u.role_id || ''"
                @change="changeRole(u.id, $event)"
                class="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </td>
            <td class="px-4 py-2.5 text-gray-500 text-xs">{{ u.created_at }}</td>
            <td class="px-4 py-2.5 text-right">
              <button
                @click="deleteUser(u.id)"
                class="text-xs text-red-500 hover:text-red-700"
                :disabled="u.id === currentUserId"
                :class="{ 'opacity-40': u.id === currentUserId }"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAdd" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50" @click.self="showAdd = false">
      <div class="bg-white rounded-lg border border-gray-200 p-5 w-full max-w-xs mx-4 shadow-lg">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Add User</h2>
        <form @submit.prevent="addUser" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select v-model="form.role_id" class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="null">None</option>
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <p v-if="formError" class="text-red-500 text-xs">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-1">
            <button type="button" @click="showAdd = false" class="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { inject } from 'vue'
import type { AuthStore } from '../stores/auth'

const auth = inject<AuthStore>('auth')!
const currentUserId = auth.state.user?.id

const users = ref<any[]>([])
const roles = ref<any[]>([])
const showAdd = ref(false)
const formError = ref('')
const form = ref({ username: '', password: '', role_id: null as number | null })

async function load() {
  const [uRes, rRes] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/roles'),
  ])
  if (uRes.ok) users.value = (await uRes.json()).users
  if (rRes.ok) roles.value = (await rRes.json()).roles
}

async function addUser() {
  formError.value = ''
  if (!form.value.username || !form.value.password) {
    formError.value = 'Username and password required'
    return
  }
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value),
  })
  if (res.ok) {
    showAdd.value = false
    form.value = { username: '', password: '', role_id: null }
    load()
  } else {
    const data = await res.json()
    formError.value = data.message
  }
}

async function changeRole(userId: number, event: Event) {
  const roleId = (event.target as HTMLSelectElement).value
  await fetch(`/api/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId ? Number(roleId) : null }),
  })
}

async function deleteUser(userId: number) {
  if (!confirm('Delete this user?')) return
  await fetch(`/api/users/${userId}`, { method: 'DELETE' })
  load()
}

onMounted(load)
</script>
