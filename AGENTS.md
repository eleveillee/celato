# [REPLACE: Project Name]

[REPLACE: One-sentence project description.]

## Tech Stack
[REPLACE: After setup wizard]

## Commands
[REPLACE: After setup wizard]

## Code Style
- Modular code, single responsibility. Max ~300 lines per file, ~50 per function.
- No repetition for shared logic (3+ uses). No premature abstraction for one-offs.
- Named exports. Early returns. Guard clauses.
- Comments explain WHY, not WHAT. No commented-out code.
- Use current best practices. Research when uncertain.

## Testing
- Test-driven development recommended for all projects.
- Tests alongside code. Every task includes relevant tests.
- 80%+ coverage on business logic. 100% on critical paths.

## Git
- Conventional commits: feat:, fix:, chore:, docs:, refactor:, test:
- Small, focused commits. Messages explain WHY.

## Project Structure
- `docs/` - Human-facing documentation
- `spec/` - AI-facing specifications and tracking
- `spec/features/` - Feature deep-dives with task breakdowns
- `spec/tracking/` - Milestones, backlog, bugs, decisions, learnings
- `stacks/` - Language best-practice reference guides
- `src/` - Source code (feature-based organization)

## Workflow
- `spec/tracking/milestone.md` is a feature INDEX (no granular tasks).
- Granular tasks live in `spec/features/*.md` files.
- Feature spec `## Status:` is the source of truth. milestone.md mirrors it.

## Communication
- Present options in tables with emoji indicators. Always recommend one.
- After tasks: provide 3-5 QoL suggestions + 2-3 follow-ups.
- Review categories: obvious fix / needs attention / can postpone.
- Task lists: split by milestone, order quick-win to complex.

## Security
- Never read/output .env files, API keys, or credentials.
- Validate all external input with schema validation.
- Use parameterized queries. Never concatenate user input into queries.
