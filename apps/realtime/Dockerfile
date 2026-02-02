# 1. PRUNE
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
# ⚠️ CHECK: Ensure package.json name is "realtime" or "@ticketforge/realtime"
RUN turbo prune --scope=realtime --docker

# 2. INSTALL
FROM node:22-alpine AS installer
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY --from=pruner /app/out/full/ .
# CRITICAL FIX: Copy the base config manually
COPY tsconfig.base.json .

# 3. BUILD
# ⚠️ CHECK: Ensure filter matches package.json name
RUN pnpm turbo run build --filter=realtime...

# 4. RUNNER
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 realtime
USER realtime

COPY --from=installer --chown=realtime:nodejs /app/apps/realtime/dist ./dist
COPY --from=installer --chown=realtime:nodejs /app/apps/realtime/package.json .
COPY --from=installer --chown=realtime:nodejs /app/node_modules ./node_modules

EXPOSE 3002
ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "dist/index.js"]