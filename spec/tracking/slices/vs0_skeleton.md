# VS-000-SKE: The Walking Skeleton

## Status: ⬚ Not Started

## Philosophy

The Walking Skeleton is **not** scaffolding, boilerplate, or setup. It's the simplest version
of your product that runs end-to-end. It proves the tech stack works and establishes your
development loop.

**Examples:**
- **Game**: Player spawns and can move in an empty world
- **Dashboard**: Shows one metric from hardcoded data, renders correctly
- **API**: One endpoint returns "Hello World" with proper authentication
- **CLI Tool**: Accepts one command, processes it, prints output

**What to defer:**
- Polish, UI/UX refinement
- Error handling beyond basic validation
- Optimization, caching, performance tuning
- Edge cases and comprehensive testing (beyond smoke tests)
- Architecture that isn't needed yet

---

## Goal

> [REPLACE: One sentence describing what "runnable" looks like for this project]
>
> Example: "A dashboard that fetches one metric from a mock API and displays it in a chart."

---

## Success Criteria

The Walking Skeleton is DONE when:
- [ ] The project runs without errors from a clean setup
- [ ] The core loop executes (game loop, request/response, CLI command flow)
- [ ] At least one observable behavior proves the system works
- [ ] Development workflow is established (run, test, debug cycle)
- [ ] Basic testing infrastructure is in place (one passing test)

---

## Blocking Decisions

> List any decisions that MUST be resolved before starting VS-0:
> - D-001-RND: Which rendering library? (Three.js vs Babylon.js)
> - D-002-AUT: Authentication approach? (JWT vs sessions)
>
> If no blocking decisions, write "None — defer architecture until proven necessary."

_Blocking decisions:_ [REPLACE]

---

## Features (Inline Tasks)

> Start with inline tasks. Extract to `spec/features/` only when a feature grows to 10+ tasks.

### F-001-[TAG]: [Minimal Feature 1] ⬚
> [One sentence: what this feature does]
> Example TAG: F-001-MVP for "Minimum Viable Player", F-001-RND for "Renderer"

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### F-002-[TAG]: [Minimal Feature 2] ⬚
> [One sentence: what this feature does]

- [ ] Task 1
- [ ] Task 2

---

## Technical Scope

> **Keep this minimal.** Only include what's required for the walking skeleton to run.

### What's In Scope
- [ ] Basic project structure (folders, entry point)
- [ ] One core capability that demonstrates the product (e.g., one endpoint, one game mechanic)
- [ ] Minimal UI or CLI output to prove it works
- [ ] One smoke test that passes

### What's Out of Scope (Defer to Later Slices)
- Comprehensive error handling
- Data persistence (use hardcoded data or in-memory storage)
- User management, authentication (unless core to the product)
- Polish, animations, advanced UI
- Performance optimization
- Extensive test coverage (one smoke test is enough for VS-0)

---

## Dependencies

> External libraries, APIs, or services needed for VS-0.

| Dependency | Purpose | Version | Notes |
|------------|---------|---------|-------|
| [REPLACE] | [Why it's needed] | [Version] | [Any gotchas] |

---

## Architecture Notes

> Only document architecture decisions that are needed for VS-0.
> Don't design the full system architecture — that emerges over time.

**Tech Stack:**
- [REPLACE: Language, framework, key libraries]

**Structure:**
```
[REPLACE: Minimal folder structure for VS-0]
src/
├── index.ts          # Entry point
├── core/             # Core logic
└── tests/            # One smoke test
```

**Key Decisions:**
- [REPLACE: Any important decisions made for VS-0, with brief rationale]
- Example: "Using Vite instead of Webpack for faster dev server startup"

---

## VS-000-SKE Transition Checklist

Complete this checklist before moving to VS-001:

- [ ] All features in VS-000-SKE are ✅ or explicitly deferred with rationale
- [ ] The walking skeleton runs without errors
- [ ] At least one smoke test passes
- [ ] Success criteria above are all checked
- [ ] Blocking decisions resolved (see above)
- [ ] Update `spec/tracking/milestone.md` index to mark VS-000-SKE complete
- [ ] Plan and document VS-001 focus (with 3-letter tag) before starting work

---

## Lessons Learned

> After completing VS-0, capture what worked, what didn't, and what to do differently.

**What Worked:**
- [REPLACE after completion]

**What Didn't:**
- [REPLACE after completion]

**Carry Forward to VS-1:**
- [REPLACE: Insights to apply to the next slice]

---

## Notes

> Scratchpad for thoughts, links, or context that doesn't fit elsewhere.
