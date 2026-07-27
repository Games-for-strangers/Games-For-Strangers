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
| `play/where-is-this/page.tsx` | ❌ Missing |
| Location images in `public/images/locations/` | ❌ Missing (25 referenced, 0 files) |
| Identity picker UI (avatar grid, settings gear) | ❌ Missing |
| Guess input + result display components | ❌ Missing |
| Scoreboard UI (round-end overlay) | ❌ Missing |
| Daily leaderboard UI | ❌ Missing |
| Homepage dynamic player count | ❌ Missing |
| Native game screens | ❌ Missing (boilerplate only) |
| Rate limiting (Redis/Upstash) | ❌ Missing |
| API routes (`/api/games`, `/api/scores`) | ❌ Missing |
| Deploy config (Vercel, Railway) | ❌ Missing |
| Analytics (Plausible) | ❌ Missing |

---

## Tier 1: Core Game Loop (Functional, Playable Locally)

*Can be played start-to-finish on localhost. No user input required.*

### 1.1 — Game page scaffold
- Create `apps/web/src/app/play/where-is-this/page.tsx`
- Client component, connects socket on mount, fetches anonymous identity
- Shows: Street View image, guess input, timer bar, player count

### 1.2 — Street View image display
- Image takes ~70% of viewport height, centered, `object-fit: cover`
- Loads `imageUrl` from `new-round` socket event
- Placeholder/skeleton while loading

### 1.3 — Guess input
- Single text input: "Where is this?" placeholder
- Submit on Enter, calls `submitGuess(roundId, guess)`
- Disabled after guessing or when round ends
- Case-insensitive comparison (server-side already handles this)

### 1.4 — Source 25 placeholder location images
- Download or generate 25 placeholder images named to match `locations.json` URLs
- Place in `apps/web/public/images/locations/`
- Images can be low-res Unsplash downloads or colored placeholder SVGs with country name (replace later)

### 1.5 — Player count display
- Display `🟢 {count} online` from `player-count` socket event
- Top bar next to game title

### 1.6 — Timer bar integration
- Wire existing `TimerBar` component to `endTime` from `new-round` event
- Show countdown below guess input

### 1.7 — Round-end result overlay
- On `round-end` event, show overlay/modal
- Display: winner animal, answer, city, landmark, fun fact
- 10-second countdown before next round auto-starts (server already handles this)

---

## Tier 2: Identity & Feedback (Visible Progress)

*Makes the game feel complete. No user input required.*

### 2.1 — Anonymous identity display
- Show current player's animal + color dot in top bar
- Persist across sessions (already done in `use-anonymous-identity.ts`)

### 2.2 — Identity picker
- Settings gear icon opens a small popover/drawer
- 20-animal grid to pick from
- Color swatches to pick from
- Saves to localStorage immediately

### 2.3 — Guess result feedback
- On `guess-result` event (emitted per-player, blurred for others):
  - Your own guess: flash green (correct) or red (incorrect)
  - Others' guesses: show `"{animal} guessed"` without revealing answer
- Animated toast or inline banner

### 2.4 — Winner announcement strip
- Bottom strip: recent correct guesses scroll by
- `"{animal} guessed {country} in {time}s"`
- Fade in/out animation

### 2.5 — Mobile responsive game page
- Image scales for mobile viewport
- Input and timer stack vertically below image
- Touch-friendly input sizing

### 2.6 — Loading/waiting states
- Skeleton for image loading
- "Waiting for next round..." state when joining mid-round
- "Connecting..." overlay before socket connects

---

## Tier 3: Richness & Scaling (Feature Complete)

*Leaderboards, homepage stats, native support, rate limiting. No user input required.*

### 3.1 — Daily leaderboard on game page
- Show top 10 daily scores (from `DailyScore` model, already tracked server-side)
- Fetched via socket event or simple GET request
- Display in a sidebar or bottom panel

### 3.2 — Homepage dynamic player count
- Fetch global active player count on homepage load
- Show under each game card, e.g. "🟢 12 playing now"

### 3.3 — Avatar picker on homepage
- First visit: show a quick avatar selection prompt
- "You are 🦊 — pick your animal" on homepage

### 3.4 — Rate limiting (Redis/Upstash)
- Set up Upstash Redis (free tier)
- Rate limit guess submissions: 1 guess per round per player (server-side already enforces via in-memory check, but add true rate limiting)
- 10 requests/second per IP on guess endpoint

### 3.5 — API routes (Hono server)
- `GET /api/games` — list games + active player counts
- `GET /api/games/:slug` — single game details
- `GET /api/scores/daily?game=where-is-this` — leaderboard

### 3.6 — Native game screen (Expo)
- Create `apps/native/app/play/where-is-this.tsx`
- Port the game screen to React Native
- Use HeroUI Native components + Uniwind styling
- Socket.IO client for native

### 3.7 — Persistent connection for idle players
- Socket stays connected on homepage to show real-time counts
- Reconnect on network loss with exponential backoff

---

## Tier 4: Deployment & Content Scale (Needs Your Input)

*Requires you to source images and make deploy decisions.*

### 4.1 — 200-image location pool
- Source ~175 more images (Unsplash, Pexels, or AI-generated street scenes)
- Add entries to `packages/db/src/locations.json` with country, city, landmark, region, funFact
- Name files to match URLs in `locations.json`
- Place in `apps/web/public/images/locations/`

### 4.2 — Vercel deployment (Next.js)
- Connect repo to Vercel
- Set `NEXT_PUBLIC_SERVER_URL` env var to production Server URL
- Configure custom domain: `gamesforstrangers.lol`

### 4.3 — Railway deployment (Socket.IO server)
- Deploy Hono server on Railway
- Set `DATABASE_URL`, `CORS_ORIGIN` env vars
- Add health check endpoint (already exists at `/api/health`)

### 4.4 — Production database
- Provision Railway Postgres (or Neon free tier)
- Run `pnpm db:push` against production DB
- Run `pnpm db:seed`

### 4.5 — Plausible analytics
- Sign up for Plausible (plausible.io)
- Add script tag to root layout
- Configure custom domain

### 4.6 — Error tracking (optional)
- Add Sentry or a simple error boundary
- Catch and log socket errors gracefully

---

## Tier 5: Launch & Beyond (Your Call)

*Marketing, content decisions, and future planning — you drive these.*

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
- Monitior real traffic patterns
- Adjust Upstash rate limits based on usage

### 5.7 — Future game planning
- Design doc for "The Fading Light", "Shared Word Racer", etc.
- Reusable game template structure in the monorepo

---

## Dependency Map

```
Tier 1 ─────────────────────────────────────────────────
  1.1 Game page scaffold ─── depends on ─── socket hook, identity hook
  1.2 Image display ──────── depends on ─── 4 (images in public/)
  1.3 Guess input ────────── depends on ─── 1.1
  1.4 Location images ────── depends on ─── nothing (you provide 25 starting images)
  1.5 Player count ───────── depends on ─── 1.1, socket hook
  1.6 Timer bar ──────────── depends on ─── 1.1, TimerBar component
  1.7 Round-end overlay ──── depends on ─── 1.1, socket round-end event

Tier 2 ─────────────────────────────────────────────────
  2.1 Identity display ───── depends on ─── 1.1, identity hook
  2.2 Identity picker ────── depends on ─── 2.1
  2.3 Guess feedback ─────── depends on ─── 1.3, socket guess-result event
  2.4 Winner strip ───────── depends on ─── 1.7, 2.3
  2.5 Mobile responsive ──── depends on ─── 1.1-1.7
  2.6 Loading states ─────── depends on ─── 1.1-1.7

Tier 3 ─────────────────────────────────────────────────
  3.1 Daily leaderboard ──── depends on ─── server-side scoring (done), 3.5
  3.2 Homepage player count ─ depends on ─── server socket, 3.5
  3.3 Avatar picker (home) ─ depends on ─── 2.2
  3.4 Rate limiting ──────── depends on ─── Redis/Upstash setup
  3.5 API routes ─────────── depends on ─── server entry (done)
  3.6 Native game screen ─── depends on ─── 1.1-1.7 (port to RN)
  3.7 Persistent socket ──── depends on ─── socket hook

Tier 4 ─────────────────────────────────────────────────
  4.1 200-image pool ─────── depends on ─── YOU sourcing images
  4.2 Vercel deploy ──────── depends on ─── YOU connecting repo
  4.3 Railway deploy ─────── depends on ─── YOU creating Railway project
  4.4 Production DB ──────── depends on ─── 4.2, 4.3
  4.5 Plausible ──────────── depends on ─── YOU signing up
  4.6 Error tracking ─────── depends on ─── optional

Tier 5 ─────────────────────────────────────────────────
  5.1 Privacy page ───────── depends on ─── YOUR content approval
  5.2 Ko-fi ──────────────── depends on ─── YOUR Ko-fi account
  5.3 Image attribution ──── depends on ─── 4.1, YOUR source tracking
  5.4 Launch prep ────────── depends on ─── 4.2, 4.3
  5.5 SEO/social ─────────── depends on ─── YOUR content decisions
  5.6 Rate tuning ────────── depends on ─── 3.4, live traffic
  5.7 Future games ───────── depends on ─── YOUR roadmap decisions
```
