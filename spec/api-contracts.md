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
User whispers an instruction to the agent (business does NOT hear this).

**VS-1 (text-based):**
```typescript
{
  type: "whisper",
  text: string,         // User's whisper instruction
  timestamp: number
}
```

**VS-2+ (audio-based):**
```typescript
{
  type: "whisper",
  audioData: ArrayBuffer,  // Opus-encoded audio (transcribed server-side via Deepgram)
  timestamp: number
}
```

**Server behavior:**
- Stores whisper in conversation context (hidden from business)
- Transforms via LLM into natural agent speech
- Only LLM output goes to business (via Retell TTS)
- ✅ Business never hears the raw whisper text

##### `start_call` (VS-1)
Initiate a new phone call.

```typescript
{
  type: "start_call",
  phoneNumber: string,      // E.164 format (e.g., "+15551234567")
  personaMode: "transparent" | "proxy",
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
Real-time conversation transcript.

```typescript
{
  type: "transcript",
  speaker: "business" | "agent" | "whisper",  // "whisper" for hidden user instructions
  text: string,
  timestamp: number
}
```

**Note:** `speaker: "whisper"` indicates a hidden instruction that business did NOT hear.

##### `cost_update` (VS-1)
Real-time cost tracking update.

```typescript
{
  type: "cost_update",
  totalCost: number,           // USD total
  breakdown: {
    retell: number,            // Retell AI cost (call minutes)
    llm: number,               // LLM cost (token usage)
    transcription?: number     // Deepgram cost (VS-2+, when whisper audio is used)
  },
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

### Retell AI Custom LLM WebSocket

**Endpoint:** `/llm-websocket/:call_id` (implemented by our API orchestrator)

**Connection:** Retell initiates WebSocket connection when call starts.

**Protocol:** TEXT-ONLY (JSON messages, no binary audio)

**Critical:** See [spec/integrations/retell-ai.md](../integrations/retell-ai.md) for full technical details.

#### Retell → Server Messages

| Type | When | Purpose |
|------|------|---------|
| `call_details` | Call start | Initial call metadata |
| `response_required` | Turn boundary | Agent response needed |
| `update_only` | Continuous | Live transcript updates |
| `ping_pong` | Every 2s | Keepalive (if `auto_reconnect: true`) |

#### Server → Retell Messages

| Type | Purpose |
|------|---------|
| `config` | Initial connection setup |
| `response` | Agent speech (text, Retell handles TTS) |
| `agent_interrupt` | Force immediate agent speech (interrupts current speaker) |
| `ping_pong` | Keepalive response |

**Example whisper flow:**
```typescript
// 1. User whispers (hidden from business)
{ type: "whisper", text: "Tell them I'm running late" }

// 2. Server stores in context (not sent to Retell yet)

// 3. Retell sends response_required (business finished speaking)
{ interaction_type: "response_required", response_id: 5, transcript: [...] }

// 4. Server sends LLM-transformed response (business hears this)
{
  response_type: "response",
  response_id: 5,
  content: "Apologies, I'm running about 5 minutes behind schedule.",
  content_complete: true
}
```

---

### OpenAI API (Text-based LLM)

- **Base URL:** `https://api.openai.com/v1`
- **Auth:** Bearer token (`sk-proj-...`)
- **Model:** GPT-4o-mini (text-based chat completion)
- **Use:** Transform whisper instructions into natural agent speech
- **Cost:** $0.15/1M input tokens, $0.60/1M output tokens

**Note:** OpenAI Realtime API (audio-to-audio) is NOT used — Retell Custom LLM is text-only.

### Supabase
- **Base URL:** Project-specific (`https://xxxxx.supabase.co`)
- **Auth:** Service role key for backend, anon key for client
- **Used For:** User auth, call logs, transcripts, contacts
- **Documentation:** Supabase client library docs
