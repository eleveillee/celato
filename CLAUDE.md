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
[REPLACE: Brief architecture overview. See docs/architecture.md for patterns.]

## Workflow
Tracking is progressive — see @spec/workflow.md for full details:
- **Phase 1 (MVP):** Tasks live inline in `spec/tracking/milestone.md`.
- **Phase 2:** Extract to `spec/features/*.md` when a feature needs 10+ tasks or design docs.
- **Phase 3:** `milestone.md` becomes a pure index; feature specs own all tasks.

## Key References
- @spec/coding-standards.md - Code rules for AI agents
- @spec/workflow.md - Milestone and feature tracking workflow
- @docs/architecture.md - Architecture patterns and principles

## Project-Specific Rules
[REPLACE: Add rules specific to this project. Examples:]
- [REPLACE: "NEVER modify files in src/generated/ - these are auto-generated"]
- [REPLACE: "The legacy/ directory uses CommonJS - do not convert to ESM"]

## Getting Started
1. Read this file and the references above.
2. Check `spec/tracking/milestone.md` for current project status.
3. Check `spec/tracking/bugs.md` for known issues.
4. Check `spec/tracking/decisions.md` for open questions.

## Setup
To convert this base into a project-specific setup, follow @spec/setup-wizard.md.
