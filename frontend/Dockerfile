# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Bağımlılıkları yükle
COPY package.json ./
RUN bun install

# Kaynak kodunu kopyala
COPY . .

# NUXT_PUBLIC_* değişkenleri build sırasında varsayılan olarak girilir.
# Dokploy'da Environment Variables kısmında gerçek değerleri tanımlayın —
# Nuxt SSR modunda runtime'da da override edilebilir.
RUN bun run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Yalnızca build çıktısını kopyala
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
