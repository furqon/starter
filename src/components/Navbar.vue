<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-11 px-6">
      <div class="flex items-center space-x-0.5">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="
            isActive(item.path)
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          "
        >
          {{ item.label }}
        </router-link>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">{{ auth.state.user?.role?.name }}</span>
        <button
          @click="logout"
          class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { AuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = inject<AuthStore>('auth')!

const navItems = computed(() => auth.state.user?.menus || [])

function isActive(path: string) {
  return route.path === path
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' })
  auth.setUser(null)
  router.push('/login')
}
</script>
