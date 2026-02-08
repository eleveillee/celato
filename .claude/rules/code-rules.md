# Code Rules (Project-Specific)

> Personal code preferences (modularity, naming, no over-engineering) are in
> ~/.claude/CLAUDE.md. These rules add project-specific standards.

## Dependencies
- Prefer well-maintained, widely-adopted packages.
- Check last publish date and download count before recommending.
- Minimize dependency count. Don't add a package for 10 lines of code.

## Testing Standards
- AAA pattern: Arrange, Act, Assert.
- One logical assertion per test. Descriptive names: "should [action] when [condition]".
- Co-locate tests: `feature.ts` → `feature.test.ts`.
- 80%+ coverage on business logic. 100% on critical paths.
- Every bug fix gets a regression test.
- Do NOT test framework internals, trivial getters, or implementation details.

## API Contracts
- `spec/api-contracts.md` is the SINGLE SOURCE OF TRUTH for all API shapes.
- Define contracts there BEFORE implementing endpoints or consumers.
- Never duplicate endpoint definitions, request/response types, or status codes elsewhere.
- When contracts change, update `api-contracts.md` first, then update implementations.

## Security
- NEVER read, log, or output .env files, API keys, or credentials.
- NEVER commit secrets. Use .env.example with placeholder values.
- Validate ALL external input at system boundaries with schema validation (Zod, Pydantic, FluentValidation).
- Parameterized queries only. Never concatenate user input into queries.
- Never expose stack traces or system details in production responses.
- Use structured error types with codes, not string matching.
