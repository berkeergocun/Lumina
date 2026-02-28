<template>
  <div class="relative inline-flex" @mouseenter="show" @mouseleave="hide">
    <slot />
    <Transition name="tooltip">
      <div
        v-if="!disabled && isVisible"
        :class="[
          'absolute z-50 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap pointer-events-none',
          'bg-foreground text-background shadow-md',
          positionClasses,
        ]"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  disabled?: boolean
  delay?: number
}>(), {
  side: 'top',
  disabled: false,
  delay: 400,
})

const isVisible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function show() {
  if (props.disabled) return
  timer = setTimeout(() => { isVisible.value = true }, props.delay)
}

function hide() {
  if (timer) clearTimeout(timer)
  isVisible.value = false
}

const positionClasses = computed(() => {
  switch (props.side) {
    case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2'
    case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2'
    case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2'
    default: return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
  }
})
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 100ms ease, transform 100ms ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
