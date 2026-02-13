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
Projects progress through **Vertical Slices (VS)** — complete, verifiable increments. See @spec/workflow.md for full details:
- **VS-0 First:** Every project starts with "The Walking Skeleton" — minimal runnable loop
- **Inline:** Tasks live in `spec/tracking/slices/vsN_name.md` under each feature. Start here.
- **Extracted:** When a feature outgrows inline (10+ tasks, needs design docs), extract to `spec/features/`.
  - Simple features → single file. Complex features → folder with `tasks.md` + `design.md`.
- **Feature specs own granular tasks. VS docs own delivery order.** As features extract,
  VS docs reference feature phases in build order, not individual tasks.
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
| Check feature health & verification status | @spec/tracking/qa.md |

## ID Conventions
All tracking items use **3-letter mnemonic tags**: `[Type]-[Number]-[TAG]`. Examples: `VS-000-SKE` (Skeleton), `F-012-INV` (Inventory), `D-005-ARC` (Architecture), `B-003-LTO` (Login TimeOut). See `milestone.md` and `workflow.md` for full reference and tag conventions.

## Project-Specific Rules
[REPLACE: Add rules specific to this project. Examples:]
- [REPLACE: "NEVER modify files in src/generated/ - these are auto-generated"]
- [REPLACE: "The legacy/ directory uses CommonJS - do not convert to ESM"]

## Session Start (Every Session)
AI agents should do this at the start of every conversation, not just the first one:
1. Read this file and the spec lookup table above.
2. Check `spec/tracking/milestone.md` for current status and next steps.
3. Check `spec/tracking/bugs.md` for known issues.
4. Check `spec/tracking/decisions.md` for open/blocking questions.

## Setup
To convert this base into a project-specific setup, follow @spec/setup-wizard.md.
