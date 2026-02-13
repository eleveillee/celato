# Celato

A real-time collaborative voice agent for phone calls - the "Bionic Director" that lets you whisper instructions to an AI agent who negotiates on your behalf.

## Tech Stack

**Monorepo:** pnpm workspace (TypeScript)

| Component | Stack | Purpose |
|-----------|-------|---------|
| **Mobile App** | React Native (Expo) | VoIP dialer, Director UI |
| **API Orchestrator** | Node.js 22 + Fastify | Audio routing, session management, LLM context injection |
| **Shared** | TypeScript types | API contracts, shared utilities |
| **Telephony** | Retell AI | Phone calls, VAD, turn-taking |
| **Intelligence** | OpenAI Realtime API (GPT-4o) | Voice agent brain (audio-to-audio) |
| **Database** | Supabase (PostgreSQL) | User data, call logs, prompts |
| **Testing** | Vitest + Playwright | Unit + E2E testing |
| **Linting** | Biome | Fast linting + formatting |

## Commands

```bash
# Development
pnpm dev              # Start all packages in dev mode
pnpm dev:mobile       # Start Expo app only
pnpm dev:api          # Start API orchestrator only

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage

# Quality
pnpm check            # Lint + format check (CI)
pnpm check:fix        # Auto-fix lint/format issues
pnpm type-check       # TypeScript type checking

# Build
pnpm build            # Build all packages
```

## Architecture

**Three-Way Dynamic:**
- **User (Director)** - whispers private instructions via mobile app
- **Agent (Actor)** - negotiates with business, follows user's direction
- **Business (Third Party)** - only hears the agent, not the whispers

**Audio Routing:**
- Standard: User (muted) → Agent (active) ↔ Business
- Whisper: User (active) → Agent (active); Business (excluded)
- Passthrough: User (active) ↔ Business; Agent (silent)

**See `spec/architecture.md` for full technical architecture and `spec/celato/` for product vision.**

## Workflow
Celato progresses through **Vertical Slices (VS)** — complete, verifiable increments. See @spec/workflow.md for full details:
- **VS-0:** "The Walking Skeleton" — minimal runnable loop (monorepo + WebSocket connection)
- **Inline:** Tasks live in `spec/tracking/slices/vsN_name.md` under each feature. Start here.
- **Extracted:** When a feature outgrows inline (10+ tasks, needs design docs), extract to `spec/features/`.
  - Simple features → single file. Complex features → folder with `tasks.md` + `design.md`.
- **Feature specs own granular tasks. VS docs own delivery order.** As features extract,
  VS docs reference feature phases in build order, not individual tasks.

## Spec Lookup Table

| When you need to... | Read this |
|----------------------|-----------|
| Understand product vision & UX | @spec/celato/ (concept, ux_design, roadmap) |
| Write or review code | @spec/coding-standards.md |
| Understand tracking workflow | @spec/workflow.md |
| Define or consume an API | @spec/api-contracts.md |
| Understand architecture patterns | @spec/architecture.md |
| Check current project status | @spec/tracking/milestone.md |
| Check feature health & verification status | @spec/tracking/qa.md |
| Log or check bugs | @spec/tracking/bugs.md |
| Record a lesson learned | @spec/tracking/learnings.md |
| Make or review a decision | @spec/tracking/decisions.md |
| Check dependency versions | @spec/tracking/version-matrix.md |
| Track code quality debt | @spec/tracking/tech-debt.md |
| Browse future ideas | @spec/tracking/backlog.md |
| Check feature health & verification status | @spec/tracking/qa.md |

## ID Conventions
All tracking items use **3-letter mnemonic tags**: `[Type]-[Number]-[TAG]`. Examples: `VS-000-SKE` (Skeleton), `F-012-INV` (Inventory), `D-005-ARC` (Architecture), `B-003-LTO` (Login TimeOut). See `milestone.md` and `workflow.md` for full reference and tag conventions.

## Project-Specific Rules
- Product vision docs in `spec/celato/` are READ-ONLY reference material. Don't edit unless the product direction changes.
- Audio routing logic is critical - latency must stay under 1-2 seconds for whisper → agent → business loop.
- Cost optimization is a first-class concern. Document cost implications when adding LLM calls.
- Legal compliance: all agent interactions must announce AI identity at call start.

## Session Start (Every Session)
AI agents should do this at the start of every conversation:
1. Read this file and the spec lookup table above.
2. Check `spec/tracking/milestone.md` for current status and next steps.
3. Check `spec/tracking/qa.md` for feature verification status.
4. Check `spec/tracking/bugs.md` for known issues.
5. Check `spec/tracking/decisions.md` for open/blocking questions.
