# Workflow Rules (Project-Specific)

> Personal communication and task preferences are in ~/.claude/CLAUDE.md.
> These rules add project-specific tracking conventions.

## Session Start
At the start of every conversation:
1. Read `CLAUDE.md` and the spec lookup table.
2. Read `spec/tracking/milestone.md` for current status and next steps.
3. Skim `spec/tracking/bugs.md`, `spec/tracking/decisions.md`, and `spec/tracking/qa.md` for open/blocking items and feature health.

## Vertical Slice Tracking
- Projects progress through **Vertical Slices (VS)** — complete, verifiable increments. See @spec/workflow.md.
- **VS-0 First:** Start with "The Walking Skeleton" — minimal runnable loop before building features.
- **Inline:** Tasks in `spec/tracking/slices/vsN_name.md` under each feature heading. Start here. No extra files.
- **Extracted:** When 10+ tasks or design docs needed → `spec/features/` (file or folder).
  - Simple features → single `.md` file.
  - Complex features → folder with `tasks.md` (what) + `design.md` (how).
- As features extract, VS docs evolve from task list to delivery sequence — referencing
  feature phases in build order, not individual tasks. No hard switch — AI detects and helps transition.
- When using feature specs, `## Status:` is the source of truth — update BOTH files.
- Proactively suggest extraction when signals appear. Don't wait for the user to ask.

## ID Conventions
- All tracking items use **3-letter mnemonic tags**: `[Type]-[Number]-[TAG]`
- Examples: `VS-000-SKE` (Skeleton), `F-012-INV` (Inventory), `D-005-ARC` (Architecture)
- Use full IDs when cross-referencing: `See D-003-ARC`, `Blocked by B-012-LTO`, `Related: L-005-RUL`

## Bug Handling
- Every non-trivial bug gets a success condition: "Bug is FIXED when: [observable outcomes]".
- Every bug fix gets a regression test.
- Log root cause and related learnings (L-###) when resolved.

## Learnings
- Log learnings immediately after discovery, not batched.
- Include severity (Critical/High/Medium/Low).
- For important learnings, include bad/good code pattern examples.

## Quality Assurance
- When a feature is "done" (code written), update `spec/tracking/qa.md` to ⚪ Needs Verification
- After manual testing, move to 🟢 Confirmed Working with specific success condition
- **NEVER mark as 🟢 without actual verification**
- Success conditions should be testable, not vague (e.g., "Login works" ❌ vs "User can log in with email/password and session persists after browser refresh" ✅)

## Vertical Slice Transitions
These rules are tied to specific actions you already perform:
- **When completing any meaningful work:** Check the active VS doc and relevant feature specs for tasks that match what was done. Mark them complete, update phase badges (`### Phase N: Name 🔄 [3/8 tasks]`), and update feature status icons. Work often happens without starting from a task — tracking must stay current.
- **When marking a feature ✅:** Check if it's the last one in the current VS. If so, tell the user and walk through the VS transition checklist.
- **When starting work on a new VS:** Read the previous VS's transition checklist first. If incomplete, flag it before proceeding.
- **When creating or extracting a feature:** Add `_(blocks F-XXX)_` or `_(blocked by F-XXX)_` to the VS doc heading if dependencies exist.
- **When creating a decision (D-###):** Always fill the `Blocks` field — which features or VSs are waiting on this?
- **When a feature spec exceeds 200 lines:** Split into `tasks.md` + `design.md` immediately, not "later."

## Code Review Checklist
- Follows project coding standards? (see @spec/coding-standards.md)
- API contracts match `spec/api-contracts.md`?
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
