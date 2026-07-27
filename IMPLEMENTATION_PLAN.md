# Implementation Plan: "Where Is This?" (Geoguessr Race)

## Codebase Status

| Area | Status |
|------|--------|
| Monorepo scaffold (pnpm, turbo, Next.js 16, Hono, Expo 57) | ✅ Done |
| Prisma schema (Game, Round, Guess, DailyScore) | ✅ Done |
| DB seed script + 25 locations in `locations.json` | ✅ Done |
| Server: Hono HTTP + Socket.IO entry | ✅ Done |
| Server: RoundManager game loop (load rounds, cycle, score) | ✅ Done |
| Server: Socket event handlers | ✅ Done |
| Web: `use-socket` hook (connect, emit, listen) | ✅ Done |
| Web: `use-anonymous-identity` hook (20 animals, colors, localStorage) | ✅ Done |
| Web: Homepage with game cards | ✅ Done |
| Web: About page | ✅ Done |
| Web: Header + theme toggle | ✅ Done |
| Web: TimerBar component | ✅ Done |
| Web: Theme/shadcn/ui foundation | ✅ Done |
| Web: Game page (`play/where-is-this/page.tsx`) | ✅ Done |
| Web: StreetViewImage, GuessInput, GuessFeedback, WinnerStrip, RoundEndOverlay | ✅ Done |
| Web: IdentityDisplay + AvatarPicker | ✅ Done |
| Web: Loading screen component | ✅ Done |
| Web: Homepage dynamic player count + avatar picker | ✅ Done |
| Server: API routes (`/api/games`, `/api/scores`) | ✅ Done |
| Server: In-memory rate limiting middleware | ✅ Done |
| Server: Shared game state module | ✅ Done |
| DB: Seed URLs updated to picsum.photos | ✅ Done |
| Docker: Web Dockerfile + .dockerignore | ✅ Done |
| Docker: Server Dockerfile + .dockerignore | ✅ Done |
| Docker: docker-compose.yml (web + server + postgres) | ✅ Done |
| Native game screen | ❌ Missing |

---

## Tier 1: Core Game Loop (Functional, Playable Locally)

### 1.1 — Game page scaffold
- Create `apps/web/src/app/play/where-is-this/page.tsx`
- Client component, connects socket on mount, fetches anonymous identity
- Shows: Street View image, guess input, timer bar, player count

### 1.2 — Street View image display
- Image takes ~70% of viewport height, centered, `object-fit: cover`
- Loads `imageUrl` from `new-round` socket event
- Falls back to gradient with city/country name on error

### 1.3 — Guess input
- Single text input: "Where is this?" placeholder
- Submit on Enter, calls `submitGuess(roundId, guess)`
- Disabled after guessing or when round ends

### 1.4 — Location images (SKIPPED — using picsum.photos seeded URLs instead)
- Seed data URLs updated to `https://picsum.photos/seed/{slug}/800/600`
- StreetViewImage component falls back to gradient placeholder if image fails to load

### 1.5 — Player count display
- Display `🟢 {count} online` from `player-count` socket event
- Top bar next to game title

### 1.6 — Timer bar integration
- Wire existing `TimerBar` component to `endTime` from `new-round` event
- Shows countdown below guess input

### 1.7 — Round-end result overlay
- On `round-end` event, shows overlay with winner, answer, city, landmark, funFact
- Displays top 5 daily scores from the event data
- Auto-dismisses when next round starts (10s server cycle)

---

## Tier 2: Identity & Feedback

### 2.1 — Anonymous identity display
- Show current player's animal + color dot in top bar
- Persist across sessions (localStorage via `use-anonymous-identity`)

### 2.2 — Identity picker
- Settings gear icon opens dropdown popover
- 20-animal grid + 20 color swatches
- Saves to localStorage immediately

### 2.3 — Guess result feedback
- On `guess-result` event: correct → green, incorrect → red, others → blurred "{animal} guessed"
- Auto-dismisses after 3 seconds

### 2.4 — Winner announcement strip
- Bottom-fixed strip: "{animal} guessed {country} in {time}s"
- Shows most recent winner, auto-dismisses after 5s

### 2.5 — Mobile responsive game page
- Full-height flex layout, image fills available space
- Input and timer stack below image
- Uses Tailwind responsive classes throughout

### 2.6 — Loading/waiting states
- "Connecting to game..." before socket connects
- "Waiting for next round..." between rounds

---

## Tier 3: Richness & Scaling

### 3.1 — Daily leaderboard on game page
- Scores come from `round-end` socket event (server already tracks via DailyScore)
- Displayed in round-end overlay (top 5)

### 3.2 — Homepage dynamic player count
- Polls `GET /api/games` every 15 seconds
- Shows "🟢 {N} playing now" under game cards

### 3.3 — Avatar picker on homepage
- AvatarPicker component in homepage header
- Identity displayed with IdentityDisplay component

### 3.4 — Rate limiting (in-memory)
- `createRateLimiter(maxRequests, windowMs)` middleware
- Token bucket per IP, cleanup interval for stale entries
- Applied to API routes: 30 req/min per IP
- No Redis dependency — in-memory works for single-server self-hosting

### 3.5 — API routes
- `GET /api/games` — all games with active player counts
- `GET /api/games/:slug` — single game details
- `GET /api/scores/daily?game={slug}` — top 10 daily scores

### 3.6 — Native game screen (Expo)
- Not yet implemented — needs port of game components to React Native

### 3.7 — Persistent connection
- Socket.io client handles reconnection internally (built-in)
- Homepage polls API for player counts (no separate socket needed)

---

## Tier 4: Deployment & Content Scale (Needs Your Input)

### 4.1 — 200-image location pool
- Source ~175 more images (Unsplash, Pexels, or AI-generated street scenes)
- Add entries to `packages/db/src/locations.json`
- Replace or supplement picsum.photos seed URLs with real image URLs

### 4.2 — Self-hosted deployment (Docker)
- `docker-compose up --build` starts web (port 3001) + server (port 3002) + PostgreSQL
- Web multi-stage Dockerfile with Next.js standalone output
- Server multi-stage Dockerfile with tsdown build on Bun
- `.dockerignore` files for both apps

### 4.3 — Production database setup
- Database persists via named Docker volume (`pgdata`)
- Run `docker compose exec server bun run prisma db push` after first deploy
- Run `docker compose exec server bun run prisma db seed`

### 4.4 — Custom domain & reverse proxy
- Point `gamesforstrangers.lol` to your VPS
- Use Caddy or Nginx as reverse proxy in front of Docker
- Set `CORS_ORIGIN` and `NEXT_PUBLIC_SERVER_URL` accordingly

### 4.5 — Plausible analytics
- Self-host Plausible or use Plausible Cloud
- Add script tag to root layout

### 4.6 — Error tracking (optional)
- Add Sentry or a simple error boundary
- Catch and log socket errors gracefully

---

## Tier 5: Launch & Beyond (Your Call)

### 5.1 — Privacy policy page
- One-sentence policy: "We don't collect anything."
- Static page at `/privacy`

### 5.2 — Ko-fi donation integration
- Verify Ko-fi link works in footer + about page
- Consider adding a Ko-fi widget/button on the game page

### 5.3 — Image attribution
- Add attribution for sourced images (if using Unsplash, Pexels, etc.)
- Credits page or footer line

### 5.4 — Launch prep
- Draft r/InternetIsBeautiful post
- Draft r/geoguessr crosspost
- Draft r/webgames crosspost
- Screenshot/gif capture of game flow

### 5.5 — SEO & social
- Open Graph meta tags (already partially set)
- Twitter card meta tags
- Favicon + social preview image

### 5.6 — Rate limiting tuning
- Monitor real traffic patterns
- Adjust rate limits based on usage

### 5.7 — Future game planning
- Design doc for "The Fading Light", "Shared Word Racer", etc.
- Reusable game template structure in the monorepo

---

## Docker Quick Start

```sh
# Build and start all services
docker compose up --build

# Push DB schema + seed data (first time only)
docker compose exec server bunx prisma db push --schema=../packages/db/prisma/schema
docker compose exec server bunx prisma db seed

# Access
# Web: http://localhost:3001
# Server: http://localhost:3002
```
