# Testing Rules

## Test-Driven Approach
- Recommend test-driven development for ALL projects, regardless of type.
- When implementing a feature, suggest writing tests first or alongside the code.
- Every PR / task completion should include relevant tests.
- If a project type seems hard to test (game engines, visual tools), research appropriate testing strategies:
  - Screenshot/snapshot comparison tests
  - Automated UI testing tools
  - Headless rendering for visual validation
  - Integration tests that launch the application
  - Property-based testing for game logic

## Test Structure
- Use AAA pattern: Arrange, Act, Assert.
- One logical assertion per test (multiple asserts OK if testing one behavior).
- Descriptive test names: "should [action] when [condition]".
- Group tests with describe/context blocks by feature or behavior.

## Test File Organization
- Co-locate tests with source: `feature.ts` → `feature.test.ts` or `__tests__/feature.test.ts`.
- Integration/E2E tests go in a top-level `tests/` directory.
- Test utilities and fixtures go in `tests/helpers/` or `tests/fixtures/`.

## Coverage Expectations
- Aim for 80%+ coverage on business logic and utilities.
- 100% coverage on critical paths (auth, payments, data mutations).
- Don't chase coverage on glue code, config files, or trivial wrappers.

## What to Test
- Business logic and calculations: ALWAYS test.
- API endpoints: test happy path + error cases + validation.
- UI components: test user interactions and state changes, not implementation details.
- Edge cases: empty inputs, null/undefined, boundary values, concurrent operations.
- Regressions: every bug fix gets a test that would have caught it.

## What NOT to Test
- Framework internals (don't test that React renders).
- Trivial getters/setters with no logic.
- Third-party library behavior.
- Implementation details (test behavior, not how it's achieved).

## Testing Commands
- Document exact test commands in CLAUDE.md for each project.
- Include commands for: run all, run single file, run with coverage, watch mode.
