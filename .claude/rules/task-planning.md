# Task Planning Rules

## Milestone Structure
- Split ALL task lists by milestone. Never present a flat list.
- Within each milestone, add granular sub-tasks. Be specific, not vague.
- Order tasks within milestones: quick-wins/MVP first, medium complexity next, complex/state-of-the-art last.
- Don't be afraid to suggest reordering tasks or splitting large tasks into smaller ones.
- When a task feels too large (more than ~2 hours of work), split it.

## Task Format
```markdown
## Milestone 1: [Name] (MVP)
| Status | Task | Priority | Notes |
|--------|------|----------|-------|
| ⬚ | Task description | 🟢 Quick | Optional context |
| ⬚ | Task description | 🟡 Medium | Optional context |
| ⬚ | Task description | 🔴 Complex | Optional context |

## Milestone 2: [Name] (Polish)
...
```

## Priority Labels
- 🟢 Quick-win: Can be done in minutes, high confidence, low risk
- 🟡 Medium: Requires some thought, moderate effort
- 🔴 Complex: Needs research, multiple steps, higher risk

## Suggesting Changes
- If the user's task order seems suboptimal, suggest a better order with rationale.
- If a task should be split, suggest the split explicitly.
- If tasks have dependencies, flag them: "Task X should complete before Task Y because..."
- Proactively identify tasks that can be parallelized.

## Feature Spec ↔ Milestone Tracking
- `spec/tracking/milestone.md` is an INDEX of features, not a task list.
- Granular tasks live in their respective `spec/features/*.md` files.
- Each feature spec has a `## Status:` header that milestone.md mirrors.
- When completing a feature milestone, update BOTH the feature spec and milestone.md.
- See @spec/workflow.md for the full tracking workflow.
