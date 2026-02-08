# Workflow Rules (Project-Specific)

> Personal communication and task preferences are in ~/.claude/CLAUDE.md.
> These rules add project-specific tracking conventions.

## Two-Phase Tracking
- Tracking starts inline in `milestone.md`, extracts organically. See @spec/workflow.md.
- **Inline:** Tasks under each feature heading. Start here. No extra files.
- **Extracted:** When 10+ tasks or design docs needed → `spec/features/` (file or folder).
- milestone.md gradually becomes an index. No hard switch — AI detects and helps transition.
- When using feature specs, `## Status:` is the source of truth — update BOTH files.
- Proactively suggest extraction when signals appear. Don't wait for the user to ask.

## Code Review Checklist
- Follows project coding standards? (see @spec/coding-standards.md)
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
