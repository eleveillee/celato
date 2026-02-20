# VS-001 System Design

**Reference architecture for the Wizard of Oz Prototype.**

This document contains implementation-level design details for VS-1. For task tracking, see [vs1_wizard.md](vs1_wizard.md).

---

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        VS-1 Architecture                     │
│                                                              │
│  ┌──────────────────┐              ┌────────────────────┐   │
│  │   Next.js Web    │              │  Fastify API       │   │
│  │   (Vercel)       │              │  (Railway)         │   │
│  ├──────────────────┤              ├────────────────────┤   │
│  │ - Phone input    │  WebSocket   │ - /ws endpoint     │   │
│  │ - Call UI        │◄────────────►│ - Session mgmt     │   │
│  │ - Transcript log │              │ - Cost tracking    │   │
│  │ - Spacebar       │              │                    │   │
│  │   whisper input  │              │                    │   │
│  └──────────────────┘              └─────────┬──────────┘   │
│                                              │               │
└──────────────────────────────────────────────┼───────────────┘
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     │                         │                         │
                     │ HTTP                    │ WebSocket               │
                     ▼                         ▼                         │
            ┌─────────────────┐      ┌──────────────────────┐           │
            │  Retell AI      │      │  Retell AI           │           │
            │  REST API       │      │  Custom LLM          │           │
            │                 │      │  WebSocket           │           │
            │ - Create call   │      │  (TEXT-ONLY)         │           │
            │ - Get call info │      │                      │           │
            └─────────────────┘      └──────────┬───────────┘           │
                                                │                         │
                                                │ Text transcripts        │
                                                │ Text responses          │
                                                ▼                         │
                                     ┌──────────────────────┐             │
                                     │  OpenAI API          │             │
                                     │  GPT-4o-mini         │             │
                                     │  (Text completion)   │             │
                                     │                      │             │
                                     │ - Whisper transform  │             │
                                     │ - Agent intelligence │             │
                                     └──────────────────────┘             │
                                                                          │
                     Phone Call (PSTN/SIP) ◄──────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Business    │
                    │   Phone       │
                    └───────────────┘
```

### Critical Insight: Retell is TEXT-ONLY

**Retell's "Custom LLM" mode does NOT route audio.** All audio processing (ASR, TTS) happens within Retell's platform. Our API orchestrator works entirely with text:

- **Retell → Us:** Text transcripts of business speech
- **Us → Retell:** Text responses (Retell converts to speech)
- **Whisper never sent to Retell:** Stored in conversation context, influences LLM output

---

## Whisper Loop: Deep Dive

### Complete Data Flow

```
1. User presses spacebar (web UI)
   ↓
2. Text input field appears
   ↓
3. User types: "Tell them I'm running 5 minutes late"
   ↓
4. User releases spacebar → whisper submitted
   ↓
5. Web UI → API: WebSocket message
   {
     type: "whisper",
     text: "Tell them I'm running 5 minutes late",
     timestamp: 1708012345000
   }
   ↓
6. API stores whisper in session.conversationContext[]
   {
     role: "system",
     content: "[DIRECTOR INSTRUCTION: Tell them I'm running late]"
   }
   ✅ Business does NOT hear this
   ↓
7. Business speaks: "What's your ETA?"
   ↓
8. Retell → API: response_required event
   {
     interaction_type: "response_required",
     response_id: 5,
     transcript: [
       { role: "agent", content: "I'm calling to confirm our meeting..." },
       { role: "user", content: "What's your ETA?" }
     ]
   }
   ↓
9. API → OpenAI GPT-4o-mini:
   {
     model: "gpt-4o-mini",
     messages: [
       { role: "system", content: "You are calling on behalf of Eric..." },
       { role: "system", content: "[DIRECTOR INSTRUCTION: Tell them I'm running late]" },
       { role: "assistant", content: "I'm calling to confirm our meeting..." },
       { role: "user", content: "What's your ETA?" }
     ]
   }
   ↓
10. LLM generates natural response:
    "Apologies, I'm running about 5 minutes behind schedule. I should arrive by 2:15."
   ↓
11. API → Retell: response message
    {
      response_type: "response",
      response_id: 5,
      content: "Apologies, I'm running about 5 minutes behind schedule...",
      content_complete: true
    }
   ↓
12. Retell synthesizes text → speech (TTS)
   ↓
13. Business hears: "Apologies, I'm running about 5 minutes behind schedule..."
   ✅ Natural agent speech, NOT the raw whisper
```

### Latency Budget

| Step | Target | Max |
|------|--------|-----|
| WebSocket round-trip (whisper submit) | 50ms | 100ms |
| LLM processing (GPT-4o-mini) | 200-400ms | 800ms |
| Retell TTS generation | 200-300ms | 500ms |
| **Total (whisper → business hears)** | **450-750ms** | **1400ms** |

**Success criteria:** <2 seconds from whisper submit to business hearing agent response.

---

## Retell AI Integration

### WebSocket Protocol (Custom LLM)

**Endpoint:** `/llm-websocket/:call_id`

**Connection flow:**
1. Retell initiates call → connects to our WebSocket
2. We send `config` message
3. Retell sends `call_details`
4. Bidirectional conversation begins
5. Call ends → WebSocket closes

**Message Types We Handle:**

| From Retell | Our Response | Purpose |
|-------------|--------------|---------|
| `call_details` | Store session metadata | Initial call info |
| `response_required` | Send `response` message | Agent needs to speak |
| `update_only` | No response (log only) | Live transcript update |
| `ping_pong` | Echo timestamp | Keepalive (every 2s) |

**Critical Implementation Details:**

```typescript
// packages/api/routes/llm-websocket.ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const server = Fastify();
await server.register(websocket);

// Map call_id → session state
const activeCalls = new Map<string, CallSession>();

server.get('/llm-websocket/:call_id', { websocket: true }, (socket, req) => {
  const callId = req.params.call_id;
  const session = activeCalls.get(callId);

  if (!session) {
    socket.close(1008, 'Unknown call_id');
    return;
  }

  session.retellWs = socket;

  // 1. Send initial config
  socket.send(JSON.stringify({
    response_type: 'config',
    config: {
      auto_reconnect: true,  // Enable ping/pong keepalive
      call_details: true     // Receive call metadata
    }
  }));

  // 2. Handle messages
  socket.on('message', async (data) => {
    const msg = JSON.parse(data.toString());

    // 3. Handle response_required (main conversation loop)
    if (msg.interaction_type === 'response_required') {
      // Get conversation history + any whispers
      const messages = [
        { role: 'system', content: session.systemPrompt },
        ...session.conversationContext,
        ...msg.transcript.map(t => ({
          role: t.role === 'agent' ? 'assistant' : 'user',
          content: t.content
        }))
      ];

      // Call LLM
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: false  // VS-1: no streaming (keep simple)
      });

      const agentText = response.choices[0].message.content;

      // Send back to Retell
      socket.send(JSON.stringify({
        response_type: 'response',
        response_id: msg.response_id,
        content: agentText,
        content_complete: true
      }));

      // Track cost
      session.costTracker.addLLMUsage(
        response.usage.prompt_tokens,
        response.usage.completion_tokens
      );
    }

    // 4. Handle ping/pong (critical for connection stability)
    if (msg.interaction_type === 'ping_pong') {
      socket.send(JSON.stringify({
        response_type: 'ping_pong',
        timestamp: msg.timestamp
      }));
    }

    // 5. Handle update_only (live transcript)
    if (msg.interaction_type === 'update_only') {
      // Broadcast to web UI for real-time display
      session.webUiWs.send(JSON.stringify({
        type: 'transcript',
        speaker: msg.transcript[msg.transcript.length - 1].role,
        text: msg.transcript[msg.transcript.length - 1].content,
        timestamp: Date.now()
      }));
    }
  });

  socket.on('close', () => {
    // Clean up session
    activeCalls.delete(callId);
  });
});
```

---

## Platform Abstraction Interfaces

### Why Now?

VS-1 defines all 6 platform abstraction interfaces even though we only implement web versions. **Rationale:**

1. **Validates interface design** — Web implementation proves interfaces are usable
2. **No rework in VS-2** — Mobile just implements same interfaces
3. **Minimal overhead** — Interfaces are TypeScript types (zero runtime cost)
4. **Future-proof** — AR glasses, CLI, voice assistants work with same interfaces

### Interface Definitions

**See [spec/architecture.md § Platform Abstraction Strategy](../../architecture.md#platform-abstraction-strategy) for full interface definitions.**

**VS-1 implements:**
- `WebAudioInterface` (implements `AudioInterface`)
- `WebInputInterface` (implements `InputInterface`)
- `WebNotificationInterface` (implements `NotificationInterface`)
- `WebStorageInterface` (implements `StorageInterface`)
- `WebNetworkInterface` (implements `NetworkInterface`)
- `BrowserWebSocketClient` (implements `WebSocketInterface`)

**Location:** `packages/shared/interfaces/` (interfaces) + `packages/web/lib/` (implementations)

---

## LLM Integration & Prompt Engineering

### Whisper Transformation

**Problem:** User says "Tell them I'm running late" → Agent should say something natural.

**Solution:** LLM transforms whisper into contextual agent speech.

**Prompt structure:**

```typescript
const systemPrompt = `You are an AI assistant making a phone call on behalf of Eric.

CRITICAL RULES:
- Always identify yourself as an AI assistant in your first turn (if transparent mode)
- Be polite, professional, and helpful
- Follow director instructions in [DIRECTOR INSTRUCTION: ...] messages
- Transform director instructions into natural speech that fits the conversation
- NEVER mention the director instructions directly to the business
${session.targetLanguage && session.targetLanguage !== 'en'
  ? `- ALWAYS speak to the business in ${session.targetLanguageName}. Director instructions may be in a different language — translate and respond naturally in ${session.targetLanguageName}.`
  : ''
}

Current mode: ${session.personaMode}
${session.personaMode === 'transparent'
  ? 'Refer to Eric in third person ("my client", "the person I\'m calling for")'
  : 'Speak as if you ARE Eric (first person)'
}`;

const messages = [
  { role: 'system', content: systemPrompt },

  // Conversation history
  { role: 'assistant', content: 'Hello, I\'m calling to check your store hours.' },
  { role: 'user', content: 'We\'re open 9-5 today.' },

  // Whisper instruction (hidden from business)
  { role: 'system', content: '[DIRECTOR INSTRUCTION: Ask if they deliver to ZIP 12345]' },

  // Latest business speech
  { role: 'user', content: 'Is there anything else I can help with?' }
];

// LLM generates:
// "Yes, do you deliver to ZIP code 12345?"
```

**Alternative Considered:** Template-based transformation (rejected)
- ❌ Robotic phrasing ("Tell them X" → "X")
- ❌ No context awareness
- ✅ LLM: Natural, adapts to conversation flow

---

## Deployment Architecture

### Split Deployment (Why Railway + Vercel)

**Problem:** Vercel has 60-second timeout for serverless functions. WebSockets need persistent connections.

**Solution:** Deploy frontend and backend separately.

| Component | Platform | Why |
|-----------|----------|-----|
| **Next.js Web UI** | Vercel | Optimal for static/serverless Next.js, global CDN |
| **Fastify API + WebSockets** | Railway | Supports long-lived WebSocket connections, Node.js 22 |

### Environment Variables

**Railway (API server):**
```bash
# .env (gitignored, Railway dashboard for prod)
RETELL_API_KEY=sk_...
OPENAI_API_KEY=sk-proj-...
API_PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS=https://celato-web.vercel.app
```

**Vercel (Next.js frontend):**
```bash
# .env.local (gitignored, Vercel dashboard for prod)
NEXT_PUBLIC_WS_URL=wss://celato-api.railway.app/ws
NEXT_PUBLIC_API_URL=https://celato-api.railway.app
```

### CORS Configuration

```typescript
// packages/api/index.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify();

await server.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
});
```

**Production origins:**
- `https://celato-web.vercel.app` (production)
- `http://localhost:3000` (local dev)

---

## Security Considerations

### API Key Management

**Strategy:** Environment variables (`.env` files, gitignored)

**Implementation:**
- `.env` file in project root (local dev, **gitignored**)
- `.env.example` with placeholder values (**committed**)
- Railway dashboard for production env vars (encrypted at rest)

**Never:**
- ❌ Commit API keys to git
- ❌ Log API keys to console
- ❌ Expose keys in client-side code (Next.js uses `NEXT_PUBLIC_` prefix for client-exposed vars)

### Input Validation

**All external input validated at system boundaries:**

```typescript
// packages/shared/schemas/websocket.ts
import { z } from 'zod';

export const WhisperMessageSchema = z.object({
  type: z.literal('whisper'),
  text: z.string().min(1).max(500),  // Limit whisper length
  timestamp: z.number()
});

// In API
socket.on('message', (data) => {
  const parsed = JSON.parse(data.toString());
  const validated = WhisperMessageSchema.parse(parsed);  // Throws if invalid
  // ... process validated message
});
```

**Validation points:**
- WebSocket messages (user → API)
- Phone number input (E.164 format: `+15551234567`)
- Retell API responses (validate structure before using)
- LLM responses (validate before sending to Retell)

### Rate Limiting

**VS-1:** Not implemented (single-user testing)

**VS-2+:** Consider rate limiting if multi-user:
- Max 10 concurrent calls per user
- Max 100 whispers per minute per call
- Use `@fastify/rate-limit` plugin

---

## Cost Model

### Detailed Pricing Breakdown

**Retell AI:**
- **Base cost:** $0.08-0.10 per minute
- Includes: ASR (Deepgram), TTS (ElevenLabs/Azure), platform fee

**OpenAI GPT-4o-mini:**
- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens
- **Typical conversation:** ~500 input + 200 output tokens per minute
- **Cost:** ~$0.0002/minute

**Total per minute:** ~$0.08 (Retell) + $0.0002 (LLM) ≈ **$0.08/min**

**Example call costs:**
- 2-minute call (restaurant hours): ~$0.16
- 5-minute call (complex negotiation): ~$0.40
- 10-minute call (long conversation): ~$0.80

### Cost Tracking Implementation

```typescript
// packages/shared/utils/cost-tracker.ts
export class CostTracker {
  private retellMinutes = 0;
  private llmInputTokens = 0;
  private llmOutputTokens = 0;

  addCallMinute() {
    this.retellMinutes += 1;
  }

  addLLMUsage(inputTokens: number, outputTokens: number) {
    this.llmInputTokens += inputTokens;
    this.llmOutputTokens += outputTokens;
  }

  getTotalCost(): number {
    const retellCost = this.retellMinutes * 0.08;
    const llmCost =
      (this.llmInputTokens * 0.15 / 1_000_000) +
      (this.llmOutputTokens * 0.60 / 1_000_000);
    return retellCost + llmCost;
  }

  getBreakdown() {
    return {
      retell: this.retellMinutes * 0.08,
      llm: (this.llmInputTokens * 0.15 / 1_000_000) + (this.llmOutputTokens * 0.60 / 1_000_000),
      total: this.getTotalCost()
    };
  }
}
```

**Real-time updates:** Send cost update to web UI every 10 seconds during active call.

---

## Error Handling Strategy

### Graceful Degradation

**Philosophy:** Recover from transient failures, fail fast on permanent errors.

| Error Type | Strategy | User Experience |
|------------|----------|-----------------|
| **Retell WebSocket disconnect** | Auto-reconnect (3 attempts, exponential backoff) | UI shows "Reconnecting..." indicator |
| **LLM timeout (>5s)** | Send fallback response | Agent says "One moment please..." |
| **OpenAI rate limit** | Queue whisper, retry after 1s | Whisper delayed but not lost |
| **Network error (web UI)** | Show error modal with "Retry" button | User can manually retry |
| **Invalid phone number** | Validate before call, show error | Clear error message, don't attempt call |

### Retry Logic (Exponential Backoff)

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) throw error;

      const delayMs = Math.pow(2, attempts) * 1000;  // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Max retry attempts exceeded');
}
```

---

## Database Schema (Future: VS-3)

**VS-1 does NOT use Supabase.** All data is in-memory (session state, local transcript export).

**Planned schema for VS-3:**

```sql
-- Users (Supabase Auth handles this)
-- We'll use auth.users table

-- Calls
create table calls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  phone_number text not null,
  persona_mode text not null check (persona_mode in ('transparent', 'proxy')),
  status text not null check (status in ('connecting', 'active', 'ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  total_cost numeric(10, 4),
  retell_call_id text unique
);

-- Transcripts
create table transcript_entries (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references calls not null,
  speaker text not null check (speaker in ('business', 'agent', 'whisper')),
  text text not null,
  timestamp timestamptz not null default now()
);

create index idx_transcripts_call on transcript_entries(call_id);

-- Contacts (VS-3)
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  phone_number text not null,
  notes text,
  created_at timestamptz not null default now()
);
```

---

## Open Questions for Implementation

1. **Streaming LLM responses:** Should VS-1 implement streaming? (Retell supports it, adds complexity)
   - **Recommendation:** No streaming in VS-1 (keep simple), add in VS-2 if latency issues arise

2. **Transcript persistence:** Should VS-1 save transcripts to localStorage? (Currently clipboard-only)
   - **Recommendation:** Yes, use IndexedDB for local persistence (helps with testing)

3. **Multi-turn whispers:** What if user whispers twice before agent responds?
   - **Recommendation:** Queue whispers, include all in next LLM context

4. **Agent interruption:** Should urgent whispers use `agent_interrupt` (immediate) vs normal flow?
   - **Recommendation:** VS-1 uses normal flow only (simpler), add interrupt in VS-2 if needed

5. **Error recovery UI:** Should we show detailed error messages or generic "Something went wrong"?
   - **Recommendation:** Detailed errors in dev, generic in prod (don't leak system details)

---

## References

- [Retell AI Custom LLM Integration](../../integrations/retell-ai.md)
- [API Contracts](../../api-contracts.md)
- [Platform Abstraction Strategy](../../architecture.md#platform-abstraction-strategy)
