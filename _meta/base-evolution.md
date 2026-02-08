# Base Evolution

> **This file is base-only.** Tracks how the _Base project iterates over time.
> Deleted during setup wizard.

---

## Version History

### v0.1 - Initial Scaffold (2026-02-08)
- 33 files across 8 directories
- Full docs/, spec/, stacks/ structure
- 6 .claude/rules/ + 5 .cursor/rules/ (mirrored)
- Known issue: hierarchy too heavy, duplication across files

### v0.2 - Refinement (2026-02-08)
- Created `_meta/` for base-only files (technical-reference, evolution tracking)
- Merged rules: 6→2 (.claude/) and 5→2 (.cursor/)
- Removed redundant files: best-practices.md, project-conventions.md
- Absorbed feature spec template into workflow.md
- Slimmed AGENTS.md to thin pointer
- Updated all cross-references
- Result: ~24 files across 7 directories (-27%)

### v0.3 - Progressive Tracking (2026-02-08)
- Replaced rigid two-level tracking with progressive 3-phase system
- Phase 1: inline tasks in milestone.md (MVP, no feature spec files needed)
- Phase 2: extract to spec/features/ when features outgrow inline
- Phase 3: milestone.md becomes pure index (original behavior)
- Updated workflow.md, milestone.md template, all rule files, technical-reference.md

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Self-contained rules in both tools | Cursor can't import; accepted duplication over broken references |
| _meta/ folder over headers | Physical separation is clearer than convention |
| Keep all 5 tracking templates | They're scaffolding, empty is correct |
| stacks/ as guides not templates | AI regenerates configs; guides encode rationale |
| Progressive tracking (3 phases) | Don't force feature spec overhead before it's needed |

## What To Watch

- Does the `docs/` folder justify existing with only `architecture.md`?
- Are stacks/ guides too long? (365-662 lines each)
- Does the setup wizard flow actually work end-to-end?
- Do the merged rule files stay readable as they grow?

## Usage Log

| Date | Project | Stack | Notes |
|------|---------|-------|-------|
| | | | |
