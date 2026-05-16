<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-gray-900">Management</h1>
    <div class="mt-4 border-b border-gray-200">
      <div class="flex space-x-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors -mb-px"
          :class="activeTab === tab.key
            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
            : 'text-gray-500 hover:text-gray-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div class="mt-4">
      <UserManagement v-if="activeTab === 'users'" />
      <RoleManagement v-if="activeTab === 'roles'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserManagement from '../components/UserManagement.vue'
import RoleManagement from '../components/RoleManagement.vue'

const tabs = [
  { key: 'users', label: 'User Management' },
  { key: 'roles', label: 'Role Management' },
]
const activeTab = ref('users')
</script>
