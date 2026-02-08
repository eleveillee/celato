# Technical Reference (Base Meta)

> **This file is base-only.** It describes the _Base project structure itself.
> The setup wizard deletes `_meta/` when converting to a real project.

Deep-dive on every file and directory in this base project.
Explains what each piece does, how they interact, and the technical
decisions behind the structure.

---

## Directory Map

```
_Base/
├── CLAUDE.md                      # Template: Claude Code project memory
├── AGENTS.md                      # Template: universal AI instructions
├── README.md                      # Template: project overview
├── .gitignore                     # Template: version control ignores
│
├── docs/                          # Template: human-facing documentation
│   └── architecture.md            #   System architecture patterns
│
├── spec/                          # Template: agent-facing specifications
│   ├── coding-standards.md        #   Parseable code rules
│   ├── workflow.md                #   Progressive tracking + feature spec templates
│   ├── api-contracts.md           #   API contracts single source of truth
│   ├── setup-wizard.md            #   Base → project transformation guide
│   ├── features/                  #   Feature deep-dives (per-project)
│   │   └── .gitkeep
│   └── tracking/                  #   Living project state
│       ├── milestone.md           #   Inline tasks (Phase 1) or index (Phase 2+)
│       ├── backlog.md             #   Ideas & future work
│       ├── bugs.md                #   Known bugs
│       ├── decisions.md           #   Technical decisions (open & resolved)
│       └── learnings.md           #   Project-specific lessons
│
├── stacks/                        # Reference: language best-practice guides
│   ├── typescript/guide.md
│   ├── python/guide.md
│   └── csharp/guide.md
│
├── .claude/                       # Config: Claude Code
│   ├── settings.json              #   Permissions and deny rules
│   ├── rules/
│   │   ├── code-rules.md          #   Code quality + testing + security
│   │   └── workflow-rules.md      #   Communication + tasks + review
│   └── commands/
│       └── review.md              #   /review slash command
│
├── .cursor/                       # Config: Cursor IDE
│   └── rules/
│       ├── 001-code-rules.mdc     #   Code quality + testing + security
│       └── 002-workflow-rules.mdc #   Communication + tasks + review
│
└── _meta/                         # Base-only: deleted during setup
    ├── technical-reference.md     #   This file (base structure docs)
    └── base-evolution.md          #   How the base iterates over time
```

---

## File Categories

### Template Files (carry to new projects, customized by wizard)
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project memory with `[REPLACE]` placeholders |
| `AGENTS.md` | Universal AI instructions, thin pointer to spec/ |
| `README.md` | Project philosophy and getting started |
| `.gitignore` | Covers TS/Python/C#/AI tools |
| `docs/architecture.md` | Architecture patterns and decision framework |
| `spec/coding-standards.md` | Code rules with language-specific sections |
| `spec/workflow.md` | Progressive tracking system + feature spec template |
| `spec/api-contracts.md` | API contracts single source of truth |
| `spec/setup-wizard.md` | Interactive base → project guide |
| `spec/tracking/*` | Empty tracking templates |
| `spec/features/.gitkeep` | Placeholder for feature specs |
| `.claude/rules/*` | Active rules (auto-loaded) |
| `.claude/settings.json` | Permission and deny rules |
| `.claude/commands/review.md` | /review slash command |
| `.cursor/rules/*` | Active rules (mirrored from .claude/) |

### Reference Files (consulted by wizard, optionally kept)
| File | Purpose |
|------|---------|
| `stacks/typescript/guide.md` | TS/Node best practices with rationale |
| `stacks/python/guide.md` | Python best practices with rationale |
| `stacks/csharp/guide.md` | C#/.NET best practices with rationale |

### Meta Files (base-only, deleted during setup)
| File | Purpose |
|------|---------|
| `_meta/technical-reference.md` | This file - documents the base itself |
| `_meta/base-evolution.md` | Tracks base iterations and version history |

---

## How .claude/ and .cursor/ Relate

Both contain the same rules, adapted for each tool's format:

| Aspect | `.claude/rules/` | `.cursor/rules/` |
|--------|-------------------|-------------------|
| Format | `.md` with optional `paths:` frontmatter | `.mdc` with `alwaysApply/globs/description` frontmatter |
| Import support | Yes (`@path/to/file`) | No (self-contained) |
| Loading | All `.md` files auto-loaded | Controlled by frontmatter |
| Scoping | `paths:` field | `globs:` field |

Rules are kept self-contained in both tools (no cross-references) because Cursor
cannot import from external files. When updating rules, edit both locations.

---

## How Tracking Works (Progressive)

Tracking grows with the project in three phases:

```
Phase 1 (MVP):          Phase 2 (Growing):          Phase 3 (Mature):

milestone.md            milestone.md                milestone.md
┌──────────────┐        ┌──────────────┐            ┌──────────────┐
│ ### Feature  │        │ ### Feature  │            │ Feature Index │
│ - [x] Task 1│        │ 🔄 → [spec] │──mirrors──►│ 🔄 | Feature │
│ - [ ] Task 2│        └──────────────┘            └──────────────┘
└──────────────┘        spec/features/f.md               │
                        ┌──────────────┐            spec/features/f.md
 Inline tasks.          │ ## Status: 🔄│◄──────────┌──────────────┐
 No spec files.         │ - [x] Task 1 │            │ Source of    │
                        │ - [ ] Task 2 │            │ truth for    │
                        └──────────────┘            │ all tasks    │
                                                    └──────────────┘
```

**Phase 1:** Tasks inline in milestone.md. Fast, low overhead for MVP.
**Phase 2:** Extract when a feature needs 10+ tasks or design docs.
**Phase 3:** milestone.md is a pure index. Feature specs own everything.
