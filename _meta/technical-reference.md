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
├── spec/                          # Architecture, standards, tracking, features
│   ├── architecture.md            #   Architecture patterns & decision framework
│   ├── coding-standards.md        #   Parseable code rules
│   ├── workflow.md                #   Progressive tracking + feature spec templates
│   ├── api-contracts.md           #   API contracts single source of truth
│   ├── setup-wizard.md            #   Base → project transformation guide
│   ├── features/                  #   Feature deep-dives (per-project)
│   │   └── .gitkeep
│   ├── research/                  #   Competitive/market research (optional)
│   │   └── .gitkeep
│   └── tracking/                  #   Living project state
│       ├── milestone.md           #   Inline tasks (Phase 1) or index (Phase 2+)
│       ├── backlog.md             #   Ideas & future work (BL-###)
│       ├── bugs.md                #   Known bugs (B-###)
│       ├── decisions.md           #   Technical decisions (D-###)
│       ├── learnings.md           #   Project-specific lessons (L-###)
│       ├── tech-debt.md           #   Technical debt tracking (TD-###)
│       └── version-matrix.md     #   Dependency versions & upgrades (UP-###)
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
    ├── base-evolution.md          #   How the base iterates over time
    └── references/                #   Real project patterns for comparison
        ├── tagexpert.md           #   SaaS/Next.js patterns (TagExpert)
        └── helix.md              #   Game engine/C# patterns (Helix)
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
| `spec/architecture.md` | Architecture patterns and decision framework |
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

## How Tracking Works (Two-Phase)

```
INLINE (start here):            EXTRACTED (when needed):

milestone.md                    milestone.md
┌──────────────┐                ┌──────────────┐
│ ### Feature  │   ──extract──► │ 🔄 → [spec] │
│ - [x] Task 1│                └──────┬───────┘
│ - [ ] Task 2│                       │ mirrors
└──────────────┘                      ▼
                                spec/features/
                                ┌──────────────────────────┐
                                │ Simple: feature-name.md  │
                                │ Complex: feature-name/   │
                                │   ├── tasks.md           │
                                │   └── design.md          │
                                └──────────────────────────┘
```

**Inline:** Tasks in milestone.md. Where every project starts.
**Extracted:** Feature gets its own file or folder in `spec/features/`.
milestone.md gradually becomes an index as more features extract. No hard switch.
AI detects when extraction is needed and helps transition.
