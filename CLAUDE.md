# [REPLACE: Project Name]

[REPLACE: One-sentence project description.]

## Tech Stack
[REPLACE: List your tech stack after running the Setup Wizard]

## Commands
[REPLACE: Add your project commands after setup]
```
# Example (replace with actual commands):
# npm run dev       - Start dev server
# npm run test      - Run tests
# npm run check     - Lint and format check
```

## Architecture
[REPLACE: Brief architecture overview. See spec/architecture.md for patterns.]

## Workflow
Tracking starts inline and extracts organically — see @spec/workflow.md for full details:
- **Inline:** Tasks live in `spec/tracking/milestone.md` under each feature. Start here.
- **Extracted:** When a feature outgrows inline (10+ tasks, needs design docs), extract to `spec/features/`.
  - Simple features → single file. Complex features → folder with `tasks.md` + `design.md`.
- milestone.md gradually becomes an index as features get extracted. No hard switch.
- AI agents should detect when extraction is needed and help transition gracefully.

## Spec Lookup Table

| When you need to... | Read this |
|----------------------|-----------|
| Write or review code | @spec/coding-standards.md |
| Understand tracking workflow | @spec/workflow.md |
| Define or consume an API | @spec/api-contracts.md |
| Understand architecture patterns | @spec/architecture.md |
| Check current project status | @spec/tracking/milestone.md |
| Log or check bugs | @spec/tracking/bugs.md |
| Record a lesson learned | @spec/tracking/learnings.md |
| Make or review a decision | @spec/tracking/decisions.md |
| Check dependency versions | @spec/tracking/version-matrix.md |
| Track code quality debt | @spec/tracking/tech-debt.md |
| Browse future ideas | @spec/tracking/backlog.md |

## ID Conventions
All tracking items use prefixed IDs for cross-referencing: `F-001` (features), `B-001` (bugs), `L-001` (learnings), `D-001` (decisions), `BL-001` (backlog), `TD-001` (tech debt), `UP-001` (upgrades). See `milestone.md` for full reference.

## Project-Specific Rules
[REPLACE: Add rules specific to this project. Examples:]
- [REPLACE: "NEVER modify files in src/generated/ - these are auto-generated"]
- [REPLACE: "The legacy/ directory uses CommonJS - do not convert to ESM"]

## Getting Started
1. Read this file and the spec lookup table above.
2. Check `spec/tracking/milestone.md` for current project status.
3. Check `spec/tracking/bugs.md` for known issues.
4. Check `spec/tracking/decisions.md` for open questions.

## Setup
To convert this base into a project-specific setup, follow @spec/setup-wizard.md.
