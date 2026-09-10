# -------- Stage 1: Builder --------
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN node scripts/ensure-pages-document.js

RUN npx prisma generate

RUN NODE_ENV=production npm run build

# -------- Stage 2: Production Runner --------
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/package.json       ./package.json
COPY --from=builder /app/package-lock.json  ./package-lock.json

RUN npm ci --omit=dev

COPY --from=builder /app/.next               ./.next
COPY --from=builder /app/public              ./public
COPY --from=builder /app/prisma              ./prisma
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

EXPOSE 3000
CMD ["npm", "start"]
