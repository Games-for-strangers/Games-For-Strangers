# gamesforstrangers

pnpm monorepo (Turborepo). Stack: Next.js 16 (web), Hono (server), Expo 57 (native). Bun runtime. Postgres + Prisma 7. Socket.IO for real-time game loop.

## Quick start

```sh
pnpm install
# postinstall auto-runs prisma generate (needs DATABASE_URL — see .env)
pnpm db:push      # push Prisma schema to DB
pnpm db:seed      # seed game locations
pnpm dev:web      # next dev --port 3001
pnpm dev:server   # bun run --hot src/index.ts (port 3002)
pnpm dev:native   # expo start --clear
pnpm check-types  # tsc -b across all packages
```

## Required env files

| File | Key vars |
|------|----------|
| `apps/server/.env` | `DATABASE_URL`, `CORS_ORIGIN=http://localhost:3001` |
| `apps/web/.env` | `NEXT_PUBLIC_SERVER_URL=http://localhost:3002` |
| `apps/native/.env` | `EXPO_PUBLIC_SERVER_URL=http://<local-ip>:3002` |

## Architecture

- **`apps/web/`** — Next.js 16, port 3001, RSC, shadcn/ui components from `@gamesforstrangers/ui`.
- **`apps/server/`** — Hono HTTP server + Socket.IO. Entry: `src/index.ts`. Dev: `bun run --hot`. Build: `tsdown` → ESM in `dist/`. Compile to binary: `bun build --compile`.
- **`apps/native/`** — Expo 57, Expo Router, HeroUI Native + Uniwind (Tailwind for RN). Dev: `expo start --clear`.
- **`packages/config/`** — Shared tsconfig base (`tsconfig.base.json`). Sets `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `types: ["bun"]`.
- **`packages/db/`** — Prisma 7 client. Schema in `prisma/schema/schema.prisma`. Client output to `prisma/generated/`. Uses `@prisma/adapter-pg`. Prisma config (`prisma.config.ts`) loads env from `../../apps/server/.env`.
- **`packages/env/`** — t3-oss/env env validation. Exports `/server`, `/web`, `/native` subpaths.
- **`packages/ui/`** — shadcn/ui base-lyra components, Tailwind v4, shared React components/hooks.

## Game loop

Single game "GeoGuesser Race" — 60s rounds guessing country from Street View image. Players join via Socket.IO `join-game`, submit `guess-submit`. Server cycles rounds globally per connected room. Scores tracked via Prisma `DailyScore`.

## TypeScript

- `verbatimModuleSyntax: true` — must use `import type` for type-only imports.
- `noUnusedLocals`, `noUnusedParameters` — both on. Remove unused code.
- TypeScript 6 (unstable). `@types/bun` available globally.
- No `any` or `as` casts without strong reason (team convention).
- `@gamesforstrangers/ui/*` path alias in `apps/web/tsconfig.json` for local imports.

## Prisma

```sh
pnpm db:push       # prisma db push
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
pnpm db:studio     # prisma studio
pnpm db:seed       # bun run src/seed.ts
```

All filtered to `@gamesforstrangers/db` via turbo. `postinstall` auto-generates client on `pnpm install`.

## Notable config

- `.npmrc` → `node-linker=isolated` (pnpm uses isolated symlink layout).
- `pnpm-workspace.yaml` has `allowBuilds: [esbuild, sharp, prisma, @prisma/engines]`.
- Turbo outputs: `dist/**`, `.next/**` (cache excluded). `dev` tasks are persistent + uncached.
- Server build (`tsdown`) uses `noExternal: [/@gamesforstrangers\/.*/]` — workspace packages bundled.
