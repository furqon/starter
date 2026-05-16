<template>
  <div class="space-y-1">
    <template v-for="item in items" :key="item.label || item.path">
      <div v-if="item.children">
        <div class="text-xs font-medium text-gray-500 mb-1 mt-2 first:mt-0">{{ item.label }}</div>
        <div class="ml-3 border-l border-gray-100 pl-3">
          <MenuTree :items="item.children" :selected="selected" @toggle="(p) => emit('toggle', p)" />
        </div>
      </div>
      <label v-else class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5 hover:bg-gray-50 rounded px-1 -mx-1">
        <input
          type="checkbox"
          :checked="selected.includes(item.path)"
          @change="emit('toggle', item.path)"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        {{ item.label }}
      </label>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[]
  selected: string[]
}>()

const emit = defineEmits<{
  toggle: [path: string]
}>()
</script>
