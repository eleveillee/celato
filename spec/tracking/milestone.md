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
| **VS-000-SKE** | **The Walking Skeleton** | ⬚ Not Started | [→ spec](slices/vs0_skeleton.md) |
| **VS-001-[TAG]** | [Next Logical Step] | ⬚ Planned | |
| **VS-002-[TAG]** | [Future Increment] | ⬚ Planned | |

---

## Active Slice

> This section tracks the current slice being worked on. When a slice completes,
> collapse it to status-only in the index above and move to the next one.

### VS-000-SKE: The Walking Skeleton ⬚

_See [slices/vs0_skeleton.md](slices/vs0_skeleton.md) for detailed tasks and requirements._

**Goal:** Minimal playable/runnable loop. The absolute minimum to reach a functional state.

**Done when:**
- [ ] Basic loop runs without errors
- [ ] Can be started and stopped cleanly
- [ ] Has at least one observable behavior
- [ ] Foundation is in place for next vertical slice

**Blocking decisions:** None initially — defer architecture decisions until proven necessary.

---

## Defining New Slices

When planning a new VS, ask:
1. **Is it a complete increment?** Does it add verifiable value (feature OR architecture)?
2. **Is it focused?** Can it be finished in a reasonable timeframe (1-2 weeks ideal)?
3. **Is it runnable?** After this slice, does the project still work end-to-end?

Each VS can be:
- **Feature-focused**: "Inventory System", "Combat Mechanics"
- **Architecture-focused**: "Save/Load System", "Refactored Physics Layer"
- **Hybrid**: "Dashboard with Real-time Updates" (feature + infrastructure)

The key: each VS is a **complete unit of progress**, not a vague "phase."

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
