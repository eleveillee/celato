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

### v0.4 - Consistency Pass + API Contracts (2026-02-08)
- Full consistency audit across all files
- Fixed: README described only Phase 3, now covers all 3 phases
- Fixed: broken ref to deleted `docs/best-practices.md` in coding-standards.md
- Fixed: broken ref to deleted `.claude/rules/testing.md` in setup-wizard.md
- Standardized phase labels to (MVP)/(Growing)/(Mature) everywhere
- Added `spec/api-contracts.md` as single source of truth for API shapes
- Added API contract enforcement rules to both .claude/ and .cursor/ rules

### v0.5 - TagExpert/Helix Learnings (2026-02-08)
- Moved `docs/architecture.md` → `spec/architecture.md` (AI-facing, not human-facing)
- Removed empty `docs/` directory — everything lives in `spec/` now
- Added `spec/tracking/tech-debt.md` template (from TagExpert pattern)
- Added `spec/tracking/version-matrix.md` template (from TagExpert pattern)
- Added `spec/research/.gitkeep` for optional competitive/market research
- Added consistent ID conventions across ALL tracking files (F-###, B-###, L-###, D-###, BL-###, TD-###, UP-###)
- Replaced CLAUDE.md "Key References" with full spec lookup table
- Added ID conventions section to workflow.md
- Updated all cross-references for architecture move

### v0.6 - Two-Phase Tracking + Project References (2026-02-08)
- Simplified 3-phase → 2-phase tracking (Inline → Extracted)
- Phase 2 was just a transition state, not a real mode — removed it
- Added complex feature folder pattern: `spec/features/name/` with `tasks.md` + `design.md`
- Added AI transition detection rules (proactively suggest extraction)
- Created `_meta/references/` with TagExpert and Helix project documentation
- References capture patterns, architecture, learnings, and bloat warnings from real projects

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Self-contained rules in both tools | Cursor can't import; accepted duplication over broken references |
| _meta/ folder over headers | Physical separation is clearer than convention |
| Keep all 5 tracking templates | They're scaffolding, empty is correct |
| stacks/ as guides not templates | AI regenerates configs; guides encode rationale |
| Two-phase tracking (inline → extracted) | 3 phases was overcomplicated; Phase 2 was just transition |
| Complex feature folders (tasks.md + design.md) | Prevents 100KB+ single files (proven by Helix/TagExpert) |
| _meta/references/ for real projects | Captures proven patterns and bloat warnings for base evolution |
| api-contracts.md as single source | Prevents shape drift between frontend/backend/tests/docs |
| Prefixed IDs on all tracking items | Enables cross-referencing between bugs, learnings, decisions, features |
| architecture.md in spec/ not docs/ | Architecture is AI-facing; docs/ was left with nothing useful |
| tech-debt.md + version-matrix.md | Every real project needs these; validated by TagExpert usage |

## What To Watch

- ~~Does the `docs/` folder justify existing with only `architecture.md`?~~ Resolved: moved to spec/, deleted docs/
- Are stacks/ guides too long? (365-662 lines each)
- Does the setup wizard flow actually work end-to-end?
- Do the merged rule files stay readable as they grow?

## Usage Log

| Date | Project | Stack | Notes |
|------|---------|-------|-------|
| | | | |
