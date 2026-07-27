# Build from the monorepo root: docker build -f apps/web/Dockerfile .
#
# Adapted from the personaboard/viraltiktokslideshows web Dockerfiles —
# same stack and monorepo shape (pnpm workspaces, Next.js web app depending
# on packages/env + packages/ui + packages/config, no database dependency).
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# Copy workspace manifests + lockfile first for layer caching.
# packages/db is intentionally excluded — the web app has no database
# dependency.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json packages/config/
COPY packages/env/package.json packages/env/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/

# NEXT_PUBLIC_* vars get baked into the client bundle at build time —
# they MUST be passed as build args:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_SERVER_URL=https://api.example.com \
#     --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x... -t gfs-web .
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

ENV DOCKER_BUILD=1

RUN pnpm install --frozen-lockfile

# Source after install for better layer caching.
COPY packages/config/ packages/config/
COPY packages/env/ packages/env/
COPY packages/ui/ packages/ui/
COPY apps/web/ apps/web/

RUN pnpm --filter web build

# ---- Runner ----
FROM node:22-slim AS runner

WORKDIR /app

# DOCKER_BUILD=1 in the builder enables output: "standalone", which bundles
# the app into .next/standalone/apps/web/server.js — no node_modules needed.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
