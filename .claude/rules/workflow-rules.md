# Workflow Rules (Project-Specific)

> Personal communication and task preferences are in ~/.claude/CLAUDE.md.
> These rules add project-specific tracking conventions.

## Progressive Tracking
- Tracking grows with the project. See @spec/workflow.md for full details.
- **Phase 1 (MVP):** Tasks live inline in `milestone.md` under each feature.
- **Phase 2 (Growing):** Extract to `spec/features/*.md` when a feature needs 10+ tasks or design docs.
- **Phase 3 (Mature):** `milestone.md` is a pure index; feature specs own all tasks.
- When using feature specs, `## Status:` is the source of truth — update BOTH files.

## Code Review Checklist
- Follows project coding standards? (see @spec/coding-standards.md)
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
