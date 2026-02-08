# Workflow: Milestone & Feature Tracking

This document defines how project tracking works. AI agents MUST follow
this workflow when creating, updating, or reviewing project progress.

---

## Progressive Tracking

Tracking grows with the project. Don't force structure before it's needed.

### Phase 1: Inline (MVP / Early Development)
Tasks live directly in `milestone.md` under each feature heading.
No feature spec files needed. Fast, low overhead.

**When to use:** Project is new, features are small, you're figuring things out.

### Phase 2: Extract (Growing Features)
When a feature needs a deep-dive (design docs, 10+ tasks, complex requirements),
extract it to `spec/features/feature-name.md`. The milestone.md entry becomes a
pointer to the spec file. Tasks move to the spec, milestone.md tracks status only.

**Trigger to extract:** You feel the milestone.md section getting unwieldy, OR
you need to document design decisions / requirements for a feature.

### Phase 3: Full Spec-Driven (Mature Project)
Most features have their own spec files. milestone.md is a pure index.
Feature spec status is the source of truth.

---

## Phase 1: Inline Tracking

`milestone.md` holds everything. Features have inline task lists:

```markdown
## Milestone 1: MVP
_Goal: Basic working product_

### Player Movement 🔄
- [x] Basic WASD movement
- [x] Camera follow
- [ ] Collision detection
- [ ] Jump mechanic

### Save System ⬚
- [ ] Serialize game state
- [ ] Save to local storage
- [ ] Load from file
```

Simple. No extra files. Just work through the tasks.

---

## Phase 2: Extracting a Feature

When a feature outgrows inline tracking:

1. Create `spec/features/feature-name.md` using the template below.
2. Move tasks from milestone.md into the feature spec.
3. Replace the inline tasks in milestone.md with a link:

```markdown
### Lightning System 🔄 → [spec](../features/lightning.md)
```

4. From now on, the feature spec owns the tasks. milestone.md shows status only.

---

## Phase 3: Full Spec-Driven

At this point, milestone.md is a clean index:

```markdown
## Milestone 2: Core
| Status | Feature | Spec | Priority |
|--------|---------|------|----------|
| 🔄 | Lightning | [spec](../features/lightning.md) | 🟡 Medium |
| ⬚ | Save System | [spec](../features/save-system.md) | 🟡 Medium |
```

**The contract:**
1. Feature spec `## Status:` is the source of truth.
2. milestone.md mirrors it.
3. When status changes, update BOTH.
4. Granular tasks live in feature specs only.

---

## Feature Deep-Dive Process

When doing a deep-dive into a feature (Phase 2+):

1. Research the feature thoroughly before writing any code.
2. Document findings in the feature spec under `## Design`.
3. Break implementation into granular tasks under `## Tasks`.
4. Order tasks: 🟢 Quick Wins → 🟡 Core → 🔴 Complex.
5. Each task should be small enough to complete in one focused session.
6. Iterate through tasks, checking them off as completed.

---

## Feature Spec Template

Each feature gets its own file at `spec/features/feature-name.md`:

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
| `spec/tracking/milestone.md` | Feature index + inline tasks (Phase 1) or index only (Phase 2+) | Active development |
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

- **Don't force feature specs too early.** Inline tasks are fine for MVP.
- **Don't duplicate tasks** across milestone.md and feature specs.
- **Don't forget to extract** when a feature's inline section gets unwieldy.
- **Don't forget to update milestone.md** when a feature spec's status changes.
