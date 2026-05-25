<template>
  <div class="space-y-1">
    <template v-for="item in items" :key="item.label || item.path">
      <div v-if="item.children">
        <div class="text-xs font-medium text-gray-500 mb-1 mt-2 first:mt-0">{{ item.label }}</div>
        <div class="ml-3 border-l border-gray-100 pl-3">
          <MenuTree :items="item.children" :menu-actions="menuActions" :selected-actions="selectedActions" @toggle-menu="(p) => emit('toggleMenu', p)" @toggle-action="(p, a) => emit('toggleAction', p, a)" />
        </div>
      </div>
      <div v-else class="border-b border-gray-50 last:border-b-0">
        <div class="flex items-center gap-2 py-0.5">
          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 flex-1">
            <input
              type="checkbox"
              :checked="isMenuSelected(item.path)"
              @change="emit('toggleMenu', item.path)"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="font-medium">{{ item.label }}</span>
          </label>
        </div>
        <div v-if="item.actions && item.actions.length > 0 && isMenuSelected(item.path)" class="ml-6 pb-1 flex flex-wrap gap-1">
          <label
            v-for="action in item.actions"
            :key="action"
            class="flex items-center gap-1.5 text-xs cursor-pointer px-2 py-0.5 rounded hover:bg-gray-50"
          >
            <input
              type="checkbox"
              :checked="isActionSelected(item.path, action)"
              @change="emit('toggleAction', item.path, action)"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {{ action }}
          </label>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface MenuActionItem {
  label: string
  path?: string
  children?: MenuActionItem[]
  actions?: string[]
  allowedActions?: string[]
  checked?: boolean
}

const props = defineProps<{
  items: MenuActionItem[]
  menuActions: Record<string, string[]>
  selectedActions: Record<string, string[]>
}>()

const emit = defineEmits<{
  toggleMenu: [path: string]
  toggleAction: [path: string, action: string]
}>()

function isMenuSelected(path?: string) {
  if (!path) return false
  return path in props.selectedActions
}

function isActionSelected(path: string, action: string) {
  const actions = props.selectedActions[path]
  if (!actions) return false
  return actions.includes(action)
}
</script>
