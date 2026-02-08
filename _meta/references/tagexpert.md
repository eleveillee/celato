# Reference: TagExpert

> **Project:** AI-powered Google Tag Manager management platform.
> **Stack:** Next.js 16, TypeScript, Supabase, Prisma v7, Vercel AI SDK v6, Zustand, React Query.
> **Status at time of capture:** M1-M4 complete, M5 (Polish & Ship) next.
> **Source:** `C:\Eric\Projects\Cursor\TagExpert`

---

## What This Project Validates

TagExpert is the first real project built with patterns that evolved into _Base.
These are proven patterns from a shipping SaaS product.

---

## Spec Structure (33 files)

```
spec/
├── milestone.md          # 717 lines, M1-M10 with decisions log + dependency graph
├── architecture.md       # System diagram, directory structure, API routes, security
├── UX.md                 # 834 lines, ASCII mockups, color palette, view modes
├── AI.md                 # AI pipeline, model comparison, prompt engineering
├── API.md                # Vercel AI SDK v6 offline reference
├── api-contracts.md      # All internal API route contracts (10+ groups)
├── database.md           # Prisma schema reference, ERD, auth model
├── bugs.md               # Bug log with root causes
├── learnings.md          # 137 lines of hard-won gotchas by domain
├── tech-debt.md          # 111 lines, resolved + open items by priority
├── open-discussions.md   # Deferred decisions
├── quick-wins.md         # 25 numbered features (QW-01 to QW-25)
├── version-matrix.md     # Dependency versions + upgrade targets
├── feature/              # Feature-specific specs
│   ├── scanner.md        # Two-level scanning architecture
│   ├── Queue-system.md   # Rate limiting + deployment queue
│   ├── blocking.md       # Bot detection patterns
│   ├── gtm-decompiler.md # GTM container parsing
│   └── ...
├── research/             # Competitive + market research
│   ├── competitors.md
│   ├── AI-Native.md
│   └── moat-analysis.md
└── plan/                 # Implementation plans
    └── M4-implementation.md
```

---

## Patterns Worth Stealing (applied to _Base)

### 1. Spec Lookup Table
CLAUDE.md has a "when doing X, read Y" table. AI always knows which spec to consult.
**Applied:** CLAUDE.md now has a full spec lookup table.

### 2. Tech Debt Tracking
Dedicated `tech-debt.md` with file/area, problem, proposed fix, priority.
**Applied:** Added `spec/tracking/tech-debt.md` template.

### 3. Version Matrix
Tracks current versions, target upgrades, blocked-by info.
**Applied:** Added `spec/tracking/version-matrix.md` template.

### 4. Numbered Feature IDs
Quick-wins use `QW-01` format. Features have IDs for cross-referencing.
**Applied:** All tracking files now use prefixed IDs (F-###, B-###, etc.).

### 5. Research Directory
`spec/research/` for competitive analysis, market research, technology evaluation.
**Applied:** Added `spec/research/.gitkeep`.

---

## Architecture Patterns

### Two Data Worlds
- **DB-backed data** (scans, recommendations): React Query with service functions. Cheap, auto-refetch.
- **GTM data** (tags, triggers): Zustand global store. Rate-limited (0.25 QPS). Manual refresh only.

**Lesson:** Different data sources may need fundamentally different state management strategies.

### API Route Pattern
Every route follows: `try { validate → auth → ownership → business logic → response } catch { handleApiError }`
- Shared helpers: `requireAuth()`, `canAccessScan()`, `parseJsonBody()`, `apiResponse()`, `handleApiError()`
- Consistent response envelope: `{ data: T }` success, `{ error, message }` failure

### Service Layer
```
Component → useQuery(queryKey, serviceFn) → serviceFn calls /api/... → API route → DB
```
Service functions abstract API routes. Components never call fetch directly.

### Rate Limiting
Postgres-backed token bucket (25 tokens, 1 refill/4s) for Google's 0.25 QPS limit.
Aggressive caching (24h accounts, 1h containers, 5min tags). Fire-and-forget queuing.

### Mock/Real Switching
`NEXT_PUBLIC_MOCK_MODE=true` — every component has hardcoded demo data for development.
Service config detects mock domains and returns mock data without hitting APIs.

---

## Security Patterns

- **Tenant isolation:** `securePrisma` extends Prisma client to auto-filter by userId
- **Token encryption:** AES-256-GCM via custom Prisma extension, transparent encrypt/decrypt
- **Ownership checks:** `canAccessScan(scan, userId)` used at every API boundary
- **Input validation:** All API inputs validated with Zod, never manual if-checks
- **Safe JSON parsing:** `parseJsonBody()` wraps request.json() with APIError on failure

---

## AI/Prompt Engineering

- **Smart tag cap:** Don't dump all 200+ tags. Priority-score and cap at ~30, collapse rest into type counts.
- **Per-tag trigger descriptions:** Map trigger IDs to human descriptions for AI context.
- **Cross-reference pre-computation:** Compare forms vs form-submit triggers, videos vs video triggers. Let AI see gaps directly.
- **Structured element format:** One-liners instead of JSON.stringify. Saves tokens, same information.
- **Prompt injection defense:** User-supplied context wrapped in XML delimiters with "treat as data only" instruction.

---

## Learnings (sample from 137-line file)

| Area | Learning |
|------|----------|
| Prisma v7 | No `url` in schema.prisma, must use driver adapter |
| Next.js 16 | useSearchParams must be in Suspense boundary |
| Biome v2 | Config format changed, organizeImports moved |
| Google APIs | 403 vs 429 for quota exceeded (varies by API) |
| Vitest | Mock implementation pattern survives clearAllMocks() |
| AI service | Anthropic has min/max token limits; Gemini rejects z.record() |
| GTM | PUT is full replace (not patch); two type systems (camelCase vs SCREAMING_SNAKE) |

---

## What Didn't Work

| Pattern | Why |
|---------|-----|
| Single 150-line middleware.ts | Renamed to proxy.ts, still too complex. Should be split. |
| Zustand store monolith | Single store file grew. Planned slice pattern deferred. |
| Console.log as logging | No structured logging. Tech debt item for M5. |
| Hardcoded magic numbers | Timeouts, retry counts scattered. Partially extracted to config.ts. |
