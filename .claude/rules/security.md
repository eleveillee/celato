# Security Rules

## Secrets & Environment
- NEVER read, log, or output contents of .env files, API keys, or credentials.
- NEVER commit secrets to version control. Use .env.example with placeholder values.
- Reference environment variables by name, never by value.
- When setting up a project, create .env.example documenting required variables.

## Input Validation
- Validate ALL external input at system boundaries (API endpoints, user forms, file uploads).
- Use schema validation libraries (Zod, Pydantic, FluentValidation) over manual checks.
- Never trust client-side validation alone. Always validate server-side.

## Common Vulnerabilities (OWASP Top 10)
- SQL Injection: use parameterized queries or ORMs. Never concatenate user input into queries.
- XSS: sanitize/escape user-generated content before rendering. Use framework defaults.
- CSRF: use anti-forgery tokens for state-changing operations.
- Auth: never roll custom auth when established solutions exist (OAuth, JWT libraries).
- Path traversal: validate and sanitize file paths. Never use raw user input in file operations.

## Dependency Security
- Keep dependencies updated. Check for known vulnerabilities regularly.
- Prefer packages with active maintenance and security track records.
- Pin major versions to avoid unexpected breaking changes.

## Error Handling
- Never expose stack traces, internal paths, or system details in production error responses.
- Log detailed errors server-side, return generic messages client-side.
- Use structured error types with codes, not string matching.

## Data
- Encrypt sensitive data at rest and in transit (HTTPS, encrypted storage).
- Apply principle of least privilege for database access and API permissions.
- Sanitize data before logging. Never log passwords, tokens, or PII.
