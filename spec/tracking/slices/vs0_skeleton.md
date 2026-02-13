# VS-000-SKE: The Walking Skeleton

## Status: ⚪ Needs Verification

## Philosophy

The Walking Skeleton is **not** scaffolding, boilerplate, or setup. It's the simplest version
of your product that runs end-to-end. It proves the tech stack works and establishes your
development loop.

**Examples:**
- **Game**: Player spawns and can move in an empty world
- **Dashboard**: Shows one metric from hardcoded data, renders correctly
- **API**: One endpoint returns "Hello World" with proper authentication
- **CLI Tool**: Accepts one command, processes it, prints output

**What to defer:**
- Polish, UI/UX refinement
- Error handling beyond basic validation
- Optimization, caching, performance tuning
- Edge cases and comprehensive testing (beyond smoke tests)
- Architecture that isn't needed yet

---

## Goal

Mobile app connects to API orchestrator via WebSocket and receives a health status message. Proves the monorepo setup, TypeScript compilation, and basic client-server communication works.

---

## Success Criteria

The Walking Skeleton is DONE when:
- [x] Monorepo builds without errors (`pnpm install`, `pnpm build`)
- [ ] API server starts and responds to health check (`GET /health`)
- [ ] Mobile app launches in Expo and displays the Celato title screen
- [ ] Mobile app can connect to API via WebSocket and receive a message
- [ ] At least one test passes in each package (shared, api)
- [ ] Development workflow documented (how to run mobile + API together)

---

## Blocking Decisions

_Blocking decisions:_ None — defer architecture until proven necessary. Start with basic WebSocket; add Retell and OpenAI in later slices.

---

## Features (Inline Tasks)

### F-001-MON: Monorepo Setup ✅
Set up pnpm workspace with shared types, API, and mobile packages.

- [x] Root package.json with workspace scripts
- [x] TypeScript config (tsconfig.base.json + per-package configs)
- [x] Biome linting and formatting config
- [x] Vitest test configuration
- [x] Create packages: shared, api, mobile
- [x] Add sample test in shared package (6 tests)
- [x] Add sample test in API package (2 tests)
- [x] Verify all packages build successfully

### F-002-API: Basic API Server ✅
Fastify server with health check and WebSocket endpoint.

- [x] Fastify server setup with logging (pino)
- [x] Health check endpoint (`GET /health`)
- [x] WebSocket endpoint (`/ws`) with basic ack response
- [x] Environment variable loading (`.env`)
- [x] Test: health check returns 200
- [x] Test: WebSocket connection succeeds

### F-003-APP: Mobile App Shell ✅
React Native (Expo) app that displays Celato title and connects to API.

- [x] Expo app.json configuration
- [x] Basic App.tsx with Celato title screen
- [x] WebSocket client hook (useWebSocket)
- [x] Display connection status on screen with color-coded dot
- [x] Send test message button when connected
- [x] Display last received message

---

## Technical Scope

> **Keep this minimal.** Only include what's required for the walking skeleton to run.

### What's In Scope
- [x] Monorepo structure (pnpm workspaces)
- [x] Basic API server (Fastify + WebSocket)
- [x] Mobile app shell (Expo + React Native)
- [x] Shared types package
- [ ] Client-server WebSocket connection
- [ ] Smoke tests for API health check and WebSocket

### What's Out of Scope (Defer to Later Slices)
- Retell AI integration (VS-1)
- OpenAI Realtime API (VS-1)
- Audio handling and routing (VS-1)
- Whisper button and controls (VS-1)
- Call transcripts and logging (VS-2)
- Authentication and user management (VS-2)
- Database (Supabase) integration (VS-2)

---

## Dependencies

> External libraries, APIs, or services needed for VS-0.

| Dependency | Purpose | Version | Notes |
|------------|---------|---------|-------|
| Fastify | Lightweight API server | ^5.2.0 | Low overhead for WebSocket |
| @fastify/websocket | WebSocket support | ^11.0.1 | Built on ws library |
| Expo | React Native development | ^52.0 | Latest stable |
| pino | Structured logging | ^9.6.0 | Fast JSON logger |
| Zod | Schema validation | ^3.24.1 | Used in shared types |

---

## Architecture Notes

> Only document architecture decisions that are needed for VS-0.
> Don't design the full system architecture — that emerges over time.

**Tech Stack:**
- TypeScript 5.8+ (strict mode, erasableSyntaxOnly)
- Node.js 22 LTS (native TypeScript support)
- pnpm workspaces (monorepo)
- Fastify (API server)
- React Native + Expo (mobile app)

**Structure:**
```
celato/
├── packages/
│   ├── shared/          # Shared types and contracts
│   │   └── src/
│   │       ├── index.ts
│   │       └── types/
│   ├── api/             # Fastify WebSocket server
│   │   └── src/
│   │       └── index.ts
│   └── mobile/          # React Native (Expo) app
│       ├── App.tsx
│       └── app.json
└── spec/                # Tracking and documentation
```

**Key Decisions:**
- **Monorepo with pnpm:** Shared types avoid duplication, workspace protocol keeps packages in sync
- **Fastify over Express:** Lower overhead for WebSocket-heavy workload, better TypeScript support
- **Expo over bare React Native:** Faster iteration, easier testing, can eject later if needed
- **No database yet:** Defer Supabase to VS-2; focus on communication loop first

---

## VS-000-SKE Transition Checklist

Complete this checklist before moving to VS-001:

- [ ] All features in VS-000-SKE are ✅ or explicitly deferred with rationale
- [ ] The walking skeleton runs without errors
- [ ] At least one smoke test passes
- [ ] Success criteria above are all checked
- [ ] Blocking decisions resolved (see above)
- [ ] Update `spec/tracking/milestone.md` index to mark VS-000-SKE complete
- [ ] Plan and document VS-001 focus (with 3-letter tag) before starting work

---

## Lessons Learned

> After completing VS-0, capture what worked, what didn't, and what to do differently.

**What Worked:**
- [REPLACE after completion]

**What Didn't:**
- [REPLACE after completion]

**Carry Forward to VS-1:**
- [REPLACE: Insights to apply to the next slice]

---

## Notes

> Scratchpad for thoughts, links, or context that doesn't fit elsewhere.
