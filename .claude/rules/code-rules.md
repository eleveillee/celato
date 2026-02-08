# Code Rules

## Modularity
- Write modular, single-responsibility code. Each function/class does ONE thing.
- No file should exceed ~300 lines. Split by responsibility.
- No function should exceed ~50 lines. Extract named sub-functions.

## No Repetition
- DRY applies when logic is genuinely shared (3+ usages or complex logic).
- Do NOT create abstractions for trivial one-off patterns.
- When extracting shared logic, place it at the nearest common ancestor.

## Best Practices
- Always research and use current best practices for the language/framework.
- Prefer established patterns over clever solutions. Readable beats concise.
- Use early returns and guard clauses over deep nesting.
- Fail fast: validate inputs at boundaries, trust internal code.

## Naming
- Names describe WHAT, not HOW. `getUserPermissions` not `queryDbForPerms`.
- Booleans: `is`, `has`, `can`, `should` prefixes.
- Collections: plural nouns. Functions: verbs.

## No Over-Engineering
- Only build what is asked for. No speculative features.
- No premature abstraction. Wait for the third use case.
- Minimize dependency count. Don't add a package for something achievable in 10 lines.

## Dependencies
- Prefer well-maintained, widely-adopted packages over obscure ones.
- Check last publish date and download count before recommending a package.

---

# Testing

## Test-Driven Approach
- Recommend TDD for ALL projects, regardless of type.
- Write tests first or alongside code. Every task should include tests.
- For hard-to-test projects (games, visual tools): use screenshot tests, headless rendering, property-based testing.

## Test Structure
- AAA pattern: Arrange, Act, Assert.
- One logical assertion per test.
- Descriptive names: "should [action] when [condition]".
- Co-locate tests: `feature.ts` → `feature.test.ts`.

## Coverage
- 80%+ on business logic and utilities.
- 100% on critical paths (auth, payments, data mutations).
- Don't chase coverage on glue code or trivial wrappers.

## What to Test
- Business logic, API endpoints (happy + error + validation), UI interactions, edge cases.
- Every bug fix gets a regression test.

## What NOT to Test
- Framework internals, trivial getters, third-party library behavior, implementation details.

---

# Security

## Secrets & Environment
- NEVER read, log, or output .env files, API keys, or credentials.
- NEVER commit secrets. Use .env.example with placeholder values.
- Reference environment variables by name, never by value.

## Input Validation
- Validate ALL external input at system boundaries.
- Use schema validation libraries (Zod, Pydantic, FluentValidation).
- Never trust client-side validation alone.

## Common Vulnerabilities
- SQL Injection: parameterized queries or ORMs. Never concatenate user input.
- XSS: sanitize user content before rendering. Use framework defaults.
- CSRF: anti-forgery tokens for state-changing operations.
- Path traversal: validate file paths. Never use raw user input in file ops.

## Error Handling
- Never expose stack traces or system details in production responses.
- Log detailed errors server-side, generic messages client-side.
- Use structured error types with codes, not string matching.
