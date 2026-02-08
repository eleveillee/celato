# [REPLACE: Project Name]

[REPLACE: One-sentence project description.]

## Tech Stack
[REPLACE: After setup wizard]

## Commands
[REPLACE: After setup wizard]

## Principles
- Modular code, single responsibility. Max ~300 lines per file, ~50 per function.
- Test-driven development. Every task includes relevant tests.
- Research best practices. Don't guess.
- Named exports. Early returns. Guard clauses.
- Conventional commits: feat:, fix:, chore:, docs:, refactor:, test:
- Never read/output .env files, API keys, or credentials.

## Project Structure
- `spec/` - Architecture, standards, tracking, and feature specs
- `spec/features/` - Feature deep-dives with task breakdowns
- `spec/tracking/` - Milestones, backlog, bugs, decisions, learnings, tech-debt, versions
- `src/` - Source code (feature-based organization)

## Key Files
- `spec/coding-standards.md` - Detailed code rules with language-specific sections
- `spec/workflow.md` - Progressive tracking system (Phase 1 inline → Phase 2 extract → Phase 3 index)
- `spec/api-contracts.md` - API contracts single source of truth (when applicable)

## Communication
- Options in tables with emoji indicators. Always recommend one.
- After tasks: 3-5 QoL suggestions + 2-3 follow-ups.
- Reviews: 🔴 obvious fix / 🟡 needs attention / 🟢 can postpone.
- Task lists: split by milestone, order quick-win to complex.
