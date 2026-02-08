# Code Quality Rules

## Modularity
- Write modular, single-responsibility code. Each function/class does ONE thing.
- No file should exceed ~300 lines. If it does, split by responsibility.
- No function should exceed ~50 lines. Extract sub-functions with clear names.
- Group related logic into modules/namespaces, not god files.

## No Repetition
- DRY applies when logic is genuinely shared (3+ usages or complex logic).
- Do NOT create abstractions for trivial one-off patterns. Three similar lines are fine.
- When extracting shared logic, place it at the nearest common ancestor in the file tree.

## Best Practices
- Always research and use current best practices for the language/framework in use.
- When uncertain about the best approach, research it before implementing.
- Prefer established patterns over clever solutions. Readable beats concise.
- Use early returns and guard clauses over deep nesting.
- Fail fast: validate inputs at boundaries, trust internal code.

## Naming
- Names should describe WHAT, not HOW. `getUserPermissions` not `queryDbForPerms`.
- Booleans: use `is`, `has`, `can`, `should` prefixes.
- Collections: use plural nouns. `users`, `items`, not `userList`.
- Functions: use verbs. `fetchData`, `calculateTotal`, `validateInput`.

## No Over-Engineering
- Only build what is asked for. No speculative features.
- No premature abstraction. Wait for the third use case.
- No feature flags or backward-compatibility shims unless explicitly requested.
- No extra error handling for impossible scenarios in internal code.

## Dependencies
- Prefer well-maintained, widely-adopted packages over obscure ones.
- Check last publish date and download count before recommending a package.
- Minimize dependency count. Don't add a package for something achievable in 10 lines.
