# Milestones

> **Start inline.** Tasks live under each feature heading.
> **Extract when needed.** When a feature outgrows inline (10+ tasks, needs design docs),
> move it to `spec/features/`. See `spec/workflow.md` for extraction steps.
>
> Extraction syntax: `### F-001: Feature Name 🔄 → [spec](../features/feature-name.md)`

---

## ID Conventions

All items use prefixed IDs for cross-referencing across files:
- **F-001** — Features (in milestones and feature specs)
- **B-001** — Bugs (`bugs.md`)
- **L-001** — Learnings (`learnings.md`)
- **D-001** — Decisions (`decisions.md`)
- **BL-001** — Backlog items (`backlog.md`)
- **TD-001** — Tech debt (`tech-debt.md`)
- **UP-001** — Upgrade plan items (`version-matrix.md`)

Reference format: `See D-003` or `Blocked by B-012`. AIs should use these IDs when linking related items.

---

## Milestone 1: [Name] (MVP)
_Goal: [One sentence describing what "done" looks like]_
_Done when: [Verifiable criteria — e.g. "both demo games playable, all tests pass"]_
_Blocking decisions: [D-001, D-003 — must resolve before M2]_

### F-001: Feature Name ⬚
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### F-002: Feature Name ⬚ _(blocks F-003)_
- [ ] Task 1
- [ ] Task 2

### M1 → M2 Transition
- [ ] All M1 features ✅ or explicitly deferred with rationale
- [ ] Blocking decisions resolved (see above)
- [ ] Completed features collapsed to status-only (see workflow.md)
- [ ] M2 dependency order confirmed

---

## Milestone 2: [Name] (Core)
_Goal: [One sentence]_
_Done when: [Verifiable criteria]_
_Blocking decisions: [D-IDs if any]_

> When features are extracted, this section becomes a delivery sequence.
> List feature phases in build order, not individual tasks. Standalone
> steps that don't belong to any feature are fine too. See `spec/workflow.md`.

### Step 1: [Description] ⬚
> _Gate: [How you know this step is done]_
- F-003 Phase 1 (schemas + interfaces)
- F-004 Phase 1 (scaffolding)
- Set up shared config — not tied to any feature

### Step 2: [Description] ⬚
> _Gate: [Verifiable outcome]_
- F-003 Phase 2 (core implementation)
- F-004 Phase 2 (integration)

### M2 → M3 Transition
- [ ] All M2 features ✅ or explicitly deferred with rationale
- [ ] Blocking decisions resolved
- [ ] Completed features collapsed to status-only

---

## Milestone 3: [Name] (Polish)
_Goal: [One sentence]_
_Done when: [Verifiable criteria]_

### F-004: Feature Name ⬚
- [ ] Task 1
