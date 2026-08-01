FROM node:18-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./

# Copy all packages (needed for workspace resolution)
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the api package and all its workspace dependencies
RUN pnpm --filter @healthsense/api... build

FROM node:18-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 healthsense

RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# Copy production artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

WORKDIR /app/packages/api

USER healthsense
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
