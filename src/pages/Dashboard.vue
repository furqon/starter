<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
    <p class="text-sm text-gray-500 mt-1">Welcome back, {{ auth.state.user?.username }}.</p>
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Users</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">1</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Sessions</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">Active</div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
        <div class="text-2xl font-semibold text-green-600 mt-1">Online</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { AuthStore } from '../stores/auth'

const auth = inject<AuthStore>('auth')!
</script>
