# AI Project Base

A starting point for all AI-assisted software projects. This base provides
structure, conventions, and best practices that work with both **Cursor IDE**
and **Claude Code CLI** (and any other AI coding tool that supports AGENTS.md).

---

## Philosophy

### The Problem
Every new project starts with the same questions: How should I structure this?
What conventions should I follow? How do I communicate effectively with AI tools?
How do I track progress without losing context?

### The Solution
This base answers those questions once, consistently, across all projects.
It provides:

1. **Rules that AI agents follow** - coding standards, communication formats,
   review processes, and task planning conventions.
2. **A tracking system that grows with the project** - start with inline tasks,
   extract to feature specs when complexity demands it, with a clear contract at each phase.
3. **Language-agnostic best practices** - with stack-specific reference guides
   that AI uses to generate fresh, tailored configurations per project.
4. **A clear split between human and AI documentation** - humans get readable
   guides in `docs/`, AI agents get structured rules in `spec/`.

### Core Beliefs
- **AI tools are collaborators, not autocomplete.** They need context, rules,
  and structure to be effective.
- **Start simple, add complexity only when needed.** Three similar lines of code
  are better than a premature abstraction.
- **Test everything.** Even game engines, even visual tools. There's always
  a way to test.
- **Small files, small functions, small commits.** Humans and AI both work
  better with focused, digestible units.
- **Research best practices, don't guess.** When uncertain, look it up.
  Encode what you learn so future projects benefit.

---

## Project Structure

```
_Base/
├── CLAUDE.md              # Claude Code: project memory & instructions
├── AGENTS.md              # Universal: AI agent instructions (all tools)
├── README.md              # This file
├── .gitignore
│
├── docs/                  # For humans: architecture and patterns
│   └── architecture.md
├── spec/                  # For AI: standards, tracking, features
│   ├── coding-standards.md
│   ├── workflow.md
│   ├── api-contracts.md
│   ├── setup-wizard.md
│   ├── features/          # Feature deep-dives (created per project)
│   └── tracking/          # Milestones, backlog, bugs, decisions, learnings
├── stacks/                # Language best-practice guides (TS, Python, C#)
│
├── .claude/               # Claude Code config (rules, commands, settings)
├── .cursor/               # Cursor IDE config (rules)
└── _meta/                 # Base-only files (deleted during project setup)
```

### The Tracking System

Tracking is progressive — it grows with the project:

- **Phase 1 (MVP):** Tasks live inline in `spec/tracking/milestone.md` under each
  feature heading. No feature spec files needed. Fast, low overhead.
- **Phase 2 (Growing):** When a feature needs 10+ tasks or design docs, extract it
  to `spec/features/feature-name.md`. milestone.md becomes a pointer to the spec.
- **Phase 3 (Mature):** `milestone.md` is a pure index. Feature specs own all
  granular tasks. Feature spec status is the source of truth.

This prevents premature overhead while still scaling to complex projects.
See `spec/workflow.md` for the full system and transition triggers.

Additional tracking:
- **`backlog.md`** - Ideas and future work not yet in a milestone.
- **`bugs.md`** - Known bugs with repro steps and severity.
- **`decisions.md`** - Open and resolved technical decisions (lightweight ADRs).
- **`learnings.md`** - Project-specific lessons learned (shared, committed knowledge).

---

## Getting Started

### Starting a New Project

1. Copy this base to your new project directory.
2. Open it in Cursor or with Claude Code CLI.
3. Tell the AI: "Follow the setup wizard at `spec/setup-wizard.md`".
4. The wizard will walk through an interactive setup:
   - Project name and description
   - Tech stack selection
   - Configuration generation (using `stacks/` guides)
   - Initialize tracking files
   - Customize CLAUDE.md and AGENTS.md

### Working on a Project

1. Check `spec/tracking/milestone.md` for current status and tasks.
2. Pick a feature to work on from the current milestone.
3. Work through tasks in priority order (quick-wins first).
4. When a feature outgrows inline tracking, extract it to `spec/features/feature-name.md`.
5. Update status in milestone.md (and the feature spec, if one exists).

### AI Communication Conventions

AI agents following this base's rules will:
- Present options in tables with a recommended approach.
- After every task, suggest 3-5 polish items and 2-3 follow-ups.
- Split reviews into: obvious fixes / needs attention / can postpone.
- Order task lists from quick-wins to complex.

---

## Customization

### Adding New Rules
- Claude Code: add `.md` files to `.claude/rules/`.
- Cursor: add `.mdc` files to `.cursor/rules/`.
- Both are auto-loaded. Keep rules in sync between tools.

### Adding New Stacks
- Create a new directory under `stacks/` (e.g., `stacks/rust/guide.md`).
- Follow the pattern of existing guides: rationale first, then recommendations.

### Personal Preferences
- Create `CLAUDE.local.md` at root for personal Claude Code overrides (gitignored).
- These override project rules for your local environment only.

---

## Reference

| Document | Purpose |
|----------|---------|
| [Architecture](docs/architecture.md) | System architecture patterns and principles |
| [Coding Standards](spec/coding-standards.md) | Parseable code rules for AI agents |
| [Workflow](spec/workflow.md) | Progressive tracking system (Phase 1 → 2 → 3) |
| [API Contracts](spec/api-contracts.md) | Single source of truth for API shapes |
| [Setup Wizard](spec/setup-wizard.md) | Interactive guide to convert base into a project |
