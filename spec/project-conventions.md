# Project Conventions

This file defines the structural and organizational conventions for all projects
built from this base. AI agents should follow these conventions when creating
or modifying project structure.

---

## Directory Structure Philosophy

Projects use a **two-directory documentation split**:

| Directory | Audience | Purpose |
|-----------|----------|---------|
| `docs/` | Humans | Readable guides, architecture, best practices |
| `spec/` | AI agents | Parseable rules, feature specs, tracking, workflow |

## Standard Directories

```
project-root/
├── CLAUDE.md              # Claude Code project memory
├── AGENTS.md              # Universal AI agent instructions
├── README.md              # Human project overview
├── .gitignore
├── docs/                  # Human-facing documentation
├── spec/                  # Agent-facing specifications
│   ├── features/          # Feature deep-dives and task breakdowns
│   └── tracking/          # Project state (milestones, backlog, bugs)
├── stacks/                # Language best-practice reference guides
├── .claude/               # Claude Code config
│   ├── settings.json
│   ├── rules/
│   └── commands/
├── .cursor/               # Cursor IDE config
│   └── rules/
└── src/                   # Source code (structure varies by project)
```

## Feature Spec Convention

Each feature gets its own spec file at `spec/features/feature-name.md`:

```markdown
# Feature: [Name]
## Status: ⬚ Not Started | 🔄 In Progress | ✅ Complete
## Milestone: [Which milestone this belongs to]

## Overview
[What this feature does and why it exists]

## Requirements
[Specific, testable requirements]

## Design
[Technical approach, data models, API surface]

## Tasks
### 🟢 Quick Wins
- [ ] Task 1
- [ ] Task 2

### 🟡 Core
- [ ] Task 3
- [ ] Task 4

### 🔴 Complex
- [ ] Task 5
```

## Naming Conventions

### Files & Directories
- Directories: `kebab-case` always
- Config files: tool-specific conventions (e.g., `tsconfig.json`, `pyproject.toml`)
- Documentation: `kebab-case.md`
- Feature specs: `spec/features/feature-name.md`

### Branching (Git)
- `main` or `master`: production-ready
- `feat/feature-name`: new features
- `fix/bug-description`: bug fixes
- `chore/task-description`: maintenance tasks

## Environment Setup
- Every project MUST have a `.env.example` with all required variables documented.
- Variable names: `UPPER_SNAKE_CASE`
- Group variables by service with comments:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Auth
JWT_SECRET=your-secret-here
JWT_EXPIRY=3600

# External APIs
STRIPE_SECRET_KEY=sk_test_...
```
