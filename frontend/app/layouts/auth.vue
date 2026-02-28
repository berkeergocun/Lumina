<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
          <div class="size-8 bg-foreground rounded-lg flex items-center justify-center">
            <span class="text-background text-sm font-black">L</span>
          </div>
          Lumina
        </NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template>
