<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-11 px-6">
      <div class="flex items-center space-x-0.5">
        <template v-for="item in navItems" :key="item.label">
          <router-link
            v-if="item.path"
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
          <div v-else class="relative">
            <button
              @click.stop="toggleDropdown(item.label)"
              class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1"
              :class="
                isChildActive(item.children)
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
            >
              {{ item.label }}
              <svg class="w-3 h-3 mt-0.5" :class="openDropdown === item.label ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div
              v-if="openDropdown === item.label"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[140px] py-1 z-50"
              @click.stop
            >
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                :class="{ 'bg-gray-50 font-medium': isActive(child.path) }"
                @click="closeDropdown"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>
        </template>
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
import { inject, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { AuthStore } from '../stores/auth'

interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
}

const router = useRouter()
const route = useRoute()
const auth = inject<AuthStore>('auth')!
const openDropdown = ref<string | null>(null)

const navItems = computed(() => (auth.state.user?.menus || []) as MenuItem[])

function isActive(path: string) {
  return route.path === path
}

function isChildActive(children?: MenuItem[]) {
  if (!children) return false
  return children.some((c) => isActive(c.path || ''))
}

function toggleDropdown(label: string) {
  openDropdown.value = openDropdown.value === label ? null : label
}

function closeDropdown() {
  openDropdown.value = null
}

function handleClickOutside() {
  openDropdown.value = null
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function logout() {
  await fetch('/api/logout', { method: 'POST' })
  auth.setUser(null)
  router.push('/login')
}
</script>
