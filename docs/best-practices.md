# Best Practices

Human-readable guide covering cross-cutting best practices for all projects.
For parseable AI rules, see `spec/coding-standards.md`.
For language-specific setup, see `stacks/`.

---

## Code Organization

### Keep Files Small and Focused
- **Target:** ~300 lines max per file, ~50 lines max per function.
- **Why:** AI tools and humans both lose accuracy on large files. Small files with clear
  names are self-documenting.
- **How:** When a file grows past 300 lines, look for natural split points: separate
  types, separate helpers, separate sub-features.

### Name Things Well
Good names eliminate the need for comments. A function named `calculateProratedBillingAmount`
needs no comment explaining what it does.

- **Functions:** verb + noun. `fetchUser`, `validateInput`, `renderDashboard`.
- **Booleans:** question form. `isValid`, `hasPermission`, `canEdit`.
- **Constants:** `UPPER_SNAKE` for true constants, `camelCase` for derived values.
- **Files:** match the primary export. `UserService.ts` exports `UserService`.

### Imports and Dependencies
- Group imports: stdlib/external, then internal, then relative.
- No circular imports. If A imports B and B imports A, extract shared logic to C.
- Minimize external dependencies. Every dependency is a maintenance burden and security surface.

---

## Error Handling

### The Guard Clause Pattern
```
function processOrder(order) {
  if (!order) return error("Order required")
  if (!order.items.length) return error("Empty order")
  if (!order.customer) return error("Customer required")

  // Happy path (all validation passed)
  return calculateTotal(order)
}
```

Fail fast, handle errors at the top, keep the happy path unindented.

### Boundary Validation
- **External boundaries** (API endpoints, user input, file reads): validate everything.
  Use schema validation (Zod, Pydantic, FluentValidation).
- **Internal boundaries** (function-to-function): trust the caller. If data passed
  validation at the boundary, don't re-validate it in every function.

---

## Testing

### Test-Driven Development (Recommended)
1. Write a failing test that describes the desired behavior.
2. Write the minimum code to make it pass.
3. Refactor while keeping tests green.

Even when not doing strict TDD, write tests alongside code, never as an afterthought.

### What Makes a Good Test
- **Fast:** Tests should run in seconds, not minutes.
- **Isolated:** No test depends on another test's state.
- **Deterministic:** Same input = same result. No flaky tests.
- **Descriptive:** Test names read like specifications: "should reject orders with no items".

### Testing Hard-to-Test Things
| Project Type | Testing Approach |
|-------------|-----------------|
| Web API | Supertest/TestServer for integration, unit tests for logic |
| Web UI | Component tests (interactions), E2E for critical flows |
| CLI tool | Test command output, mock stdin/stdout |
| Game engine | Screenshot comparison, property-based tests for logic |
| Data pipeline | Test transformations with known input/output pairs |
| Library | Unit tests for public API, integration tests for edge cases |

---

## Version Control

### Commit Discipline
- **Small commits:** One logical change per commit. Easy to review, easy to revert.
- **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Message format:** Describe WHY, not WHAT. The diff shows what changed.
  - Good: `fix: prevent duplicate charges when retry races with webhook`
  - Bad: `fix: add check in payment handler`

### Branch Strategy
- `main`: always deployable.
- `feat/name`: feature branches, short-lived (days, not weeks).
- `fix/name`: bug fixes.
- Merge via pull request with at least a review (AI or human).

---

## Security

### Secrets Management
- Never hardcode secrets. Use environment variables.
- Provide `.env.example` with placeholder values and comments.
- Use secrets managers (Vault, AWS Secrets Manager, Doppler) in production.
- Rotate secrets regularly. Prefer short-lived tokens over long-lived keys.

### Dependency Security
- Keep dependencies updated. Check for vulnerabilities regularly.
- Audit new dependencies before adding: maintenance status, download count, security history.
- Use lock files (`pnpm-lock.yaml`, `poetry.lock`, `packages.lock.json`) for reproducible builds.

---

## Performance

### Don't Optimize Prematurely
1. Make it work (correct).
2. Make it clear (readable).
3. Make it fast (only if measured to be slow).

### When to Optimize
- You have a measurable performance problem (latency, throughput, memory).
- You've profiled and identified the bottleneck (don't guess).
- The optimization is worth the complexity cost.

---

## Documentation

### What to Document
- **Architecture decisions:** Why was this approach chosen? (see `spec/tracking/decisions.md`)
- **Non-obvious behavior:** Gotchas, workarounds, known limitations.
- **Setup instructions:** How to get from zero to running.
- **API contracts:** What the endpoints accept and return.

### What NOT to Document
- How the code works (the code should be readable enough).
- Obvious behavior (don't document that `getUser` gets a user).
- Anything that will go stale quickly without a maintenance process.
