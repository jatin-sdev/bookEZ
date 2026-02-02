# 1. PRUNE: Isolate only the API and its local dependencies
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
# NOTE: Replace '@ticketforge/api' with the exact "name" from apps/api/package.json
RUN turbo prune --scope=api --docker

# 2. INSTALL: Install dependencies only for the pruned project
FROM node:22-alpine AS installer
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the pruned lockfiles and package.jsons
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies (frozen-lockfile ensures consistency)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy the source code for the pruned project
COPY --from=pruner /app/out/full/ .

COPY tsconfig.base.json .

# 3. BUILD: Compile the TypeScript code
RUN pnpm turbo run build --filter=api...

# 4. RUNNER: The final lightweight production image
FROM node:22-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy built artifacts from the installer stage
COPY --from=installer --chown=expressjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=expressjs:nodejs /app/apps/api/package.json .

# We only need production deps here. 
# (Alternatively, you can copy node_modules from installer if your build is complex)
COPY --from=installer --chown=expressjs:nodejs /app/node_modules ./node_modules

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

# --- Add Migration & Seed Files ---
COPY --from=installer /app/apps/api/drizzle.config.ts .
COPY --from=installer /app/apps/api/scripts ./scripts
COPY --from=installer /app/apps/api/src ./src

CMD ["node", "dist/index.js"]