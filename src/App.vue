<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <Navbar v-if="auth.state.isAuthenticated" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { AuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'

const auth = inject<AuthStore>('auth')!
</script>
