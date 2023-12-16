FROM node:18-alpine AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache libc6-compat build-base openssl && \
    npm i -g pnpm && \
    pnpm i --frozen-lockfile


FROM node:18-alpine AS builder

WORKDIR /app
COPY . ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm i -g pnpm && \
    pnpm run build && \
    pnpm run generate:mysql

FROM node:18-alpine AS runner

WORKDIR /app
RUN addgroup -g 1001 appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD node dist/shared/infra/http/server.js
EXPOSE 5001
