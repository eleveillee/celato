# API Contracts

> **This file is the single source of truth for all API contracts.**
> Frontend, backend, tests, and documentation MUST reference this file.
> Never define endpoint shapes, request/response types, or status codes elsewhere.

---

## How to Use This File

1. **Define contracts here first** before implementing endpoints or consuming them.
2. **Reference, don't duplicate.** Code should import/generate types from these contracts.
3. **Update here first** when contracts change. Then update implementations to match.
4. **Breaking changes** get a note in `spec/tracking/decisions.md` with migration plan.

---

## Contract Format

For each endpoint group, document:

```markdown
### [Group Name]

#### `METHOD /path/to/endpoint`
Description of what this endpoint does.

**Auth:** Required | Public | Admin
**Rate Limit:** N/min (if applicable)

**Request:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | string | Yes | What this field is |

**Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| field | string | What this field is |

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 404 | NOT_FOUND | Resource doesn't exist |
```

---

## Conventions

- Use consistent error response shape across all endpoints:
  ```json
  { "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
  ```
- Use ISO 8601 for all dates (`2026-02-08T12:00:00Z`).
- Use camelCase for JSON fields (even in Python/C# backends).
- Pagination: `{ "data": [...], "cursor": "next_page_token", "hasMore": true }`.
- IDs: string format. Never expose internal integer IDs.

---

## Endpoints

> [REPLACE: Add endpoint groups below as the project develops.]
> Remove this note and the example when adding real endpoints.

### Example: Users

#### `GET /api/users/:id`
Get a user by ID.

**Auth:** Required
**Rate Limit:** 60/min

**Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| id | string | User ID |
| email | string | User email |
| displayName | string | Display name |
| createdAt | string | ISO 8601 creation date |

**Errors:**
| Status | Code | When |
|--------|------|------|
| 404 | USER_NOT_FOUND | No user with this ID |

---

## Webhooks / Events

> [REPLACE: Document webhook payloads and event contracts here if applicable.]

---

## Third-Party Integrations

> [REPLACE: Document external API contracts your project depends on.]
> Include: base URL, auth method, key endpoints consumed, response shapes.
