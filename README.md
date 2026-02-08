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
2. **A tracking system that doesn't drift** - milestones index features,
   feature specs own granular tasks, and there's a clear contract between them.
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

The project uses a two-level tracking approach:

- **`spec/tracking/milestone.md`** - High-level index of features by milestone.
  Tracks WHAT, not HOW. No granular tasks.
- **`spec/features/*.md`** - Feature-level deep-dives with granular task breakdowns.
  Each feature spec is a self-contained mini-project.

The contract: feature spec status is the source of truth. milestone.md mirrors it.
This prevents the common problem of milestone plans drifting out of sync with
actual feature progress.

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

1. Check `spec/tracking/milestone.md` for current status.
2. Pick a feature to work on from the current milestone.
3. Open or create its spec at `spec/features/feature-name.md`.
4. Work through tasks in priority order (quick-wins first).
5. Update status in both the feature spec and milestone.md.

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
| [Workflow](spec/workflow.md) | Milestone and feature tracking system |
| [Setup Wizard](spec/setup-wizard.md) | Interactive guide to convert base into a project |
