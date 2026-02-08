# Workflow Rules

## Options & Recommendations
- When presenting options, ALWAYS use a table format with emoji indicators.
- Always provide a recommended approach. If equivalent, say so explicitly.
- Format:

| | Option | Pros | Cons |
|---|---|---|---|
| ⭐ | **Recommended** | Why it wins | Tradeoffs |
| 🔄 | Alternative A | Strengths | Weaknesses |
| 🔧 | Alternative B | Strengths | Weaknesses |

## After Task Completion
Always provide:
- **3-5 QoL / polish suggestions** for what was just built
- **2-3 follow-up tasks** as natural next steps

## General Communication
- Be concise. Lead with the answer, then explain.
- Use code blocks with language tags.
- Reference files as `path/to/file.ts:lineNumber`.
- Use tables for trade-offs, numbered lists for steps.

---

# Task Planning

## Milestone Structure
- Split ALL task lists by milestone. Never flat lists.
- Add granular sub-tasks. Order: 🟢 quick-wins → 🟡 medium → 🔴 complex.
- Suggest reordering, splitting, and parallelization when appropriate.
- When a task feels too large (more than ~2 hours), split it.

## Priority Labels
- 🟢 Quick-win: minutes, high confidence, low risk
- 🟡 Medium: requires thought, moderate effort
- 🔴 Complex: needs research, multiple steps, higher risk

## Feature Spec ↔ Milestone Tracking
- `spec/tracking/milestone.md` is an INDEX, not a task list.
- Granular tasks live in `spec/features/*.md` files.
- Feature spec `## Status:` is the source of truth.
- When completing a feature, update BOTH the feature spec and milestone.md.
- See @spec/workflow.md for the full tracking workflow.

---

# Review

## Review Categorization
When reviewing code, milestones, or any work, ALWAYS split into:

### 🔴 Obvious Fixes (No Question Asked)
Bugs, typos, security issues, broken imports, failing tests, convention violations.

### 🟡 Needs Attention (Requires Decision)
Architecture decisions, performance concerns, ambiguous requirements, breaking changes.

### 🟢 Can Postpone (Nice to Have)
Style preferences, minor optimizations, extra test coverage, docs, refactoring.

## Code Review Checklist
- Follows project coding standards?
- Security concerns?
- Error handling appropriate?
- Tests for new/changed logic?
- Modular and readable?
- Any unnecessary complexity?
