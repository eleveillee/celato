# VS-000-SKE: The Walking Skeleton

## Status: ✅ Complete — WebSocket verified via wscat

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
- [x] API server starts and responds to health check (`GET /health`) — verified 2026-02-16
- [x] WebSocket endpoint accepts connections and exchanges messages — verified with wscat 2026-02-16
- [x] Message validation works (Zod schemas validate ack messages) — verified 2026-02-16
- [x] At least one test passes in each package (shared, api) — 8/8 pass
- [x] Development workflow documented (how to run mobile + API together)

**Note:** Mobile E2E deferred - Expo web has Metro bundler issue (Hermes engine incompatible with web). Core WebSocket functionality proven via direct testing. Mobile UI testing will happen organically in VS-1 with actual use cases.

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
- **pnpm workspaces** - Sharing types between packages worked flawlessly
- **Port 4000** - No conflicts, good choice to avoid common dev ports
- **Zod validation** - Caught type mismatches, prevents runtime errors
- **Structured logging** - JSON logs with context made debugging trivial
- **WebSocket reconnection** - Exponential backoff pattern implemented correctly
- **Error boundary** - Good safety net for React errors
- **Direct testing with wscat** - Bypassed UI issues, verified core functionality quickly

**What Didn't:**
- **Expo web support** - Metro bundler serves Hermes bundle (native-only) to web, causing MIME type errors
- **Background Expo start** - Interactive prompts block background execution, needs manual terminal
- **.env file** - Initial confusion about API_PORT value; clear documentation in .env.example resolved it

**Carry Forward to VS-1:**
- **Test core functionality directly first** - Don't rely solely on E2E UI tests for backend features
- **Expo web is optional** - Focus on native (iOS/Android) for mobile testing; web support is bonus
- **Document environment setup clearly** - .env.example with inline comments prevents confusion
- **Structured logging pays off** - JSON logs are easier to search than console.log strings
- **Port 4000 is clear** - Continue using for dev (no conflicts with 3000/8080/8081/etc.)

---

## Notes

> Scratchpad for thoughts, links, or context that doesn't fit elsewhere.
