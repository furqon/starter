<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-gray-900">Management</h1>
    <div class="mt-4 border-b border-gray-200">
      <div class="flex space-x-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors -mb-px"
          :class="
            route.path === tab.path
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          "
        >
          {{ tab.label }}
        </router-link>
      </div>
    </div>
    <div class="mt-4">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const tabs = [
  { label: 'User Management', path: '/management/users' },
  { label: 'Role Management', path: '/management/roles' },
]
</script>
