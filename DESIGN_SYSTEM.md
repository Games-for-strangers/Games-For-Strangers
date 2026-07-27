# Games for Strangers — Design System

> A dark cosmic multiplayer arcade with the visual polish of a modern gaming platform, the softness of a social app, and the simplicity of a minimalist web experiment.

---

## 1. Product Personality

The interface should feel like you accidentally discovered a secret multiplayer arcade floating somewhere on the internet.

**Do feel like:**
- Anonymous, playful, mysterious, immediate, social, premium, slightly weird, technologically modern, inviting

**Do not feel like:**
- Corporate SaaS dashboard, traditional gaming platform, gambling website, crypto/Web3 product, children's game, generic dark-mode template

**Design language summary:**

| Attribute | Manifestation |
|-----------|---------------|
| Cosmic | Deep navy backgrounds creating infinite digital space |
| Electric | Purple, blue, cyan, pink, green as accent energy |
| Soft | Large radii, blurred glows, subtle gradients, low-contrast borders |
| Playful | Animal avatars, friendly microcopy, unexpected animations |
| Anonymous | No usernames, no profile photos, no identity pressure |
| Focused | One primary action per screen |

---

## 2. Color System

Every color must map to a semantic token. No arbitrary hex values outside the token system.

### 2.1 Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-violet` | `#8B5CF6` | Primary buttons, active states, links, highlights |
| `brand-blue` | `#3B82F6` | Links, information, player count, secondary elements |
| `brand-cyan` | `#22D3EE` | Realtime states, connection indicators, presence |
| `brand-pink` | `#EC4899` | Winner moments, celebratory effects (sparingly) |
| `brand-green` | `#4ADE80` | Correct answers, success, online indicators |

### 2.2 Violet Scale

| Token | Hex |
|-------|-----|
| `violet-50` | `#F5F3FF` |
| `violet-100` | `#EDE9FE` |
| `violet-200` | `#DDD6FE` |
| `violet-300` | `#C4B5FD` |
| `violet-400` | `#A78BFA` |
| `violet-500` | `#8B5CF6` |
| `violet-600` | `#7C3AED` |
| `violet-700` | `#6D28D9` |
| `violet-800` | `#5B21B6` |
| `violet-900` | `#4C1D95` |

### 2.3 Background System

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-canvas` | `#070B17` | Global page background |
| `bg-elevated` | `#0B1020` | Navigation, modals, secondary sections |
| `surface-base` | `#0F1528` | Cards, panels, game containers |
| `surface-elevated` | `#141B32` | Hovered cards, dropdowns, elevated controls |
| `surface-strong` | `#1A2340` | Active cards, focused components, prominent controls |

### 2.4 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#F8FAFC` | Headings, game titles, primary information |
| `text-secondary` | `#CBD5E1` | Descriptions, secondary information, supporting labels |
| `text-muted` | `#94A3B8` | Metadata, timestamps, hints, inactive navigation |
| `text-subtle` | `#64748B` | Rare — placeholder text, very low-priority info |

### 2.5 Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `border-default` | `#1E293B` | Default component borders |
| `border-strong` | `#334155` | Interactive elements, inputs |
| `border-accent` | `rgba(139, 92, 246, 0.45)` | Focused/prominent borders |
| `border-glow` | `rgba(139, 92, 246, 0.70)` | Hover glow borders |

### 2.6 Semantic Tokens

```ts
color.bg.canvas              #070B17
color.bg.elevated            #0B1020
color.surface.base           #0F1528
color.surface.elevated       #141B32
color.surface.strong         #1A2340

color.text.primary           #F8FAFC
color.text.secondary         #CBD5E1
color.text.muted             #94A3B8
color.text.subtle            #64748B

color.border.default         #1E293B
color.border.strong          #334155
color.border.accent          rgba(139, 92, 246, 0.45)

color.action.primary         #8B5CF6
color.action.primaryHover    #7C3AED

color.status.success         #4ADE80
color.status.error           #FB7185
color.status.warning         #FBBF24
color.status.info            #38BDF8

color.presence.online        #4ADE80
color.presence.offline       #64748B
```

---

## 3. Gradients

### Primary Gradient
```css
linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)
```
Primary CTA buttons, featured game cards, important highlights.

### Cosmic Gradient
```css
linear-gradient(135deg, #0F172A 0%, #17103A 45%, #0B1D3A 100%)
```
Page hero sections, game containers, empty states.

### Neon Game Gradient
```css
linear-gradient(135deg, rgba(139, 92, 246, 0.30), rgba(59, 130, 246, 0.12))
```
Subtle card backgrounds.

### Glow Shadows
```css
/* Default */
box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.12);

/* Hover */
box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.50), 0 0 60px rgba(139, 92, 246, 0.20);
```

---

## 4. Typography

### Font Stack
```
"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-xl` | 64px | 72px | 700 | Homepage hero |
| `display-lg` | 48px | 56px | 700 | Large game titles |
| `heading-xl` | 36px | 44px | 700 | Page titles |
| `heading-lg` | 30px | 38px | 700 | Section headings |
| `heading-md` | 24px | 32px | 700 | Card titles |
| `heading-sm` | 20px | 28px | 600 | Subsections |
| `body-lg` | 18px | 28px | 400 | Hero descriptions |
| `body-md` | 16px | 24px | 400 | Default body |
| `body-sm` | 14px | 20px | 400 | Metadata |
| `caption` | 12px | 16px | 500 | Labels |
| `micro` | 11px | 14px | 600 | Tiny metadata |

### Typography Rules

- **Headings:** `font-weight: 700`, `letter-spacing: -0.025em`
- **Body:** `font-weight: 400`, `letter-spacing: 0`
- **Labels:** `font-weight: 600`, `letter-spacing: 0.01em`
- Never use uppercase headings — the brand is friendly and conversational, not enterprise.

---

## 5. Spacing

Base unit: **4px**

| Token | Px |
|-------|-----|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-7` | 28px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-14` | 56px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |
| `space-32` | 128px |

### Card Internal Padding
- Small card: 16px
- Medium card: 24px
- Large card: 32px

### Page Horizontal Padding
- Mobile: 20px
- Tablet: 32px
- Desktop: 48px

### Section Spacing
- Mobile: 64px
- Desktop: 96px

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Subtle rounding |
| `radius-md` | 12px | Buttons |
| `radius-lg` | 16px | Inputs |
| `radius-xl` | 20px | Cards |
| `radius-2xl` | 24px | Game surfaces, large cards |
| `radius-3xl` | 32px | Hero containers |
| `radius-pill` | 9999px | Avatars, badges |

---

## 7. Shadows

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 2px 8px rgba(0,0,0,0.20)` |
| `shadow-md` | `0 8px 24px rgba(0,0,0,0.25)` |
| `shadow-lg` | `0 20px 60px rgba(0,0,0,0.30)` |
| `shadow-neon` | `0 0 40px rgba(139,92,246,0.15)` |

---

## 8. Motion

### Durations
| Token | Value |
|-------|-------|
| Instant | 100ms |
| Fast | 150ms |
| Normal | 250ms |
| Slow | 400ms |
| Ambient | 800ms+ |

### Easing
- **Default:** `cubic-bezier(0.2, 0.8, 0.2, 1)`
- **Entering:** `cubic-bezier(0.16, 1, 0.3, 1)`

---

## 9. Breakpoints

| Breakpoint | Width |
|------------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### Container Max-Width
```
1280px
```

---

## 10. Z-Index Scale

| Token | Value |
|-------|-------|
| `z-base` | 0 |
| `z-content` | 10 |
| `z-sticky` | 100 |
| `z-dropdown` | 200 |
| `z-overlay` | 300 |
| `z-modal` | 400 |
| `z-toast` | 500 |

---

## 11. Iconography

### Library
**Hugeicons** — exclusive icon library. Do not mix Lucide, Heroicons, Font Awesome, or Material Icons.

### Stroke Width
`1.8px` (default)

### Sizes
| Token | Size |
|-------|------|
| `icon-sm` | 16px |
| `icon-md` | 20px |
| `icon-lg` | 24px |
| `icon-xl` | 32px |

### Rules
- Icons must never be used as decoration without meaning
- Always have consistent visual weight
- Sit 8px from accompanying text
- Use `currentColor`
- Inherit semantic text colors

### Recommended Hugeicons
- **Navigation:** `Home01Icon`, `GameController03Icon`, `ArrowLeft01Icon`, `ArrowRight01Icon`
- **Game:** `PlayIcon`, `Timer01Icon`, `Trophy01Icon`, `Medal01Icon`, `RefreshIcon`
- **Social:** `UserGroupIcon`, `Wifi01Icon`, `SignalIcon`, `UserMultipleIcon`
- **Location:** `Globe02Icon`, `Compass01Icon`, `Map01Icon`, `Location01Icon`
- **Interface:** `Search01Icon`, `Settings01Icon`, `CheckmarkCircle02Icon`, `CancelCircleIcon`, `InformationCircleIcon`
- **Anonymous:** `SparklesIcon`, `MagicWand01Icon`

---

## 12. Buttons

### Primary Button
- Height: 48px
- Padding: 16px 20px
- Radius: 12px
- Background: `linear-gradient(135deg, #8B5CF6, #6366F1)`
- Text: `#FFFFFF`, 14px, 600 weight
- Hover: slight brightness increase

### Large CTA
- Height: 56px
- Padding: 20px 28px
- Font: 16px, 600 weight

### Secondary Button
- Background: `rgba(255,255,255,0.04)`
- Border: `rgba(255,255,255,0.10)`
- Hover: `rgba(255,255,255,0.08)`

### Ghost Button
- No background, used for navigation, subtle actions, dismiss controls

---

## 13. Inputs (Game Guess Input)

- Height: 60px
- Radius: 16px
- Background: `#0F1528`
- Border: `1px solid #334155`
- Placeholder: `#64748B`
- Focus: `border: #8B5CF6`, `box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12)`
- Desktop width: `min(600px, 100%)`

---

## 14. Game Cards

### Featured Card
- Width: 100%
- Min-height: 420px
- Border: `1px solid rgba(148, 163, 184, 0.12)`
- Hover border: `rgba(139, 92, 246, 0.50)`
- Hover: `transform: translateY(-4px)` over 250ms
- Artwork hover: `transform: scale(1.03)`

### Secondary Cards
- Min-height: 300px

### Card Background
- Base: `#0F1528`
- Hover: `#141B32`

---

## 15. Avatars

| Size | Token | Value |
|------|-------|-------|
| XS | `avatar-xs` | 24px |
| SM | `avatar-sm` | 32px |
| MD | `avatar-md` | 40px |
| LG | `avatar-lg` | 56px |
| XL | `avatar-xl` | 80px |

Animals: Fox, Frog, Raccoon, Panda, Koala, Owl, Octopus, Unicorn, Cat, Dog, Bear, Rabbit, Llama, Monkey, Penguin, Duck, Tiger, Lion, Hamster, Panda

---

## 16. Game Screen Layout

Visual hierarchy (priority order):
1. **GAME** — the image/activity itself
2. **PLAYERS** — presence of others
3. **ACTION** — guess input, timer
4. **SCORE** — points, leaderboard
5. **SECONDARY INFORMATION** — metadata, navigation

The interface should almost disappear while a round is active.

### Desktop Game Layout
```
┌──────────────────────────────────────────────────┐
│  ← Games for Strangers      ● 47 online    🦊 3 │
├──────────────────────────────────────────────────┤
│                                                  │
│                WHERE IS THIS?                    │
│                                                  │
│       ┌──────────────────────────────────┐       │
│       │                                  │       │
│       │          LOCATION IMAGE          │       │
│       │          (16:10, r24)            │       │
│       │                                  │       │
│       └──────────────────────────────────┘       │
│                                                  │
│                  42  seconds left                │
│                                                  │
│          ┌────────────────────────┐              │
│          │     Where is this?     │              │
│          └────────────────────────┘              │
│                                                  │
│  🦊 47 online       🐸 Someone guessed Japan     │
└──────────────────────────────────────────────────┘
```

---

## 17. Winner Announcement

```
       ROUND OVER

          🦊

      FOX GOT IT!

        Japan

       4.2 seconds

Then:

Next round in 7...
```

The announcement occupies the center of the screen with a fade-in backdrop.

---

## 18. Leaderboard

```
TODAY'S STRANGERS

🥇 🦊   12 points
🥈 🐸    9 points
🥉 🦝    7 points
You       4 points
```

No IDs, UUIDs, or database identifiers. Animal + color only.

---

## 19. Loading States

Never show a generic spinner alone. Always pair with a friendly message:

```
🌎 Finding a place...
🐸 Waiting for the next round...
```

Image placeholder: `#141B32` with animated shimmer gradient.

---

## 20. Empty States

```
        🦥

No strangers here yet.

Be the first one to play.

        [Play anyway]
```

Tone should be playful, not corporate. Never say "No data found."

---

## 21. Error States

```
        🐙

Oops. Something got tangled.

We couldn't connect to the game.

        [Try again]
```

Never expose technical errors to users.

---

## 22. Presence Indicator

```
● 47 strangers online
```

- Dot: 8px, `#4ADE80`
- Animation: subtle 2s pulse
- This is part of the product itself, not an afterthought

---

## 23. Component Naming

Use predictable names:

```
Button, IconButton, GameCard, GameGrid, GameHeader, GameArtwork,
PlayerAvatar, PlayerAvatarGroup, PlayerCount, AnimalPicker,
Timer, TimerBar, GuessInput, Leaderboard, LeaderboardRow,
WinnerAnnouncement, RoundStatus, PresenceIndicator,
EmptyState, ErrorState, LoadingState, Modal, Toast
```

### Component Variants

| Component | Variants |
|-----------|----------|
| Button | `primary`, `secondary`, `ghost`, `danger` + `sm`, `md`, `lg`, `xl` |
| GameCard | `featured`, `standard`, `coming-soon`, `compact` |
| Avatar | `xs`, `sm`, `md`, `lg`, `xl` |

---

## 24. Implementation Rules

1. **No new colors** without adding them to the design token system.
2. **No arbitrary border radii.** Use the radius scale.
3. **Hugeicons** is the only icon library.
4. **No usernames** displayed anywhere in the UI.
5. **Animal avatars** are the default identity primitive.
6. **One primary CTA** per screen.
7. **The current game** always has visual priority over secondary information.
8. **Avoid dashboard density** — this is an arcade, not an admin panel.
9. **Neon** is an accent, not the background.
10. **Animations** should reinforce realtime multiplayer interaction.
11. **Every interactive element** must have hover, focus, active, and disabled states.
12. **Every screen** must work on mobile first.

---

## 25. Anti-Patterns

Do not:
- Use emojis as UI icons (use Hugeicons instead)
- Display socket IDs, player IDs, or database identifiers
- Use uppercase headings
- Show generic spinners without context
- Put excessive UI over the game image
- Use black shadows that make cards look detached
- Mix icon libraries
- Add custom breakpoints unless necessary
- Show technical error messages
- Use dashboard density

---

## 26. CSS Variable Foundation

```css
:root {
  --color-bg-canvas: #070b17;
  --color-bg-elevated: #0b1020;
  --color-surface-base: #0f1528;
  --color-surface-elevated: #141b32;
  --color-surface-strong: #1a2340;

  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;

  --color-brand-violet: #8b5cf6;
  --color-brand-violet-hover: #7c3aed;
  --color-brand-blue: #3b82f6;
  --color-brand-cyan: #22d3ee;
  --color-brand-pink: #ec4899;
  --color-brand-green: #4ade80;

  --color-border-default: #1e293b;
  --color-border-strong: #334155;
  --color-border-accent: rgba(139, 92, 246, 0.45);

  --color-status-success: #4ade80;
  --color-status-error: #fb7185;
  --color-status-warning: #fbbf24;
  --color-status-info: #38bdf8;

  --color-presence-online: #4ade80;
  --color-presence-offline: #64748b;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-pill: 9999px;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.3);
  --shadow-neon: 0 0 40px rgba(139, 92, 246, 0.15);
}
```

---

## 27. File Architecture

```
src/
├── components/
│   ├── ui/           # Primitive: Button, Input, Card, Badge, Avatar
│   ├── game/         # Domain: GameCard, Timer, GuessInput, Leaderboard, WinnerAnnouncement
│   └── identity/     # Identity: AnimalAvatar, AnimalPicker, PlayerIdentity
├── design-system/    # Token exports for TS: colors.ts, typography.ts, icons.ts, etc.
├── app/              # Pages
└── lib/              # Utilities
```

---

## 28. Header

- Height: 72px
- Desktop: Logo | Games | About | [Animal Avatar]
- No login, signup, account, profile, or notifications
- The absence of those things is part of the product identity

### Logo
"Games for Strangers" wordmark — `font-weight: 700`, `letter-spacing: -0.04em`. Accent "Strangers" with the violet-to-blue gradient.
