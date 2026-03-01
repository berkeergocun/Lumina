<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Top Header -->
    <header class="h-14 border-b border-border bg-background flex items-center px-6 shrink-0">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5">
        <div class="size-7 bg-foreground rounded-md flex items-center justify-center">
          <span class="text-background text-xs font-black tracking-tighter">L</span>
        </div>
        <span class="font-semibold text-[15px] tracking-tight">Lumina</span>
      </NuxtLink>
    </header>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
