# Workflow: Milestone & Feature Tracking

This document defines how project tracking works. AI agents MUST follow
this workflow when creating, updating, or reviewing project progress.

---

## The Two-Level Tracking System

### Level 1: milestone.md (Index)
`spec/tracking/milestone.md` is a **high-level index** of features grouped by milestone.
It tracks WHAT features exist and their status. It does NOT contain granular tasks.

### Level 2: Feature Specs (Task Ownership)
`spec/features/*.md` files own the **granular task breakdowns** for each feature.
Each feature spec is a self-contained mini-project with its own tasks ordered by priority.

## The Contract

```
milestone.md ←→ spec/features/*.md
  (index)           (task owner)
```

1. `milestone.md` references feature specs by path and mirrors their status.
2. Feature specs contain the `## Status:` header as the single source of truth.
3. When a feature's status changes, BOTH files are updated.
4. Granular tasks NEVER go in milestone.md. They live in feature specs only.

## Workflow: Starting a New Feature

1. Create `spec/features/feature-name.md` using the template from `spec/project-conventions.md`.
2. Add an entry in `spec/tracking/milestone.md` under the appropriate milestone.
3. Deep-dive: research, document requirements, design, and break into tasks.
4. Work through tasks in priority order (quick-wins first).
5. Update status in the feature spec as work progresses.
6. When complete, mark status as ✅ in both the feature spec and milestone.md.

## Workflow: Feature Deep-Dive Process

When doing a deep-dive into a feature:

1. Research the feature thoroughly before writing any code.
2. Document findings in the feature spec under `## Design`.
3. Break implementation into granular tasks under `## Tasks`.
4. Order tasks: 🟢 Quick Wins → 🟡 Core → 🔴 Complex.
5. Each task should be small enough to complete in one focused session.
6. Iterate through tasks, checking them off as completed.

## Tracking Files Reference

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `spec/tracking/milestone.md` | Feature index by milestone | When feature status changes |
| `spec/tracking/backlog.md` | Ideas & future work not yet in a milestone | When new ideas arise |
| `spec/tracking/bugs.md` | Known bugs with repro steps | When bugs are found or fixed |
| `spec/tracking/decisions.md` | Open and resolved technical decisions | When decisions are made or needed |
| `spec/tracking/learnings.md` | Project-specific lessons learned | After significant discoveries |

## Status Icons

| Icon | Meaning |
|------|---------|
| ⬚ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| ⏸️ | Paused / blocked |
| ❌ | Cancelled |

## Anti-Patterns

- **Don't duplicate tasks** across milestone.md and feature specs.
- **Don't let milestone.md grow into a flat task list.** It's an index.
- **Don't skip the feature spec** for "small" features. The spec doesn't need to be long, but it should exist.
- **Don't forget to update milestone.md** when a feature's status changes in its spec.
