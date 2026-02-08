# Workflow Rules (Project-Specific)

> Personal communication and task preferences are in ~/.claude/CLAUDE.md.
> These rules add project-specific tracking conventions.

## Feature Spec ↔ Milestone Tracking
- `spec/tracking/milestone.md` is an INDEX, not a task list.
- Granular tasks live in `spec/features/*.md` files.
- Feature spec `## Status:` is the source of truth.
- When completing a feature, update BOTH the feature spec and milestone.md.
- See @spec/workflow.md for the full tracking workflow and templates.

## Code Review Checklist
- Follows project coding standards? (see @spec/coding-standards.md)
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
