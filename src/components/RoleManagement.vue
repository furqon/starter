<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm text-gray-500">Manage roles and their menu access.</p>
      <button
        @click="openEdit(null)"
        class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        + Add Role
      </button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
            <th class="px-4 py-2.5">Name</th>
            <th class="px-4 py-2.5">Description</th>
            <th class="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in roles" :key="r.id" class="hover:bg-gray-50">
            <td class="px-4 py-2.5 text-gray-900 font-medium">{{ r.name }}</td>
            <td class="px-4 py-2.5 text-gray-500 text-xs">{{ r.description }}</td>
            <td class="px-4 py-2.5 text-right space-x-2">
              <button @click="openEdit(r)" class="text-xs text-blue-600 hover:text-blue-800">Edit</button>
              <button
                @click="deleteRole(r.id)"
                class="text-xs text-red-500 hover:text-red-700"
                :disabled="r.name === 'Admin'"
                :class="{ 'opacity-40': r.name === 'Admin' }"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="editTarget"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      @click.self="editTarget = null"
    >
      <div class="bg-white rounded-lg border border-gray-200 p-5 w-full max-w-sm mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">
          {{ editTarget.id ? 'Edit Role' : 'Add Role' }}
        </h2>
        <form @submit.prevent="saveRole" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              v-model="editForm.description"
              type="text"
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Menu & Action Access</label>
            <div class="max-h-64 overflow-y-auto border border-gray-100 rounded-md p-2">
              <MenuTree
                :items="masterMenus"
                :menu-actions="masterMenuActions"
                :selected-actions="editActions"
                @toggle-menu="toggleMenu"
                @toggle-action="toggleAction"
              />
            </div>
          </div>
          <p v-if="editError" class="text-red-500 text-xs">{{ editError }}</p>
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              @click="editTarget = null"
              class="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MenuTree from './MenuTree.vue'

interface MenuActionItem {
  label: string
  path?: string
  children?: MenuActionItem[]
  actions?: string[]
  allowedActions?: string[]
  checked?: boolean
}

const roles = ref<any[]>([])
const masterMenus = ref<MenuActionItem[]>([])
const masterMenuActions = ref<Record<string, string[]>>({})
const editTarget = ref<any>(null)
const editForm = ref({ name: '', description: '' })
const editActions = ref<Record<string, string[]>>({})
const editError = ref('')

function collectMenuActions(items: MenuActionItem[]): Record<string, string[]> {
  const actions: Record<string, string[]> = {}
  function walk(list: MenuActionItem[]) {
    for (const item of list) {
      if (item.children) {
        walk(item.children)
      } else if (item.path && item.actions) {
        actions[item.path] = item.actions
      }
    }
  }
  walk(items)
  return actions
}

async function load() {
  const [rRes, mRes] = await Promise.all([
    fetch('/api/roles'),
    fetch('/api/navbar-config'),
  ])
  if (rRes.ok) roles.value = (await rRes.json()).roles
  if (mRes.ok) {
    masterMenus.value = (await mRes.json()).items
    masterMenuActions.value = collectMenuActions(masterMenus.value)
  }
}

async function openEdit(role: any) {
  editError.value = ''
  if (role) {
    editTarget.value = role
    editForm.value = { name: role.name, description: role.description }
    const res = await fetch(`/api/roles/${role.id}/menus`)
    if (res.ok) {
      const data = await res.json()
      const actions: Record<string, string[]> = {}
      function walk(items: MenuActionItem[]) {
        for (const item of items) {
          if (item.children) {
            walk(item.children)
          } else if (item.checked && item.path) {
            actions[item.path] = item.allowedActions ?? []
          }
        }
      }
      walk(data.items)
      editActions.value = actions
    }
  } else {
    editTarget.value = { id: null }
    editForm.value = { name: '', description: '' }
    editActions.value = {}
  }
}

function toggleMenu(path: string) {
  if (path in editActions.value) {
    const { [path]: _, ...rest } = editActions.value
    editActions.value = rest
  } else {
    const available = masterMenuActions.value[path] ?? []
    editActions.value = { ...editActions.value, [path]: [...available] }
  }
}

function toggleAction(path: string, action: string) {
  const current = editActions.value[path] ?? []
  if (current.includes(action)) {
    const filtered = current.filter((a: string) => a !== action)
    if (filtered.length === 0) {
      const { [path]: _, ...rest } = editActions.value
      editActions.value = rest
    } else {
      editActions.value = { ...editActions.value, [path]: filtered }
    }
  } else {
    editActions.value = { ...editActions.value, [path]: [...current, action] }
  }
}

async function saveRole() {
  editError.value = ''
  if (!editForm.value.name) {
    editError.value = 'Name is required'
    return
  }

  const menus = Object.entries(editActions.value).map(([path, actions]) => ({
    path,
    actions,
  }))

  if (editTarget.value.id) {
    const res = await fetch(`/api/roles/${editTarget.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!res.ok) return
    await fetch(`/api/roles/${editTarget.value.id}/menus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menus }),
    })
  } else {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value),
    })
    if (!res.ok) return
    const data = await res.json()
    await fetch(`/api/roles/${data.role.id}/menus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menus }),
    })
  }
  editTarget.value = null
  load()
}

async function deleteRole(roleId: number) {
  if (!confirm('Delete this role?')) return
  const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
  if (res.ok) {
    load()
  } else {
    const data = await res.json()
    alert(data.message)
  }
}

onMounted(load)
</script>
