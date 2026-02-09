# Reference: Helix

> **Project:** 2D game engine with true hot-reload via .NET AssemblyLoadContext.
> **Stack:** .NET 10, C#, Veldrid (GPU), SDL3 (windowing), ImGui.NET (editor), BepuPhysics v2.
> **Status at time of capture:** Post-C4 foundation, C5-C7 active development.
> **Source:** `C:\Eric\Projects\Cursor\Helix`

---

## What This Project Validates

Helix is a large, complex C# project that predates Codex. It demonstrates what happens
with extensive AI-assisted development over many months. Both good patterns and bloat
are instructive for Codex design.

---

## Spec Structure (150+ files)

```
spec/
├── MILESTONES.md         # Roadmap C4-C15, dependency graphs, parallel work tracks
├── ARCHITECTURE.md       # 3-tier architecture, hot-reload constraints
├── API-CONTRACTS.md      # Single source of truth for ECS APIs
├── agents.md             # GITC/GITM/GITG philosophy (AI trinity)
├── learnings.md          # 44+ entries, auto-generated from JSON
├── BACKLOG.md            # Future features
├── GHOST_BRAIN.md        # Multi-tier memory system
├── progress.json         # Machine-readable task tracking
├── PRD.md                # Product requirements document
├── Bugs/                 # 30+ bug reports (B024-B029)
├── Feature/              # 85+ feature specifications
├── Reports/              # Session summary reports
├── Research/             # Technical deep-dives
└── knowledge/            # Library docs, patterns, learning database
    ├── libraries/        # External library API references
    ├── patterns/         # ECS patterns, hot-reload cookbook
    ├── learnings.json    # Structured learning database (44 entries)
    ├── gitm_errors.json  # Compilation error patterns (GE001-GE013)
    └── gitm_patterns.json # Feature implementation templates
```

**Bloat note:** 150+ files is excessive. Many features documented but never reached milestones.
85+ feature files with no pruning. Codex's progressive extraction prevents this.

---

## Patterns Worth Stealing (applied to Codex)

### 1. Success Conditions on Bugs
Every bug has: "Bug is FIXED when: [observable outcomes]". Enables AI self-verification.
**Applied:** Added success condition template to `bugs.md`.

### 2. Bad/Good Pattern Examples in Learnings
Not just text descriptions — actual code showing what NOT to do and what TO do instead.
**Applied:** Added learning detail template with bad/good code patterns.

### 3. Severity Levels on Learnings
Critical/High/Medium/Low — AIs know which learnings to prioritize.
**Applied:** Added severity column and levels to `learnings.md`.

---

## Architecture Patterns

### Four-Tier Hot-Reload Architecture
```
Tb (Bootstrap) → Binary, window, GPU device, Roslyn compiler
T0 (Engine)    → ECS, services, editor (experimental hot-reload)
T1 (Game API)  → Components, interfaces (stable, rare cascade)
T2 (Game Logic) → User systems, scripts (frequent hot-reload on file save)
```

**Lesson:** Hot-reload requires strict tier discipline. Higher tiers depend on lower;
lower tiers never reference higher. Breaking this causes cascade reloads or crashes.

### ECS (Entity Component System)
- **Components:** Pure data, no logic. Structs with fields.
- **Systems:** Stateless logic. Query components, process, mutate.
- **Critical:** NO static fields in systems (breaks hot-reload). Query fresh each frame.

### Service API Pattern
Services are the bridge between engine (T0) and game code (T2):
```csharp
public interface IInputService { bool IsKeyDown(Key key); }
public interface IRenderService { void DrawSprite(SpriteHandle handle, ...); }
```
Game code only accesses engine through service interfaces. Never direct T0 references.

---

## AI Agent Architecture (GITC/GITM/GITG)

Three AI personas with different access levels:

| Agent | Role | Access |
|-------|------|--------|
| **GITC** | Engine architect | Full T0/T1 access, builds engine |
| **GITM** | Game developer | T1/T2 only, builds games using engine API |
| **GITG** | Narrative AI | No code access, generates stories/dialogue |

**GITM restriction:** Cannot modify T0. If T0 changes needed, must ask GITC.
This enforces the tier boundary even for AI agents.

---

## Ghost Brain (Multi-Tier Learning)

Three-level knowledge system:

| Level | Scope | Storage | Promotion |
|-------|-------|---------|-----------|
| **L2** | Project-specific | `.helix/memory/L2-project.json` | Pattern seen 3x → L3 |
| **L3** | User-global | `~/.helix/memory/L3-user.json` | Pattern in 10 projects → L4 |
| **L4** | Engine-wide | `spec/knowledge/*.json` | Baked into engine |

**Lesson:** Elegant concept but only L2 is fully implemented. L3/L4 promotion is manual.
For Codex, Claude's auto-memory (`~/.claude/projects/`) covers L2 functionality.

---

## Structured Learning Database

`spec/knowledge/learnings.json` — 44 entries with structured format:

```json
{
  "id": "L056",
  "keyword": "system-lifecycle-onstart-onhotreload",
  "category": "architecture",
  "severity": "Critical",
  "discovered": "2026-01-28",
  "related_bug": "B027",
  "summary": "Use OnStart for entity creation, not OnLoad",
  "bad_pattern": "public void OnLoad(IWorld w) { w.CreateEntity(...); }",
  "good_pattern": "public void OnStart(IWorld w) { w.CreateEntity(...); }",
  "insight": "OnLoad runs on every hot-reload; OnStart runs once"
}
```

**Lesson:** JSON-based learnings are searchable by keyword and auto-generate markdown.
Good for large projects (44+ entries). For smaller projects, markdown tables suffice.

---

## Error Pattern Catalog (GE-###)

GITM compilation errors cataloged with bad→good patterns:

| ID | Pattern | Fix |
|----|---------|-----|
| GE001 | Key enum cast needed | Now supported directly |
| GE002 | Static fields in Systems | FORBIDDEN — breaks hot-reload |
| GE003 | Missing Vector2/Vector3 import | Use `using Helix.API;` |
| GE004 | Static Input usage | Use `_input` service instead |
| GE005 | Missing entity ID in GetComponent | Always pass `entityId` |
| GE013 | First line of Update | Must check `_input.IsKeyboardCapturedByUI` |

**Lesson:** Domain-specific error catalogs are valuable for AI agents that generate code.
Not applicable to Codex (too project-specific) but good pattern for game/compiler projects.

---

## What Worked

| Pattern | Why |
|---------|-----|
| `.cursorrules` as single AI master file | All AI behavior defined in one place |
| Bug files with success conditions | AI can self-verify fixes |
| Structured learnings with keyword search | Prevents re-discovering known issues |
| Tier discipline enforced in rules | Hot-reload never breaks if tiers respected |
| Asset catalog with art direction prompts | DALL-E generates consistent assets |

## What Didn't Work (Bloat Warnings)

| Pattern | Problem |
|---------|---------|
| 150+ spec files with no pruning | Many stale, hard to find anything |
| 85+ feature files (many never started) | Speculative docs become noise |
| 1400-line .cursorrules monolith | Hard to maintain, lots of duplication |
| ~40% overlap .cursorrules ↔ CLAUDE.md | Same rules in two places, drift |
| Session reports in spec/Reports/ | Became bloat fast, git log is better |
| Feature files mixing tasks + design + research | Single files grew to 94KB+ |

**Key takeaway:** Codex's two-phase tracking (inline → extracted) with folder split
for complex features directly addresses Helix's biggest bloat problems.
