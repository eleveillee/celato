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

| ID | Focus | Status | Document |
|:---|:------|:-------|:---------|
| **VS-000-SKE** | **The Walking Skeleton** | 🔄 In Progress | [→ spec](slices/vs0_skeleton.md) |
| **VS-001-WOZ** | **Wizard of Oz Prototype** | ⬚ Planned | |
| **VS-002-MVP** | **Mobile MVP** | ⬚ Planned | |
| **VS-003-POL** | **Smart Cost & Polish** | ⬚ Planned | |

---

## Active Slice

> This section tracks the current slice being worked on. When a slice completes,
> collapse it to status-only in the index above and move to the next one.

### VS-000-SKE: The Walking Skeleton 🔄

_See [slices/vs0_skeleton.md](slices/vs0_skeleton.md) for detailed tasks and requirements._

**Goal:** Mobile app connects to API orchestrator via WebSocket. Proves monorepo, TypeScript, and basic client-server communication works.

**Done when:**
- [x] Monorepo builds without errors
- [ ] API server starts and health check responds
- [ ] Mobile app launches in Expo
- [ ] WebSocket connection established between mobile and API
- [ ] At least one test passes in shared and API packages
- [ ] Development workflow documented

**Blocking decisions:** None — defer Retell AI and OpenAI integration to VS-1.

---

## Planned Slices

### VS-001-WOZ: Wizard of Oz Prototype (Weeks 1-2)
**Goal:** Validate "whisper" interaction via web interface before building full mobile stack.

**Focus:**
- Web-based dialer (Next.js or simple HTML)
- Retell AI integration for phone calls
- Spacebar "whisper" button to inject text into agent context
- Visual conversation log
- Test with real business call (e.g., check store hours)

**Success:** User can press spacebar, whisper an instruction, and see the agent follow it in the next turn.

### VS-002-MVP: Mobile MVP (Weeks 3-6)
**Goal:** First functional mobile experience with full VoIP.

**Focus:**
- React Native Director UI (three panels: Business, Agent, User controls)
- Whisper audio (not just text)
- Live transcript streaming
- Basic context presets (General, Restaurant, Support)
- Call session management

**Success:** Make a dinner reservation in a foreign language where the user corrects a detail mid-call via whisper.

### VS-003-POL: Smart Cost & Polish (Weeks 7-10)
**Goal:** Make it viable for daily use.

**Focus:**
- Model switching ("Parrot" cheap mode vs "Negotiator" smart mode)
- Call history and transcript review
- Contacts integration
- Multi-language support
- Cost tracking and billing integration

**Success:** User can review past calls, see cost breakdown, and switch between cost tiers.

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
