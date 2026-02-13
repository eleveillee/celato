# Decisions

Technical decisions: open questions awaiting resolution and resolved decisions for reference.
This serves as a lightweight Architecture Decision Record (ADR).

---

## Open Questions

| ID | Question | Context | Options | Blocks | Status |
|----|----------|---------|---------|--------|--------|
| D-001-TAG | | | | | |

### Template for Open Questions
```markdown
### D-###-TAG: [Short question]
**Context:** Why this decision is needed.
**Blocks:** F-003-INV, VS-002-AUT _(which features/slices are waiting on this?)_
**Options:**
| | Option | Pros | Cons |
|---|---|---|---|
| ⭐ | Recommended | ... | ... |
| 🔄 | Alternative | ... | ... |
**Decision:** Pending

_Example IDs: D-005-ARC (Architecture), D-012-DBS (DataBaSe choice)_
```

## Resolved Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D-001-SLC | Use "slices" not "cycles" for VS tracking | Consistent terminology, vertical integration focus | 2026-02-12 |

### D-001-SLC: Terminology - "Slices" not "Cycles"
**Date:** 2026-02-12

**Context:** During Shabti/Codex architecture sync, noticed inconsistent terminology:
- Shabti used `spec/tracking/cycles/` for vertical slice documents
- Codex uses `spec/tracking/slices/` for the same purpose
- "Cycles" implies time-boxed iterations; "slices" emphasizes vertical integration

**Decision:** Use "Vertical Slices" (slices/) consistently across all Codex-based projects.

**Rationale:**
- "Vertical Slice" is the established pattern name in workflow.md
- Avoids confusion with time-boxed "development cycles" or "sprint cycles"
- Consistent with VS-### ID convention already in use
- Emphasizes end-to-end functionality over time-boxing

**Consequences:**
- All Codex-based projects use `spec/tracking/slices/` directory
- Older projects with `cycles/` should be migrated to `slices/` for consistency
- workflow.md updated with terminology clarification
- AI agents will be trained to use "slice" terminology

**Impact:** Shabti's `spec/tracking/cycles/` will be renamed to `slices/` in a future update.

---

### Template for Resolved Decisions
```markdown
### D-###-TAG: [What was decided]
**Context:** Why this came up.
**Decision:** What we chose.
**Rationale:** Why we chose it.
**Consequences:** What this means going forward.

_Example IDs: D-005-ARC (Architecture), D-012-DBS (DataBaSe choice)_
```
