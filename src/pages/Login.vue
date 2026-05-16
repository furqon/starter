<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-xs mx-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 class="text-lg font-semibold text-gray-900 mb-5 text-center">Sign in</h1>
        <form @submit.prevent="login" class="space-y-3.5">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="password"
            />
          </div>
          <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
          <button
            type="submit"
            class="w-full py-1.5 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthStore } from '../stores/auth'

const router = useRouter()
const auth = inject<AuthStore>('auth')!

const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.value, password: password.value }),
  })
  if (res.ok) {
    const data = await res.json()
    auth.setUser(data.user)
    router.push('/')
  } else {
    const data = await res.json()
    error.value = data.message || 'Invalid credentials'
  }
}
</script>
