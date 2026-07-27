# Build from the monorepo root: docker build -f apps/server/Dockerfile .
#
# Adapted from the personaboard/viraltiktokslideshows server Dockerfiles —
# same stack and monorepo shape (pnpm workspaces with the `catalog:` protocol,
# Bun runtime, Hono, Prisma 7 with @prisma/adapter-pg). Those repos already
# deployed this exact pattern and hit real errors along the way; this file
# carries those fixes forward even where the reasoning isn't obvious from
# this codebase alone.
FROM oven/bun:1

WORKDIR /app

# openssl/ca-certificates: Prisma's query engine + TLS to a managed Postgres.
# curl: fetches the pnpm standalone installer below.
# libatomic1: the pnpm standalone installer is a compiled glibc build that
# dynamically links libatomic, which isn't installed by default on this image
# ("libatomic.so.1: cannot open shared object file" otherwise).
RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates curl libatomic1 \
  && rm -rf /var/lib/apt/lists/*

# Bun is the runtime, but installs go through pnpm. pnpm-workspace.yaml uses
# the `catalog:` protocol for shared dependency versions, which `bun install`
# doesn't resolve the same way pnpm's workspace linker does.
#
# `bun install -g pnpm` runs pnpm's CLI under Bun's own JS engine, and pnpm
# 11's lockfile/store code imports `node:sqlite`, a Node built-in Bun doesn't
# implement ("error: No such built-in module: node:sqlite"). The standalone
# installer ships its own self-contained Node runtime, sidestepping Bun
# entirely for this one step.
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
# The installer's post-install step runs `pnpm setup`, which fails without a
# detectable shell in `docker build`'s /bin/sh -c (ERR_PNPM_UNKNOWN_SHELL).
ENV SHELL=/bin/bash
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=11.4.0 sh - \
  && pnpm --version

# Some platforms (Coolify and similar) inject NODE_ENV=production as a
# build-time variable; pnpm treats that as `--prod` and silently skips
# devDependencies — which would drop tsdown, typescript, and prisma, all
# needed below. Force it back until the runtime ENV near the bottom.
ENV NODE_ENV=development

# Manifests + lockfile first, for layer caching. apps/server needs
# @gamesforstrangers/env (runtime), @gamesforstrangers/config (tsconfig base),
# and @gamesforstrangers/db (Prisma client + schema) from packages/ — the web
# app is left out of this image on purpose.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/config/package.json packages/config/
COPY packages/env/package.json packages/env/
COPY packages/db/package.json packages/db/
COPY apps/server/package.json apps/server/

# packages/db/package.json has "postinstall": "prisma generate", which pnpm
# runs automatically during `pnpm install` below — before the "source after
# install" copy would otherwise land the schema. Without the schema present
# at install time, that postinstall fails with "Could not find Prisma Schema"
# and takes the whole install down with it.
COPY packages/db/prisma.config.ts packages/db/
COPY packages/db/prisma/ packages/db/prisma/

# prisma.config.ts reads DATABASE_URL through prisma/config's `env()` helper,
# which throws if the variable is missing entirely — so even `prisma
# generate`, which never touches a real database, fails at build time without
# *something* set here. Pass the real value at container start; this
# build-time default is a dummy.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm install --frozen-lockfile

# Source after install for better layer caching.
COPY packages/config/ packages/config/
COPY packages/env/ packages/env/
COPY packages/db/ packages/db/
COPY apps/server/ apps/server/

RUN pnpm --filter @gamesforstrangers/db db:generate
RUN pnpm --filter server build

ENV NODE_ENV=production
ENV PORT=3002
ENV CORS_ORIGIN=http://localhost:3001
EXPOSE 3002

WORKDIR /app/apps/server

# `prisma migrate deploy` (not the package.json "db:migrate" script, which is
# "prisma migrate dev" — interactive and dev-only, unsuitable here) applies
# any migrations in packages/db/prisma/migrations/ that haven't been recorded
# as applied yet, before the server starts taking traffic.
#
# This runs at container *startup*, not build time, on purpose: it needs the
# real DATABASE_URL (injected at runtime, not the placeholder above) and
# needs to be on the same network as the database, which only the running
# container is guaranteed to be.
#
# `exec` replaces the shell with the bun process so it keeps receiving
# signals (e.g. SIGTERM) directly for a clean shutdown, instead of going to
# the shell.
CMD ["sh", "-c", "cd /app/packages/db && pnpm exec prisma migrate deploy && pnpm db:seed && cd /app/apps/server && exec bun run dist/index.mjs"]
