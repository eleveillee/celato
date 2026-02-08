# Coding Standards

This file contains parseable, enforceable coding rules for AI agents.
For human-readable best practices with rationale, see `docs/best-practices.md`.
For language-specific guides, see `stacks/`.

---

## Universal Rules (All Languages)

### File Structure
- Max ~300 lines per file. Split by responsibility when exceeded.
- Max ~50 lines per function. Extract named sub-functions.
- One module/class per file. Utility files may contain related small functions.
- Order within a file: exports/public API at top, private helpers below, types/interfaces at bottom (or in dedicated type files).

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Files (general) | kebab-case | `user-service.ts` |
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (Python) | snake_case | `user_service.py` |
| Files (C#) | PascalCase | `UserService.cs` |
| Functions | camelCase / snake_case | `getUser` / `get_user` |
| Classes | PascalCase | `UserService` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Booleans | is/has/can/should prefix | `isLoading`, `hasPermission` |
| Collections | Plural nouns | `users`, `items` |
| Interfaces/Types | PascalCase, no I prefix | `UserProfile` (not `IUserProfile`) |

### Error Handling
- Use early returns and guard clauses. Happy path last.
- Validate at system boundaries (API input, user forms, file I/O).
- Use typed/structured errors, not string matching.
- Internal code trusts other internal code. Don't defensive-code against impossible states.

### Imports
- Group imports: external packages, then internal modules, then relative imports.
- No circular imports. If two modules import each other, extract shared logic.
- Prefer named imports over wildcard/default imports.

### Comments
- Comments explain WHY, never WHAT. The code explains what.
- No commented-out code. Delete it. Version control remembers.
- Use doc comments (JSDoc/docstrings/XML docs) on public APIs with non-obvious behavior.
- TODO format: `// TODO(context): description` with enough context to act on it.

### Git Conventions
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Commit messages describe WHY, not WHAT. The diff shows what changed.
- Small, focused commits. One logical change per commit.

---

## TypeScript-Specific

- Enable `strict: true` in tsconfig. No exceptions.
- NEVER use `any`. Use `unknown` if type is truly unknown, then narrow.
- Use `interface` for public APIs, `type` for unions/intersections/mapped types.
- Use `as const` over enums.
- Named exports only. No default exports.
- Return type annotations on all exported functions.
- Prefer `readonly` for data that shouldn't mutate.

## Python-Specific

- Type hints on all function signatures (params and return).
- Use dataclasses or Pydantic models for structured data.
- Use `pathlib.Path` over `os.path`.
- Use f-strings for formatting. No `.format()` or `%` formatting.
- Use context managers (`with`) for resource management.
- Prefer list comprehensions over `map`/`filter` for readability.

## C#-Specific

- Use file-scoped namespaces (C# 10+).
- Use records for immutable data types.
- Use pattern matching where it improves readability.
- Async all the way: don't mix sync and async. No `.Result` or `.Wait()`.
- Use nullable reference types (`#nullable enable`).
- Prefer LINQ for collection operations, but not at the cost of readability.
