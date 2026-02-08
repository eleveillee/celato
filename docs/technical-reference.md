# Technical Reference

Deep-dive on every file and directory in this base project.
Explains what each piece does, how they interact, and the technical
decisions behind the structure.

---

## Directory Map

```
_Base/
├── CLAUDE.md                      # [ROOT] Claude Code project memory
├── AGENTS.md                      # [ROOT] Universal AI agent instructions
├── README.md                      # [ROOT] Philosophy & overview
├── .gitignore                     # [ROOT] Version control ignores
│
├── docs/                          # [HUMAN] Human-facing documentation
│   ├── architecture.md            #   System architecture patterns
│   ├── best-practices.md          #   Cross-cutting best practices
│   └── technical-reference.md     #   This file
│
├── spec/                          # [AGENT] AI-facing specifications
│   ├── coding-standards.md        #   Parseable code rules
│   ├── project-conventions.md     #   Structural conventions
│   ├── workflow.md                #   Milestone ↔ feature tracking system
│   ├── setup-wizard.md            #   Base → project transformation guide
│   ├── features/                  #   Feature deep-dives (per-project)
│   │   └── .gitkeep
│   └── tracking/                  #   Living project state
│       ├── milestone.md           #   Feature index by milestone
│       ├── backlog.md             #   Ideas & future work
│       ├── bugs.md                #   Known bugs
│       ├── decisions.md           #   Technical decisions (open & resolved)
│       └── learnings.md           #   Project-specific lessons
│
├── stacks/                        # [REFERENCE] Language best-practice guides
│   ├── typescript/guide.md        #   TypeScript/Node.js setup guide
│   ├── python/guide.md            #   Python setup guide
│   └── csharp/guide.md            #   C#/.NET setup guide
│
├── .claude/                       # [CONFIG] Claude Code configuration
│   ├── settings.json              #   Permissions, hooks, deny rules
│   ├── rules/                     #   Topic-scoped rules (auto-loaded)
│   │   ├── code-quality.md        #   Modularity, DRY, best practices
│   │   ├── communication.md       #   Tables, emojis, follow-ups
│   │   ├── task-planning.md       #   Milestones, ordering, splitting
│   │   ├── review.md              #   Three-category review system
│   │   ├── testing.md             #   TDD approach, coverage targets
│   │   └── security.md            #   Secrets, validation, OWASP
│   └── commands/                  #   Custom slash commands
│       └── review.md              #   /review command template
│
└── .cursor/                       # [CONFIG] Cursor IDE configuration
    └── rules/                     #   Cursor-specific rules (.mdc format)
        ├── 001-general.mdc        #   Core project rules (always apply)
        ├── 002-code-quality.mdc   #   Review & task planning (always apply)
        ├── 003-communication.mdc  #   Communication format (always apply)
        └── 004-testing.mdc        #   Testing standards (always apply)
```

---

## File-by-File Reference

### Root Files

#### CLAUDE.md
- **Format:** Markdown with `@path/to/file` import syntax
- **Loaded by:** Claude Code CLI at session start
- **Max recommended size:** ~300 lines (loaded into system prompt, consumes tokens)
- **Purpose:** Project-specific memory. Contains project description, tech stack,
  commands, architecture overview, and references to detailed docs via `@imports`.
- **Hierarchy:** CLAUDE.md files in child directories load on-demand when Claude
  reads files in those directories. Parent directory CLAUDE.md files also load.
- **Template note:** In this base, CLAUDE.md contains placeholders marked with
  `[REPLACE]` that the Setup Wizard fills in.

#### AGENTS.md
- **Format:** Plain Markdown (no required schema)
- **Loaded by:** 25+ AI tools (Claude Code, Cursor, Copilot, Codex, Cline, etc.)
- **Purpose:** Universal AI instructions. Subset of CLAUDE.md that works everywhere.
- **Standard:** Backed by Linux Foundation's Agentic AI Foundation.
- **Resolution:** Closest AGENTS.md to the file being edited wins.

#### .gitignore
- **AI-specific entries:**
  - `CLAUDE.local.md` - personal Claude Code overrides
  - `.claude/settings.local.json` - personal Claude settings
- **Security entries:** `.env`, `*.key`, `*.pem` - prevents accidental secret commits
- **Lock files:** Commented out by default. Uncomment for your package manager.

---

### docs/ vs spec/ Split

| Aspect | docs/ | spec/ |
|--------|-------|-------|
| **Audience** | Human developers | AI agents |
| **Style** | Narrative, explanatory, contextual | Structured, parseable, concise |
| **Goal** | Understanding and onboarding | Precise instruction following |
| **Examples** | Architecture rationale, best practices | Coding rules, file conventions, task templates |
| **Updates** | When understanding changes | When rules or process changes |

The split exists because humans and AI agents consume information differently.
Humans need context and rationale. Agents need structured rules and clear formats.

---

### .claude/ Configuration

#### settings.json
```json
{
  "permissions": {
    "allow": [...],   // Auto-approved tool calls
    "deny": [...]     // Blocked tool calls (security)
  }
}
```

- **allow:** Tool calls that don't prompt the user. Be conservative.
- **deny:** Tool calls that are always blocked. Used primarily for secret protection.
- **Note:** `.env` files are in the deny list because `.gitignore` alone doesn't prevent
  AI tools from reading them.

#### rules/ Directory
- All `.md` files are auto-loaded with the same priority as CLAUDE.md.
- Files **without** YAML frontmatter load unconditionally (every session).
- Files **with** a `paths:` frontmatter field load only when Claude reads matching files.

```yaml
---
paths:
  - "src/api/**/*.ts"
---
# Rules that apply only to API files
```

#### commands/ Directory
- Custom slash commands available in Claude Code.
- File name = command name. `review.md` → `/review`
- Use `$ARGUMENTS` placeholder for user-provided arguments.

---

### .cursor/ Configuration

#### rules/ Directory
- Uses `.mdc` file extension (Markdown with Cursor-specific frontmatter).
- YAML frontmatter controls activation:

| Field | Type | Effect |
|-------|------|--------|
| `alwaysApply` | boolean | If true, loads every session |
| `globs` | string/array | Auto-loads when matched files are in context |
| `description` | string | Agent reads this to decide if rule is relevant |

- **Naming convention:** Three-digit prefix for ordering: `001-`, `002-`, etc.
- **Content mirrors `.claude/rules/`** with formatting adapted for Cursor's frontmatter.

---

### spec/tracking/ System

The tracking system uses a two-level approach to prevent drift between
high-level milestones and granular tasks:

```
spec/tracking/milestone.md          spec/features/feature-name.md
┌─────────────────────┐            ┌──────────────────────────────┐
│ Feature Index        │            │ Feature Spec                  │
│ ─────────────        │◄──────────│ ──────────                    │
│ Status | Feature     │  mirrors  │ ## Status: 🔄 In Progress     │
│ 🔄    | Lightning   │───────────│ ## Tasks                      │
│ ⬚     | Save System │            │ - [x] Bolt rendering          │
└─────────────────────┘            │ - [ ] Chain lightning          │
                                    │ - [ ] Collision detection      │
                                    └──────────────────────────────┘
```

**The contract:** Feature spec status is the source of truth. milestone.md mirrors it.
Granular tasks ONLY live in feature specs, never in milestone.md.

---

### stacks/ Guides

These are NOT templates to copy. They are **researched best-practice references**
that explain WHY certain tools and configurations are recommended.

The Setup Wizard reads the relevant guide and generates fresh, project-specific
configurations based on the user's answers and the guide's recommendations.

**Why guides over templates:**
- Templates go stale. Best practices evolve.
- AI can generate current configs from principles.
- Guides document rationale, which templates can't.
- Each project's needs differ slightly - a guide adapts, a template doesn't.

---

## How Files Interact

```
                    ┌──────────────┐
                    │   README.md   │  Human entry point
                    └──────┬───────┘
                           │ references
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  docs/   │ │  spec/   │ │ stacks/  │
        │ (human)  │ │ (agent)  │ │ (ref)    │
        └──────────┘ └────┬─────┘ └────┬─────┘
                          │             │
                    ┌─────┴──────┐      │
                    ▼            ▼      │
              ┌──────────┐ ┌────────┐   │
              │features/ │ │tracking│   │
              └──────────┘ └────────┘   │
                                        │
        ┌──────────┐  ┌──────────┐      │
        │CLAUDE.md │  │AGENTS.md │      │
        │(@imports)│  │(universal│      │
        └────┬─────┘  └──────────┘      │
             │ references               │
             ▼                          │
        ┌──────────┐                    │
        │.claude/  │                    │
        │ rules/   │◄──────────────────┘
        │ commands/│    setup wizard
        └──────────┘    consults stacks/
```

1. **README.md** is the human entry point. Points to docs/ for detail.
2. **CLAUDE.md** and **AGENTS.md** are AI entry points. Reference spec/ files.
3. **spec/setup-wizard.md** consults **stacks/** guides to generate project configs.
4. **.claude/rules/** and **.cursor/rules/** contain active rules loaded every session.
5. **spec/tracking/** files are living state updated throughout the project lifecycle.
6. **spec/features/** files are created per-feature and own their task breakdowns.
