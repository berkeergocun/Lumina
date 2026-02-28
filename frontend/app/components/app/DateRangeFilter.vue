<template>
  <div class="flex items-center gap-1 p-1 bg-muted rounded-lg text-xs">
    <button
      v-for="range in ranges"
      :key="range.value"
      :class="[
        'px-2.5 py-1 rounded font-medium transition-colors',
        modelValue === range.value
          ? 'bg-background shadow-sm text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="$emit('update:modelValue', range.value)"
    >
      {{ range.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  ranges?: { label: string; value: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const ranges = [
  { label: 'Bugün', value: '0' },
  { label: '7G', value: '7' },
  { label: '30G', value: '30' },
  { label: '3A', value: '90' },
]
</script>
