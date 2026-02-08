# Workflow: Milestone & Feature Tracking

This document defines how project tracking works. AI agents MUST follow
this workflow when creating, updating, or reviewing project progress.

---

## Two-Phase Tracking

Tracking starts simple and grows organically. There are only two modes:

### Inline
Tasks live directly in `milestone.md` under each feature heading.
No feature spec files. Fast, low overhead. This is where every project starts.

### Extracted
When a feature outgrows inline tracking, it gets its own home in `spec/features/`.
milestone.md becomes a pointer. The feature spec owns all tasks and design docs.

As more features get extracted, milestone.md gradually becomes a pure index.
This happens naturally — there is no "switch" moment. AI agents should detect
when a feature is ready for extraction and offer to help transition it.

---

## Inline Tracking

`milestone.md` holds everything. Features have inline task lists:

```markdown
## Milestone 1: MVP
_Goal: Basic working product_

### F-001: Player Movement 🔄
- [x] Basic WASD movement
- [x] Camera follow
- [ ] Collision detection
- [ ] Jump mechanic

### F-002: Save System ⬚
- [ ] Serialize game state
- [ ] Save to local storage
- [ ] Load from file
```

Simple. No extra files. Just work through the tasks.

---

## Extracting a Feature

**When to extract:** A feature has 10+ tasks, needs design documentation,
has complex requirements, or the milestone.md section feels unwieldy.

**AI agents:** When you notice these signals, proactively suggest extraction.
Don't wait for the user to ask.

### Extraction steps:

1. Create the feature's home in `spec/features/` (file or folder — see below).
2. Move tasks from milestone.md into the feature spec.
3. Replace the inline tasks in milestone.md with a pointer:

```markdown
### F-001: Player Movement 🔄 → [spec](../features/player-movement.md)
```

4. From now on, the feature spec owns the tasks. milestone.md shows status only.
5. Feature spec `## Status:` is the source of truth — update BOTH files when status changes.

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

## Feature Deep-Dive Process

When doing a deep-dive into an extracted feature:

1. Research the feature thoroughly before writing any code.
2. Document findings in the feature spec (or `design.md` for complex features).
3. Break implementation into granular tasks ordered by priority.
4. Order tasks: 🟢 Quick Wins → 🟡 Core → 🔴 Complex.
5. Each task should be small enough to complete in one focused session.
6. Iterate through tasks, checking them off as completed.

---

## Feature Spec Template

For a single-file feature at `spec/features/feature-name.md`:

```markdown
# Feature: [Name]
## Status: ⬚ Not Started | 🔄 In Progress | ✅ Complete
## Milestone: [Which milestone this belongs to]

## Overview
[What this feature does and why it exists]

## Requirements
[Specific, testable requirements]

## Design
[Technical approach, data models, API surface]

## Tasks
### 🟢 Quick Wins
- [ ] Task 1
- [ ] Task 2

### 🟡 Core
- [ ] Task 3
- [ ] Task 4

### 🔴 Complex
- [ ] Task 5
```

For a complex feature folder, split `## Design` into `design.md` and keep
everything else in `tasks.md`.

---

## AI Transition Detection

AI agents should watch for these signals and suggest extraction:

| Signal | Action |
|--------|--------|
| Feature has 10+ inline tasks | Suggest extracting to a feature spec |
| User asks for a "deep-dive" or research | Create extracted spec with design section |
| Inline section has design notes or decisions | Time for its own file |
| Most features are extracted | Note that milestone.md is becoming an index |
| Feature spec > 200 lines | Suggest splitting into folder (tasks.md + design.md) |

When transitioning, do it gracefully:
1. Show the user what will move and where.
2. Preserve all existing tasks and their completion status.
3. Update milestone.md pointer in the same operation.
4. Confirm both files are consistent before finishing.

---

## ID Conventions

All tracking items use prefixed IDs for cross-referencing:

| Prefix | File | Example |
|--------|------|---------|
| **F-###** | `milestone.md` / feature specs | `F-001: User Auth` |
| **B-###** | `bugs.md` | `B-003: Login timeout` |
| **L-###** | `learnings.md` | `L-012: Prisma v7 gotcha` |
| **D-###** | `decisions.md` | `D-005: Auth provider` |
| **BL-###** | `backlog.md` | `BL-008: Dark mode` |
| **TD-###** | `tech-debt.md` | `TD-002: Hardcoded timeout` |
| **UP-###** | `version-matrix.md` | `UP-001: React 19 upgrade` |

Use these IDs when linking related items: `See D-003`, `Blocked by B-012`, `Related: L-005`.

## Tracking Files Reference

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `spec/tracking/milestone.md` | Inline tasks → gradually becomes index as features extract | Active development |
| `spec/tracking/backlog.md` | Ideas & future work not yet in a milestone | When new ideas arise |
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

- **Don't force feature specs too early.** Inline tasks are the right starting point.
- **Don't duplicate tasks** across milestone.md and feature specs.
- **Don't let feature spec files grow past 200 lines** without splitting into a folder.
- **Don't forget to update milestone.md** when a feature spec's status changes.
- **Don't wait for the user to ask** — proactively suggest extraction when signals appear.
