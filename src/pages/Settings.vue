<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-gray-900">Settings</h1>
    <p class="text-sm text-gray-500 mt-1">Application settings.</p>
    <div class="mt-6 bg-white rounded-lg border border-gray-200 p-4 max-w-md">
      <div class="flex items-center justify-between py-2">
        <span class="text-sm text-gray-700">Theme</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Light</span>
          <button
            v-if="hasAction('edit')"
            class="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Change
          </button>
        </div>
      </div>
      <div class="flex items-center justify-between py-2 border-t border-gray-100">
        <span class="text-sm text-gray-700">Version</span>
        <span class="text-sm text-gray-500">1.0.0</span>
      </div>
      <div class="flex items-center justify-between py-2 border-t border-gray-100">
        <span class="text-sm text-gray-700">Notifications</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">On</span>
          <button
            v-if="hasAction('edit')"
            class="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Configure
          </button>
        </div>
      </div>

      <div v-if="hasAction('tab')" class="mt-4 border-t border-gray-100 pt-4">
        <div class="flex gap-2 mb-3">
          <button
            v-for="t in tabs"
            :key="t.id"
            @click="activeTab = t.id"
            class="text-xs px-3 py-1.5 rounded-md transition-colors"
            :class="activeTab === t.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'"
          >
            {{ t.label }}
          </button>
        </div>
        <div class="text-sm text-gray-600">
          <p v-if="activeTab === 'general'">General settings content goes here.</p>
          <p v-if="activeTab === 'advanced'">Advanced settings content goes here.</p>
          <p v-if="activeTab === 'security'">Security settings content goes here.</p>
        </div>
      </div>

      <div v-if="hasAction('submit')" class="mt-4 border-t border-gray-100 pt-4 flex justify-end gap-2">
        <button class="text-sm px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import type { AuthStore } from '../stores/auth'

const auth = inject<AuthStore>('auth')!
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'security', label: 'Security' },
]

const settingsMenuActions = computed(() => {
  const menus = auth.state.user?.menus ?? []
  const found = menus.find((m) => m.path === '/settings')
  return found?.allowedActions ?? []
})

function hasAction(action: string): boolean {
  return settingsMenuActions.value.includes(action)
}
</script>
