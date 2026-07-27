# Build from the monorepo root: docker build -f apps/server/Dockerfile .
#
# Adapted from the personaboard/viraltiktokslideshows server Dockerfiles —
# same stack and monorepo shape (pnpm workspaces, Bun + tsdown, Prisma via
# @gamesforstrangers/db).
FROM oven/bun:1 AS builder

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install -y -qq --no-install-recommends \
      libatomic1 \
      && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests + lockfile first for layer caching.
# packages/db's schema is also needed because pnpm's postinstall script
# runs prisma generate.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json packages/config/
COPY packages/env/package.json packages/env/
COPY packages/db/package.json packages/db/
COPY packages/db/prisma/ packages/db/prisma/
COPY packages/db/prisma.config.ts packages/db/
COPY apps/server/package.json apps/server/

# DATABASE_URL is required for prisma generate even if the generated client
# is only used at runtime. Pass a dummy (non-)value during build if your
# CI/CD injects the real one via the build environment.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN bun install --frozen-lockfile

# Source after install for better layer caching.
COPY packages/config/ packages/config/
COPY packages/env/ packages/env/
COPY packages/db/ packages/db/
COPY apps/server/ apps/server/
COPY tsconfig.json ./

RUN bun run db:generate && \
    cd apps/server && \
    bun run build

# ---- Runner ----
FROM oven/bun:1 AS runner

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install -y -qq --no-install-recommends \
      ca-certificates \
      openssl \
      libatomic1 \
      && rm -rf /var/lib/apt/lists/*

# tsdown bundles @gamesforstrangers/* workspace packages, but @prisma/* and
# other externals need node_modules at runtime.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server/dist ./dist

ENV NODE_ENV=production
ENV PORT=3002
ENV CORS_ORIGIN=http://localhost:3001

EXPOSE 3002

CMD bunx prisma migrate deploy && bun run dist/index.mjs
