# Global Rules Comparison (2026-02-12)

## Summary

Claude Code uses `~/.claude/CLAUDE.md` for global rules.
Cursor uses project-specific `.cursor/rules/*.mdc` files (no global rules directory found).

**Key Finding:** There's a **philosophical conflict** on over-engineering that needs resolution.

---

## ✅ In Sync

| Rule | Claude | Cursor | Status |
|------|--------|--------|--------|
| Options table format | ✅ | ✅ communication.mdc | Identical |
| Review 3-category system (🔴🟡🟢) | ✅ | ✅ communication.mdc | Identical |
| File reference format (`path:line`) | ✅ | ✅ communication.mdc | Identical |
| Task completion (3-5 QoL + 2-3 follow-ups) | ✅ | ✅ communication.mdc | Identical |
| Modularity (~300 lines/file, ~50/function) | ✅ | ✅ engineering.mdc | Identical |
| Task planning (milestone-based, ordered) | ✅ | ✅ workflow.mdc | Identical |
| Security (no secrets, validation) | ✅ | ✅ engineering.mdc | Identical |
| Bug/Learning logging with severity | ✅ | ✅ workflow.mdc | Identical |
| ID System (F-###, D-###, etc.) | ✅ | ✅ workflow.mdc | Identical |

---

## ⚠️ Drift Detected

| Rule | Claude | Cursor | Recommendation |
|------|--------|--------|----------------|
| **Over-engineering stance** | "No over-engineering. Only build what's asked for" | "Slightly over-engineer for extensibility rather than under-engineer for speed" | **CONFLICT - Needs resolution** |
| Testing approach | "TDD approach. Tests for everything" | "AAA pattern. 80%+ coverage" | Merge both (TDD + AAA + coverage targets) |
| Modern tooling | Lists: Biome, Vitest, Ruff, uv, pnpm | Lists: uv, System.Text.Json, latest stable | Merge both lists |
| DRY threshold | "Three similar lines > premature DRY" | "Apply when logic is genuinely shared (3+ usages)" | **Consistent** - Claude is more specific |
| Code style details | "Named exports. Early returns. Guard clauses" | Not mentioned | Add to Cursor |
| API Contracts | Not mentioned globally | "Define in spec/api-contracts.md before implementation" | Add to Claude |
| Infrastructure-First | Not mentioned | "Update specs/tracking before or during work, never just after" | Add to Claude |

---

## 🔄 Cursor-Only Rules

Rules in Cursor that aren't in Claude Code:

### Project-Specific (Keep in Cursor only)
- **autonomous-roles.mdc** (GITC/GITM) - Keystone/Helix-specific architecture pattern

### Should Promote to Claude Global?
- **"Golden Path" Principle**: Build for the End State, skip throwaway prototypes
- **Infrastructure-First**: Update specs/tracking during work, not after
- **Modern Defaults**: Explicit list (uv over pip, System.Text.Json over Newtonsoft, latest stable version)
- **API Contracts**: Define in spec/api-contracts.md before implementation

---

## 🔄 Claude-Only Rules

Rules in Claude Code that aren't in Cursor:

### Should Promote to Cursor?
- **"My Workflow" tracking details**: Feature specs own tasks, Milestone.md owns delivery order
- **"No premature abstraction"**: Three similar lines > premature DRY
- **"Research best practices before implementing. Don't guess"**
- **Code style specifics**: Named exports, early returns, guard clauses
- **Tech Preferences**: TypeScript (Node), Python, C#, Biome, Vitest, Ruff, uv, pnpm

---

## 🗑️ Cleanup Candidates

None identified. All rules appear active and useful.

---

## 🚨 Critical Issue: Over-Engineering Conflict

**Claude Code says:**
> "No over-engineering. Only build what's asked for."

**Cursor says:**
> "Slightly over-engineer for extensibility rather than under-engineer for speed."

**Impact:** AI gets contradictory guidance depending on which tool is being used.

**Recommended Resolution:**

Replace both with unified guidance:

```markdown
## Engineering Balance
- **Build for the current requirement**, not hypothetical future needs
- **Use robust patterns** (error handling, validation, typing) from the start
- **Avoid speculative features** ("We might need X later")
- **Prefer extensible designs** when the cost is negligible (interfaces over concrete types, config over hardcoding)
- **Three similar lines > premature abstraction** - wait for the third use case before DRYing

**In practice:**
- ✅ Add proper error handling even if the happy path works
- ✅ Use typed configs instead of magic strings
- ❌ Don't add "just in case" features not in requirements
- ❌ Don't build plugin systems before you have a second plugin
```

---

## Sync Action Plan

### 1. Resolve Over-Engineering Conflict
Eric should decide which philosophy to adopt (see recommendation above).

### 2. Add to Claude Code (`~/.claude/CLAUDE.md`)

Under **Code Preferences**, add:
```markdown
- Define API contracts in `spec/api-contracts.md` before implementation.
- Update specs and tracking files during work, not just after.
```

Under **My Workflow**, add:
```markdown
- Research best practices before implementing. Don't guess.
```

### 3. Add to Cursor (`.cursor/rules/engineering.mdc`)

In **Best Practices** section, add:
```markdown
- **Code Style**: Named exports only. Use early returns and guard clauses.
- **DRY Threshold**: Three similar lines > premature DRY. Wait for genuine reuse patterns.
```

### 4. Merge Modern Tooling Lists

Create unified list in both:
```markdown
- **Python**: `uv` over `pip`, latest stable
- **C#**: `System.Text.Json` over `Newtonsoft`, latest stable
- **TypeScript/Node**: Biome, Vitest, pnpm, latest stable
- **General**: Prefer tools with clear error messages and good AI compatibility
```

### 5. Promote "Golden Path" to Claude

Add to Claude Code under **My Workflow**:
```markdown
- Build for the end state. Skip educational refactors or throwaway prototypes.
```

---

## Next Sync

Scheduled for: **2026-05-12** (quarterly)
