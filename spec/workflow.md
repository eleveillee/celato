# Workflow: Vertical Slice & Feature Tracking
_Last updated: 2026-02-12_

This document defines how Celato's tracking workflow operates.

---

## Vertical Slice Tracking

Celato progresses through **Vertical Slices (VS)** — complete, verifiable increments.
Each VS can be a feature, foundational work, or a hybrid. The goal: always have something running.

### The Walking Skeleton (VS-0)

**VS-0: The Walking Skeleton** is the minimal runnable loop that proves the tech stack works.

**For Celato:** Mobile app connects to API orchestrator via WebSocket. Proves monorepo setup, TypeScript compilation, and basic client-server communication.

**Why it matters:**
- Establishes the development workflow (code → test → run)
- Creates momentum — you're building, not planning
- Reveals real architecture needs, not imagined ones

### Subsequent Vertical Slices

After VS-0, each slice adds **one complete capability** to the system:
- **Feature Slice**: "Inventory System", "User Authentication", "Combat Mechanics"
- **Architecture Slice**: "Save/Load System", "Refactored Physics Layer", "Caching Infrastructure"
- **Hybrid Slice**: "Real-time Dashboard" (feature + WebSocket infrastructure)

**The key:** Each VS is independently valuable. No "Phase 1 Foundation, Phase 2 Features" separation.
Build architecture **when features need it**, not up-front.

---

## Terminology: Slices (Not Cycles)

**Vertical Slices (VS):**
- Complete, verifiable increments of functionality
- Named with VS-### IDs and 3-letter tags (e.g., `VS-001-AUTH`)
- Live in `spec/tracking/slices/`
- Each VS document tracks features, tasks, and delivery order for that increment

**NOT "cycles":**
We use **"slices"** consistently across all Codex-based projects. "Slice" emphasizes
vertical integration (end-to-end functionality), not time-boxed iterations.

If you see "cycles/" in older projects, it should be renamed to "slices/" for consistency.

---

## Two Levels of Tracking

Within each Vertical Slice, tracking starts simple and grows organically:

### Inline (Start Here)
Tasks live directly in the VS document (`spec/tracking/slices/vsN_name.md`) under feature headings.
No feature spec files. Fast, low overhead. This is where every VS starts.

Example:
```markdown
## VS-1: Inventory System

### F-005: Item Pickup 🔄
- [x] Click to collect items
- [ ] Add to inventory data structure
- [ ] Update UI counter

### F-006: Item Display ⬚
- [ ] Show inventory grid
- [ ] Render item icons
```

### Extracted (When Needed)
When a feature outgrows inline tracking (10+ tasks, needs design docs), extract it to `spec/features/`.
The VS document becomes a pointer. The feature spec owns all granular tasks.

AI agents should detect when extraction is needed and offer to help transition.

---

## Extracting a Feature

**When to extract:** A feature has 10+ tasks, needs design documentation,
has complex requirements, or the inline section feels unwieldy.

**AI agents:** When you notice these signals, proactively suggest extraction.
Don't wait for the user to ask.

### Extraction steps:

1. Create the feature's home in `spec/features/` (file or folder — see below).
2. Move tasks from the VS document into the feature spec.
3. Replace the inline tasks in the VS document with a pointer:

```markdown
### F-005: Item Pickup 🔄 → [spec](../../features/item-pickup.md)
```

4. From now on, the feature spec owns the granular tasks.
5. The VS document shows delivery order: which feature phases to work on, in what sequence.
   It references phases (e.g., "F-005 Phase 2"), not individual tasks.
6. Feature spec `## Status:` is the source of truth — update BOTH files when status changes.

### Simple vs Complex features:

| Complexity | Structure |
|------------|-----------|
| **Simple** | `spec/features/feature-name.md` — single file with tasks + brief design |
| **Complex** | `spec/features/feature-name/` — folder (see below) |

### Complex feature folder:

When a feature needs both task tracking AND deep technical documentation:

```
spec/features/scanner/
├── tasks.md        # Milestoned task tracking (the "what")
└── design.md       # Technical deep-dive, architecture, research (the "how")
```

**`tasks.md`** — uses the same feature spec template (status, tasks, requirements).
**`design.md`** — technical approach, data models, API contracts, research notes, diagrams.

This prevents single files from growing to 100+ KB (which happened in real projects).
Start with a single file; split into a folder when the file gets unwieldy.

---

## Vertical Slice Transitions

When a VS completes, clean up before starting the next one:

### Collapsing a completed slice

Update the Vertical Slice Index in `milestone.md`:
```markdown
| **VS-1** | **Inventory System** | ✅ Complete | [→ spec](slices/vs1_inventory.md) |
```

Remove the "Active Slice" section from `milestone.md`. The VS document preserves all detail.

### Transition checklist

Each VS document has a completion checklist. Before starting the next VS:
1. All features ✅ or explicitly deferred (with rationale, not just ignored).
2. All blocking decisions resolved — check `_Blocking decisions:_` at the top of the VS doc.
3. VS document marked complete with final status.
4. Next VS's feature dependency order confirmed.
5. Index table in `milestone.md` updated.

### Feature dependencies

Use inline annotations on feature headings when order matters:
```markdown
### F-003: Telemetry ⬚ _(blocks F-005, F-006)_
### F-005: AI Input ⬚ _(blocked by F-003)_
```

Keep it lightweight — only declare dependencies that affect start order.

---

## Feature Deep-Dive Process

When doing a deep-dive into an extracted feature:

1. Research the feature thoroughly before writing any code.
2. Document findings in the feature spec (or `design.md` for complex features).
3. Break implementation into phases that map to VS delivery steps.
4. Each task should be small enough to complete in one focused session.
5. Iterate through phases, checking tasks off and updating phase badges.

---

## Feature Spec Template

For a single-file feature at `spec/features/feature-name.md`:

```markdown
# Feature: [Name]
## Status: ⬚ Not Started | 🔄 In Progress | ✅ Complete
## Vertical Slice: VS-1 (Inventory System)
## Dependencies
_Blocked by: F-002 (needs X) | Blocks: F-005 | Decisions: D-003_

## Overview
[What this feature does and why it exists]

## Requirements
[Specific, testable requirements]

## Design
[Technical approach, data models, API surface]

## Tasks
### Phase 1: [Name] ⬚ [0/2 tasks]
- [ ] Task 1
- [ ] Task 2

### Phase 2: [Name] 🔄 [1/3 tasks]
- [x] Task 3
- [ ] Task 4
- [ ] Task 5
```

**Phases are optional.** For small features (under 10 tasks, one delivery step),
a flat `## Tasks` list is fine. Use phases when a feature spans multiple delivery
steps or is complex enough to need them.

For a complex feature folder, split `## Design` into `design.md` and keep
everything else in `tasks.md`.

---

## Extraction Triggers

Watch for these signals to extract features:

| Signal | Action |
|--------|--------|
| Feature has 10+ inline tasks in VS doc | Extract to a feature spec |
| Deep-dive or research needed | Create extracted spec with design section |
| Inline section has design notes or decisions | Time for its own file |
| Most features in a VS are extracted | VS doc becomes an index |
| Feature spec > 200 lines | Split into folder (tasks.md + design.md) |
| All features in a VS are ✅ | Run the transition checklist |
| Unresolved decisions block the next VS | Flag before starting new VS work |

When extracting:
1. Preserve all existing tasks and their completion status.
2. Update VS document pointer in the same operation.
3. Confirm both files are consistent.

---

## ID Conventions

> **Canonical source.** If ID conventions change, update this table first.
> Other files (milestone.md, CLAUDE.md, workflow-rules.md) summarize but defer here.

All tracking items use **3-letter mnemonic tags** for human-readable IDs at a glance:

**Format:** `[Type]-[Number]-[TAG]` where TAG is a 3-letter mnemonic summary.

| Prefix | File | Example | TAG Meaning |
|--------|------|---------|-------------|
| **VS-###-TAG** | `milestone.md` / `slices/` | `VS-000-SKE` | Skeleton |
| **F-###-TAG** | VS docs / feature specs | `F-001-AUT` | Authentication |
| **B-###-TAG** | `bugs.md` | `B-003-LTO` | Login TimeOut |
| **L-###-TAG** | `learnings.md` | `L-012-PRS` | PRiSma gotcha |
| **D-###-TAG** | `decisions.md` | `D-005-ARC` | ARChitecture |
| **BL-###-TAG** | `backlog.md` | `BL-008-DRK` | DaRK mode |
| **TD-###-TAG** | `tech-debt.md` | `TD-002-TMO` | TiMeOut hardcoded |
| **UP-###-TAG** | `version-matrix.md` | `UP-001-R19` | React 19 |

**Cross-referencing:** Use full IDs when linking: `See D-003-ARC`, `Blocked by B-012-LTO`, `Related: L-005-RUL`.

## Tracking Files Reference

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `spec/tracking/milestone.md` | Vertical Slice Index + Active Slice | Every VS transition |
| `spec/tracking/slices/` | Individual VS documents with inline tasks | Active development |
| `spec/tracking/backlog.md` | Ideas & future work not yet in a VS | When new ideas arise |
| `spec/tracking/bugs.md` | Known bugs with repro steps | When bugs are found or fixed |
| `spec/tracking/decisions.md` | Open and resolved technical decisions | When decisions are made or needed |
| `spec/tracking/learnings.md` | Project-specific lessons learned | After significant discoveries |
| `spec/tracking/tech-debt.md` | Technical debt with priority and proposed fixes | When debt is found or resolved |
| `spec/tracking/version-matrix.md` | Dependency versions and upgrade plan | When deps change |

## Status Icons

| Icon | Meaning |
|------|---------|
| ⬚ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| ⏸️ | Paused / blocked |
| ❌ | Cancelled |

## Anti-Patterns

- **Don't force feature specs too early.** Inline tasks in the VS document are the right starting point.
- **Don't duplicate tasks** across VS docs and feature specs. When features are
  extracted, the VS doc references phases (e.g., "F-003 Phase 2"), not individual tasks.
- **Don't let feature spec files grow past 200 lines** without splitting into a folder.
- **Don't forget to update the VS document** when a feature spec's status changes.
- **Don't wait for the user to ask** — proactively suggest extraction when signals appear.
- **Don't start a new VS with unresolved blocking decisions.** Resolve or explicitly defer them.
- **Don't build architecture up-front.** Wait until features need it. Walking Skeleton first.
- **Don't skip VS-0.** Always start with the minimal runnable loop, even if it feels trivial.
