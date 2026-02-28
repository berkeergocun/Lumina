<template>
  <div class="p-6 md:p-8 max-w-2xl mx-auto">
    <div class="mb-8">
      <NuxtLink :to="`/sites`" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <LucideArrowLeft class="size-4" />
        Sitelere Dön
      </NuxtLink>
      <h1 class="text-xl font-bold">Entegrasyon Kodu</h1>
      <p class="text-muted-foreground text-sm mt-0.5">Aşağıdaki kodu sitenize ekleyin</p>
    </div>

    <div v-if="isLoading" class="h-48 rounded-xl bg-muted animate-pulse" />

    <div v-else-if="snippet" class="space-y-6">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 class="text-sm font-semibold mb-1">HTML Script Etiketi</h2>
          <p class="text-xs text-muted-foreground">Sitenizin <code class="bg-muted px-1 rounded">&lt;head&gt;</code> bölümüne ekleyin</p>
        </div>
        <div class="relative">
          <pre class="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto">{{ snippet.html }}</pre>
          <button
            class="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border rounded bg-background hover:bg-muted transition-colors"
            @click="copy(snippet.html)"
          >
            <LucideCopy class="size-3" />
            {{ copied ? 'Kopyalandı!' : 'Kopyala' }}
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 class="text-sm font-semibold">Manuel Event Gönderme</h2>
        <pre class="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto">window.Lumina.track('event_name', {{'{'}}
  property: 'value'
{{'}'}});</pre>
      </div>

      <div class="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <div :class="['size-2.5 rounded-full shrink-0', snippet ? 'bg-emerald-500 animate-pulse' : 'bg-muted']" />
        <div>
          <p class="text-sm font-medium">Site ID: <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{{ snippet.siteId }}</code></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideArrowLeft, LucideCopy } from 'lucide-vue-next'
import { useSites } from '~/composables/useSites'

definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const { getSnippet } = useSites()

const siteId = computed(() => route.params.siteId as string)
const snippet = ref<any>(null)
const isLoading = ref(true)
const copied = ref(false)

function copy(text: string) {
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

onMounted(async () => {
  try {
    const res = await getSnippet(siteId.value)
    if (res.success) snippet.value = res.data
  } finally {
    isLoading.value = false
  }
})
</script>
