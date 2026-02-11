# Workflow Rules (Project-Specific)

> Personal communication and task preferences are in ~/.claude/CLAUDE.md.
> These rules add project-specific tracking conventions.

## Two-Phase Tracking
- Tracking starts inline in `milestone.md`, extracts organically. See @spec/workflow.md.
- **Inline:** Tasks under each feature heading. Start here. No extra files.
- **Extracted:** When 10+ tasks or design docs needed → `spec/features/` (file or folder).
  - Simple features → single `.md` file.
  - Complex features → folder with `tasks.md` (what) + `design.md` (how).
- As features extract, milestone.md evolves from task list to delivery sequence — referencing
  feature phases in build order, not individual tasks. No hard switch — AI detects and helps transition.
- When using feature specs, `## Status:` is the source of truth — update BOTH files.
- Proactively suggest extraction when signals appear. Don't wait for the user to ask.

## ID Conventions
- All tracking items use prefixed IDs: F-### (features), B-### (bugs), L-### (learnings),
  D-### (decisions), BL-### (backlog), TD-### (tech debt), UP-### (upgrades).
- Use IDs when cross-referencing: `See D-003`, `Blocked by B-012`, `Related: L-005`.

## Bug Handling
- Every non-trivial bug gets a success condition: "Bug is FIXED when: [observable outcomes]".
- Every bug fix gets a regression test.
- Log root cause and related learnings (L-###) when resolved.

## Learnings
- Log learnings immediately after discovery, not batched.
- Include severity (Critical/High/Medium/Low).
- For important learnings, include bad/good code pattern examples.

## Milestone Transitions
These rules are tied to specific actions you already perform:
- **When completing any meaningful work:** Check milestone.md and relevant feature specs for tasks that match what was done. Mark them complete and update feature status icons. Work often happens without starting from a milestone task — tracking must stay current.
- **When marking a feature ✅:** Check if it's the last one in its milestone. If so, tell the user and walk through the transition checklist in milestone.md.
- **When starting work on a feature in a new milestone:** Read the previous milestone's transition checklist first. If incomplete, flag it before proceeding.
- **When creating or extracting a feature:** Add `_(blocks F-XXX)_` or `_(blocked by F-XXX)_` to the milestone.md heading if dependencies exist.
- **When creating a decision (D-###):** Always fill the `Blocks` field — which features or milestones are waiting on this?
- **When a feature spec exceeds 200 lines:** Split into `tasks.md` + `design.md` immediately, not "later."

## Code Review Checklist
- Follows project coding standards? (see @spec/coding-standards.md)
- API contracts match `spec/api-contracts.md`?
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
