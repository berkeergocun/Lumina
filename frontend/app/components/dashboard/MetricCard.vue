<template>
  <div class="rounded-lg border border-border bg-card p-5">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{{ label }}</span>
      <component :is="icon" class="size-4 text-muted-foreground" />
    </div>
    <div class="flex items-end justify-between gap-2">
      <div>
        <p v-if="!loading" class="text-xl font-semibold tracking-tight">{{ formattedValue }}</p>
        <div v-else class="h-8 w-24 rounded bg-muted animate-pulse" />
        <div v-if="change !== undefined && !loading" class="flex items-center gap-1 mt-1">
          <LucideTrendingUp v-if="change > 0" class="size-3 text-emerald-600" />
          <LucideTrendingDown v-else-if="change < 0" class="size-3 text-red-500" />
          <LucideMinus v-else class="size-3 text-muted-foreground" />
          <span
            :class="[
              'text-xs font-medium',
              change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-500' : 'text-muted-foreground'
            ]"
          >
            {{ change > 0 ? '+' : '' }}{{ change.toFixed(1) }}%
          </span>
          <span class="text-xs text-muted-foreground">önceki dönem</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideTrendingUp, LucideTrendingDown, LucideMinus } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  value: number | string
  icon?: any
  change?: number
  loading?: boolean
  format?: 'number' | 'percent' | 'duration' | 'raw'
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (props.format === 'percent') return `${(props.value * 100).toFixed(1)}%`
  if (props.format === 'duration') {
    const m = Math.floor(props.value / 60)
    const s = Math.floor(props.value % 60)
    return `${m}m ${s}s`
  }
  if (props.value >= 1_000_000) return `${(props.value / 1_000_000).toFixed(1)}M`
  if (props.value >= 1_000) return `${(props.value / 1_000).toFixed(1)}K`
  return props.value.toLocaleString('tr-TR')
})
</script>
