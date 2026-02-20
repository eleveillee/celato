# Milestones: Vertical Slice Index

> **Vertical Slice Philosophy:** Each milestone (VS-#) is a complete, verifiable increment of the project.
> VS-0 is the "Walking Skeleton" — a minimal, runnable loop. Subsequent slices can be features OR foundational work.
>
> **Start inline.** Tasks live under each feature heading within the VS document.
> **Extract when needed.** When a feature outgrows inline (10+ tasks, needs design docs),
> move it to `spec/features/`. See `spec/workflow.md` for extraction steps.

---

## ID Conventions

All items use **3-letter mnemonic tags** for human-readable IDs: `[Type]-[Number]-[TAG]`

- **VS-###-TAG** — Vertical Slices (e.g., `VS-000-SKE` for Skeleton)
- **F-###-TAG** — Features (e.g., `F-001-AUT` for Authentication)
- **B-###-TAG** — Bugs (e.g., `B-003-LTO` for Login TimeOut)
- **L-###-TAG** — Learnings (e.g., `L-012-PRS` for Prisma gotcha)
- **D-###-TAG** — Decisions (e.g., `D-005-ARC` for Architecture)
- **BL-###-TAG** — Backlog items (e.g., `BL-008-DRK` for Dark mode)
- **TD-###-TAG** — Tech debt (e.g., `TD-002-TMO` for Timeout hardcoded)
- **UP-###-TAG** — Upgrade plan items (e.g., `UP-001-R19` for React 19)

Reference format: `See D-003-ARC` or `Blocked by B-012-LTO`. AIs should use full IDs when linking.

---

## Vertical Slice Index

| ID | Focus | Status | Documents |
|:---|:------|:-------|:----------|
| **VS-000-SKE** | **The Walking Skeleton** | ✅ Complete | [→ spec](slices/vs0_skeleton.md) |
| **VS-001-WOZ** | **Wizard of Oz Prototype** | 🔄 Phase 1 Complete | [→ spec](slices/vs1_wizard.md) • [→ design](slices/vs1_design.md) |
| **VS-002-MVP** | **Mobile Native Apps** | ⬚ Planned | [→ spec](slices/vs2_mobile.md) |
| **VS-003-POL** | **Smart Cost & Polish** | ⬚ Planned | [→ spec](slices/vs3_polish.md) |

---

## Active Slice

> This section tracks the current slice being worked on. When a slice completes,
> collapse it to status-only in the index above and move to the next one.

### VS-000-SKE: The Walking Skeleton ✅

_See [slices/vs0_skeleton.md](slices/vs0_skeleton.md) for detailed tasks and requirements._

**Goal:** Mobile app connects to API orchestrator via WebSocket. Proves monorepo, TypeScript, and basic client-server communication works.

**Done when:**
- [x] Monorepo builds without errors
- [x] API server starts and health check responds (verified 2026-02-16)
- [x] WebSocket connection established and message exchange verified (wscat, 2026-02-16)
- [x] At least one test passes in shared and API packages (8/8)
- [x] Development workflow documented
- _Deferred:_ Mobile app E2E via Expo Go — Hermes engine incompatible with web; core WebSocket proven via direct testing. Mobile UI testing will happen organically in VS-1.

**Blocking decisions:** None — all resolved.

---

### VS-001-WOZ: Wizard of Oz Prototype 🔄

_See [slices/vs1_wizard.md](slices/vs1_wizard.md) for detailed tasks and requirements._

**Goal:** Validate "whisper" interaction via web interface. User makes real business call, whispers text instructions mid-conversation, agent follows naturally within 2 seconds.

**Phase 1: Core Validation ✅ (2026-02-20)**
- [x] F-012-ABS: Platform abstraction interfaces defined (6 interfaces + 2 providers)
- [x] F-005-RET: Retell Custom LLM WebSocket handler implemented
- [x] F-006-WSP: Whisper instruction system + session management
- [x] F-010-LLM: OpenAI GPT-4o-mini provider + prompt builder
- [x] 76 tests passing across 7 test files
- [x] E.164 phone validation, input length limits, schema consistency

**Phase 2: Production Features ⬚**
- [ ] F-004-WEB: Next.js web UI (call control, whisper input, transcript display)
- [ ] F-007-PER: Persona toggle (Transparent/Proxy) in UI
- [ ] F-008-CST: Real-time cost display
- [ ] F-009-TRS: Transcript management + clipboard export

**Phase 3: Polish & Deploy ⬚**
- [ ] F-011-ERR: Error handling (auto-reconnect, LLM timeouts)
- [ ] Production deployment (Railway + Vercel)

**Blocking decisions:** None — all resolved.

---

## Planned Slices

> **Documentation Structure:**
> - **This file (milestone.md):** High-level slice summaries, index, and current status
> - **VS spec files (vsN_*.md):** Feature tracking, success criteria, test scenarios
> - **Design docs (vs1_design.md, etc.):** Implementation-level detail for complex slices

### VS-001-WOZ: Wizard of Oz Prototype
**Goal:** Validate "whisper" interaction via web interface before building full mobile stack.

**Phases:**
1. **Core Validation** — Platform abstraction interfaces (F-012), Retell integration (F-005), whisper system (F-006), LLM (F-010)
2. **Production Features** — Web UI (F-004), persona system (F-007), cost tracking (F-008), transcript management (F-009)
3. **Polish & Deploy** — Error handling (F-011) and production deployment (Railway + Vercel)

**Critical Discovery:** Retell AI "Custom LLM" mode is **text-only**. All audio processing (ASR/TTS) happens within Retell. We receive text transcripts and send text responses.

**Multi-language (first-class):** User whispers in their language, agent speaks to business in the selected target language. Language selector is a primary UI element, not buried in settings. LLM handles translation as part of whisper transformation — single pass, no extra latency.

**Success:** User makes real business call, whispers text instructions mid-conversation (business doesn't hear), agent follows instruction naturally within 2 seconds. Optionally: whisper in English, agent responds to business in Spanish.

**Documentation:**
- [vs1_wizard.md](slices/vs1_wizard.md) — Feature tracking, phases, and test scenarios
- [vs1_design.md](slices/vs1_design.md) — Implementation-level design (whisper loop, Retell protocol, LLM prompts, deployment)
- [spec/integrations/retell-ai.md](../../integrations/retell-ai.md) — Retell AI integration reference
- [spec/api-contracts.md](../../api-contracts.md) — WebSocket protocol contracts

### VS-002-MVP: Mobile Native Apps
**Goal:** Native iOS/Android apps with audio whisper support, VoIP integration, and offline resilience.

**Key Features:**
- Expo React Native apps (iOS + Android)
- Audio whisper (microphone → Deepgram transcription → LLM)
- Voice Command Parser ("Hey Celato, hang up")
- Offline Whisper Queue (auto-sync on reconnect)
- VoIP integration (CallKit on iOS, ConnectionService on Android)
- Platform interface implementations (mobile versions of all 6 interfaces)

**Reuses from VS-1:**
- Same API orchestrator and Retell integration
- Same WebSocket protocol
- Same conversation state management
- ~40-50% code reuse via `packages/shared`

**Success:** User makes call from iPhone, whispers audio instruction (not text), business doesn't hear raw audio, agent responds naturally with <2s latency including transcription.

**Documentation:**
- [vs2_mobile.md](slices/vs2_mobile.md) — Full specification with features, system design, and deployment

### VS-003-POL: Smart Cost & Polish
**Goal:** Production-ready mobile and web apps with smart cost optimization, call history, and multi-platform polish.

**Key Features:**
- User authentication (Supabase Auth with email/magic link)
- Call history with search and filtering (Supabase PostgreSQL + RLS)
- Contacts integration (save businesses with context notes)
- Smart cost optimization (auto-switch between "Parrot" ~$0.01/min and "Negotiator" ~$0.08/min)
- Multi-language enhancements (language-specific phrase caching, accent/dialect preferences — core multi-language moved to VS-1)
- Cost analytics dashboard (total spend, breakdown by tier, top contacts)
- Settings & preferences (default persona, language, cost tier)

**Success:** User registers, makes call in cheap "Parrot" mode, agent auto-upgrades to "Negotiator" for complex negotiation, user reviews call history on both mobile and web (synced via Supabase).

**Documentation:**
- [vs3_polish.md](slices/vs3_polish.md) — Full specification with features, Supabase schema, cost optimization strategy

---

## Defining New Slices

Each VS maps to a phase from the roadmap (see `spec/celato/roadmap.md`). The key: each VS is a **complete unit of progress** that adds verifiable value and keeps the system runnable end-to-end.

---

## Slice Transitions

Before moving from VS-N to VS-N+1:

### Transition Checklist
- [ ] All features in VS-N are ✅ or explicitly deferred with rationale
- [ ] All blocking decisions resolved (check VS document)
- [ ] VS-N slice document updated to final status
- [ ] Next VS's feature dependency order confirmed
- [ ] Index table updated with new status

### Collapsing Completed Slices

When a VS completes, update the index table status to ✅ and remove the "Active Slice" section.
The VS document in `slices/` preserves all detail. milestone.md stays scannable.

---

## Notes on Flexibility

Unlike rigid "Phase 1 = Foundation, Phase 2 = Features" approaches:
- VS progression is **opportunistic** — build what makes sense next
- Architecture work happens **when needed**, not up-front
- Each slice is **independently valuable** — no waiting for "Phase 2" to see results
- **Walking Skeleton First** — always have something running

This optimizes for **momentum and learning** over predictability.
