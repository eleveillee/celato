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

### Health Check

#### `GET /health`
Health check endpoint for API orchestrator.

**Auth:** Public
**Rate Limit:** None

**Response (200):**
| Field | Type | Description |
|-------|------|-------------|
| status | string | "ok" |
| service | string | "celato-api" |
| version | string | API version |

---

## WebSocket Protocol

### Connection: `/ws`

Bidirectional WebSocket for real-time communication between mobile app and API orchestrator.

**Connection:**
- URL: `ws://localhost:4000/ws` (dev) / `wss://api.celato.com/ws` (prod)
- Auth: None (VS-0); Bearer token in query param (future: `?token=xxx`)

---

### VS-0 Protocol (Current Implementation)

**Client → Server:**
- Plain text messages (any string)
- Example: `"test message from mobile"`

**Server → Client:**
- JSON with ack response

```typescript
{
  type: "ack",
  timestamp: number
}
```

**Example:**
```typescript
// Client sends
ws.send("test message from mobile");

// Server responds
{ "type": "ack", "timestamp": 1708012345678 }
```

---

### Future Message Types (VS-1+)

The following message types are planned but not yet implemented:

#### Client → Server

##### `whisper` (VS-1)
User whispers an instruction to the agent.

```typescript
{
  type: "whisper",
  audioData: ArrayBuffer,  // Opus-encoded audio
  timestamp: number
}
```

##### `mode_change` (VS-1)
User switches audio mode (standard/whisper/passthrough).

```typescript
{
  type: "mode_change",
  mode: "standard" | "whisper" | "passthrough"
}
```

#### Server → Client

##### `transcript` (VS-1)
Real-time conversation transcript (translated).

```typescript
{
  type: "transcript",
  speaker: "business" | "agent",
  text: string,
  translatedText?: string,
  timestamp: number
}
```

##### `state_update` (VS-1)
Call state change notification.

```typescript
{
  type: "state_update",
  state: "idle" | "connecting" | "active" | "holding" | "ended",
  timestamp: number
}
```

---

## Future Endpoints

_Will be defined in later vertical slices:_
- `POST /calls` - Initiate a new call
- `GET /calls/:id` - Get call details
- `GET /calls/:id/transcript` - Get full transcript
- `POST /contacts` - Save a contact
| displayName | string | Display name |
| createdAt | string | ISO 8601 creation date |

**Errors:**
| Status | Code | When |
|--------|------|------|
| 404 | USER_NOT_FOUND | No user with this ID |

---

## Third-Party Integrations

### Retell AI
- **Base URL:** `https://api.retellai.com/v1`
- **Auth:** Bearer token in header
- **Key Endpoints:** Custom LLM webhook, call management
- **Documentation:** See Retell AI docs for full API reference

### OpenAI Realtime API
- **Base URL:** `wss://api.openai.com/v1/realtime`
- **Auth:** API key + organization ID
- **Protocol:** WebSocket with structured events
- **Documentation:** OpenAI Realtime API docs

### Supabase
- **Base URL:** Project-specific (`https://xxxxx.supabase.co`)
- **Auth:** Service role key for backend, anon key for client
- **Used For:** User auth, call logs, transcripts, contacts
- **Documentation:** Supabase client library docs
