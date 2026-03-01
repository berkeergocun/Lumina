# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM oven/bun:1-slim AS deps

WORKDIR /app

COPY package.json ./
RUN bun install --production

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Üretim ortamı
ENV NODE_ENV=production

# Bağımlılıkları kopyala
COPY --from=deps /app/node_modules ./node_modules

# Kaynak kodu kopyala
COPY package.json tsconfig.json ./
COPY src/ ./src/

# GeoIP veritabanı varsa kopyala (opsiyonel — GEOIP_ENABLED=true ise gerekli)
# COPY data/ ./data/

# Tracker JS dosyası (collect modülü içinde)
# tracker.js src/ altında olduğu için zaten kopyalandı

EXPOSE 3001

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/index.ts"]
