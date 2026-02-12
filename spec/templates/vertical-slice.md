# VS-###-TAG: [Slice Name]

> **Copy this template** when creating a new vertical slice.
> Replace ### with the number (e.g., 001, 002) and TAG with a 3-letter mnemonic (e.g., INV for Inventory).
> Rename to `vs###_name.md` (e.g., `vs001_inventory.md`) and place in `spec/tracking/slices/`.
>
> **Example IDs:** VS-001-INV, VS-002-AUT, VS-003-SAV

## Status: ⬚ Not Started | 🔄 In Progress | ✅ Complete

---

## Goal

> **One sentence:** What complete capability does this slice add to the system?
>
> Examples:
> - "Players can collect, store, and use items in an inventory system."
> - "Dashboard shows real-time metrics via WebSocket connection."
> - "API supports user authentication with JWT tokens."

[REPLACE with one-sentence goal]

---

## Success Criteria

This slice is DONE when:
- [ ] [Observable outcome 1]
- [ ] [Observable outcome 2]
- [ ] [Observable outcome 3]
- [ ] All features in this slice are ✅ or deferred with rationale
- [ ] Tests pass (unit + integration for new functionality)
- [ ] The system still runs end-to-end without errors

---

## Blocking Decisions

> List decisions that MUST be resolved before starting this slice.
> Reference decision IDs from `spec/tracking/decisions.md`.

_Blocking decisions:_ [D-001-ARC, D-005-DBS] or "None"

---

## Features (Inline Tasks)

> Start with inline tasks. Extract to `spec/features/` only when a feature grows to 10+ tasks
> or needs deep design documentation.

### F-###-TAG: [Feature Name] ⬚
> [One sentence: what this feature does and why it's needed for this slice]
> Example: F-012-INV for "Inventory System", F-013-PKP for "Item Pickup"

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### F-###-TAG: [Feature Name] ⬚ _(blocked by F-012-INV)_
> [One sentence: what this feature does]

- [ ] Task 1
- [ ] Task 2

---

## Technical Scope

### What's In Scope
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2]
- [ ] [Infrastructure/architecture needed for features above]

### What's Out of Scope (Defer to Later Slices)
- [Feature or enhancement that's not critical for this slice]
- [Optimization or polish that can wait]
- [Edge case handling that isn't needed yet]

---

## Dependencies

> External libraries, APIs, or services added or updated for this slice.

| Dependency | Purpose | Version | Notes |
|------------|---------|---------|-------|
| [Name] | [Why it's needed] | [Version] | [Any gotchas or migration notes] |

---

## Architecture Notes

> Document architectural decisions and key technical approaches for this slice.
> Keep it brief — if it grows beyond a few paragraphs, create a design doc in `spec/features/`.

**Key Decisions:**
- [Decision 1 with brief rationale]
- [Decision 2 with brief rationale]

**Structure Changes:**
```
[Show any new directories or key files added]
src/
├── features/
│   └── new-feature/
│       ├── index.ts
│       └── types.ts
```

**API Changes:**
- [New endpoints, changed contracts, breaking changes]
- Reference `spec/api-contracts.md` for full details

---

## Testing Strategy

> How will you verify this slice works?

**Unit Tests:**
- [What modules/functions need unit tests]

**Integration Tests:**
- [What workflows need end-to-end tests]

**Manual Verification:**
- [ ] [Step-by-step manual test to confirm slice completion]

---

## VS Transition Checklist

Complete this checklist before moving to the next vertical slice:

- [ ] All features in this VS are ✅ or explicitly deferred with rationale
- [ ] Success criteria above are all checked
- [ ] Blocking decisions resolved (see above)
- [ ] Tests pass (unit + integration)
- [ ] The system runs end-to-end without errors
- [ ] Update `spec/tracking/milestone.md` index to mark this VS complete
- [ ] Lessons learned captured below
- [ ] Plan and document next VS focus before starting work

---

## Lessons Learned

> After completing this slice, capture what worked, what didn't, and insights to carry forward.

**What Worked:**
- [What went well and should be repeated]

**What Didn't:**
- [What struggled or caused friction]

**Carry Forward to Next VS:**
- [Specific insights to apply to the next slice]
- [Technical debt identified but not yet addressed — log in tech-debt.md]

---

## Notes

> Scratchpad for thoughts, links, research, or context that doesn't fit elsewhere.
