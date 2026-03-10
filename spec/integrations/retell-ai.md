# Retell AI Integration Reference

> **Critical Technical Documentation**
> This file contains essential Retell AI integration details discovered through research.
> Read this BEFORE implementing any Retell features.

---

## Key Discovery: Text-Only Protocol

**Retell AI's "Custom LLM" mode is TEXT-BASED, not audio.**

| What Retell Handles | What You Handle |
|-------------------|-----------------|
| ✅ Speech-to-Text (ASR) | ❌ (Retell does this) |
| ✅ Text-to-Speech (TTS) | ❌ (Retell does this) |
| ❌ LLM Intelligence | ✅ **Your responsibility** |
| ✅ Phone call management | ❌ (Retell does this) |
| ✅ Voice Activity Detection | ❌ (Retell does this) |
| ✅ Turn-taking logic | ❌ (Retell does this) |

**Implication:** You receive text transcripts from Retell, process with your LLM, return text responses. Retell handles all audio encoding/decoding.

**This is fundamentally different from OpenAI Realtime API (which is audio-to-audio).**

---

## WebSocket Protocol

### Connection

**Endpoint:** `wss://your-server.com/llm-websocket/{call_id}`

- **Protocol:** Bidirectional WebSocket
- **Message format:** JSON text (no binary frames)
- **One connection per call** (identified by `call_id`)
- **Connection lifecycle:** Established when call starts, closed when call ends

### Message Flow

```
1. Retell initiates call → connects to your WebSocket
2. Server sends initial config message
3. Retell sends call_details event
4. Bidirectional conversation begins
   - Retell sends: transcripts, turn-taking signals
   - Server sends: agent responses (text)
5. Call ends → WebSocket closes
```

---

## Message Types: Retell → Server

### 1. `call_details` (Call Start)

**When:** Immediately after connection (if `call_details: true` in config)

**Payload:**
```typescript
{
  interaction_type: "call_details",
  call: {
    call_id: string,
    agent_id: string,
    from_number: string,
    to_number: string,
    direction: "inbound" | "outbound",
    // ... other metadata
  }
}
```

**Your response:** Send initial `config` message (see below).

---

### 2. `update_only` (Live Transcript)

**When:** Continuously during conversation

**Payload:**
```typescript
{
  interaction_type: "update_only",
  transcript: [
    {
      role: "agent" | "user",
      content: string,
      words: Array<{ word: string, start: number, end: number }>
    }
  ]
}
```

**Your response:** None required (informational only). Use for real-time transcript display.

---

### 3. `response_required` (Turn Boundary)

**When:** User stops speaking, agent response needed

**Payload:**
```typescript
{
  interaction_type: "response_required",
  response_id: number,
  transcript: [/* full conversation history */]
}
```

**Your response:** REQUIRED. Send `response` message with agent speech (see below).

**Critical:** This is where you inject whisper instructions! See "Whisper Implementation" section.

---

### 4. `reminder_required` (User Silent)

**When:** User hasn't spoken for configured duration

**Payload:**
```typescript
{
  interaction_type: "reminder_required",
  response_id: number
}
```

**Your response:** Send gentle reminder (e.g., "Are you still there?" or "Is there anything else I can help with?")

---

### 5. `ping_pong` (Keepalive)

**When:** Every 2 seconds (if `auto_reconnect: true`)

**Payload:**
```typescript
{
  interaction_type: "ping_pong",
  timestamp: number
}
```

**Your response:** Echo timestamp back immediately (prevents disconnection).

---

## Message Types: Server → Retell

### 1. `config` (Initial Setup)

**When:** Immediately on connection

**Payload:**
```typescript
{
  response_type: "config",
  config: {
    auto_reconnect: boolean,        // Enable ping/pong keepalive (RECOMMENDED: true)
    call_details: boolean,          // Receive call_details event (RECOMMENDED: true)
    transcript_with_tool_calls?: boolean
  }
}
```

**Example:**
```typescript
socket.send(JSON.stringify({
  response_type: "config",
  config: {
    auto_reconnect: true,
    call_details: true
  }
}));
```

---

### 2. `response` (Agent Speech)

**When:** In response to `response_required` or `reminder_required`

**Payload:**
```typescript
{
  response_type: "response",
  response_id: number,           // Must match request's response_id
  content: string,               // What agent should say (text)
  content_complete: boolean,     // true if this is the final chunk
  end_call?: boolean             // Optional: end call after this response
}
```

**Streaming support:**
```typescript
// First chunk
{ response_type: "response", response_id: 3, content: "Hello, I'm", content_complete: false }

// Second chunk
{ response_type: "response", response_id: 3, content: " calling to check", content_complete: false }

// Final chunk
{ response_type: "response", response_id: 3, content: " your store hours.", content_complete: true }
```

**Note:** Retell starts TTS at first **sentence boundary**, not first chunk. Sentence-level streaming is recommended.

---

### 3. `agent_interrupt` (Force Agent to Speak)

**When:** Need to interrupt current speaker immediately

**Payload:**
```typescript
{
  response_type: "agent_interrupt",
  response_id: number,
  content: string,
  content_complete: boolean
}
```

**Behavior:**
- Interrupts agent if agent is speaking
- Interrupts user if user is speaking
- Plays immediately (doesn't wait for turn boundary)

**Use cases:**
- Emergency override (user says "stop")
- Urgent correction
- Time-sensitive information

**⚠️ WARNING for Celato:** Business WILL hear the `content` text. Use this for immediate interruptions only, NOT for hidden whisper instructions.

---

### 4. `ping_pong` (Keepalive Response)

**When:** In response to `ping_pong` from Retell

**Payload:**
```typescript
{
  response_type: "ping_pong",
  timestamp: number  // Echo back the same timestamp
}
```

---

## Whisper Implementation (Hidden Instructions)

**Goal:** User whispers instruction that business does NOT hear.

**❌ WRONG Approach:**
```typescript
// Business will hear this!
socket.send(JSON.stringify({
  response_type: "agent_interrupt",
  content: "Tell them I'm running late"  // ❌ Business hears raw whisper
}));
```

**✅ CORRECT Approach:**

```typescript
// 1. User whispers: "Tell them I'm running late"
const whisper = "Tell them I'm running late";

// 2. Store in conversation context (hidden from business)
session.conversationContext.push({
  role: "system",
  content: `[DIRECTOR INSTRUCTION: ${whisper}]`
});

// 3. Wait for next response_required event
socket.on('message', async (data) => {
  const msg = JSON.parse(data);

  if (msg.interaction_type === 'response_required') {
    // 4. Send conversation + whisper to LLM
    const llmResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant..." },
        ...session.conversationContext,  // Includes whisper instruction
        { role: "user", content: msg.transcript.last().content }
      ]
    });

    // 5. LLM transforms whisper into natural speech
    // Input: "Tell them I'm running late"
    // Output: "Apologies, I'm running about 5 minutes behind schedule."

    // 6. Send only the LLM output to business
    socket.send(JSON.stringify({
      response_type: "response",
      response_id: msg.response_id,
      content: llmResponse.choices[0].message.content,  // ✅ Natural speech only
      content_complete: true
    }));
  }
});
```

**Key insight:** The whisper never goes to Retell directly. It only influences the LLM's next response.

---

## Agent Behavior Tuning

**Configuration options** (set in Retell dashboard or via API):

| Parameter | Range | Effect |
|-----------|-------|--------|
| `responsiveness` | 0.0 - 1.0 | How eager agent is to speak (higher = interrupts more) |
| `interruption_sensitivity` | 0.0 - 1.0 | How easily agent is interrupted (higher = stops speaking faster) |
| `reminder_trigger_ms` | milliseconds | Silence duration before `reminder_required` fires |
| `reminder_max_count` | integer | Max reminders before giving up |

**Recommended for Celato:**
- `responsiveness: 0.7` (moderate eagerness)
- `interruption_sensitivity: 0.8` (easy to interrupt when user whispers)
- `reminder_trigger_ms: 10000` (10 seconds)

---

## Latency Budget

**Target latency breakdown:**

| Component | Target | Max Acceptable |
|-----------|--------|----------------|
| **Time to First Token (TTFT)** | <200ms | <300ms |
| **Time to First Sentence** | <400ms | <600ms |
| **LLM Processing (GPT-4o-mini)** | 200-400ms | <800ms |
| **End-to-End (user stops → agent speaks)** | <500ms | <800ms |

**Retell's benchmarks:**
- Production systems achieve **sub-500ms** end-to-end
- **Time to first sentence** matters more than full completion
- Streaming responses start playing before full text is generated

**For Celato's whisper loop:**
```
User submits whisper (50ms) →
LLM transformation (200-400ms) →
Response sent to Retell (50ms) →
Retell TTS (200-300ms) →
Business hears agent (<1000ms total)
✅ Well within 2-second target
```

---

## Session Management

**Your responsibility:** Link Retell's `call_id` to your user session.

```typescript
interface CallSession {
  callId: string;              // From WebSocket path param
  webUiWs: WebSocket;          // User's web UI connection
  retellWs: WebSocket;         // Retell's Custom LLM connection
  conversationContext: Array<{
    role: "system" | "user" | "assistant",
    content: string
  }>;
  whisperQueue: string[];      // Pending whispers
  costTracker: CostTracker;
  personaMode: "transparent" | "proxy";
}

const activeCalls = new Map<string, CallSession>();

// When Retell connects
server.get('/llm-websocket/:call_id', { websocket: true }, (socket, req) => {
  const callId = req.params.call_id;
  const session = activeCalls.get(callId);

  if (!session) {
    socket.close(1008, "Unknown call_id");
    return;
  }

  session.retellWs = socket;
  // ... handle messages
});
```

---

## Error Handling

**Common failure modes:**

| Error | Cause | Mitigation |
|-------|-------|-----------|
| WebSocket disconnect | Network issue, Retell restart | Auto-reconnect with exponential backoff |
| Invalid `response_id` | Out-of-order messages | Track latest response_id, ignore stale requests |
| LLM timeout | OpenAI slow/down | Fallback response: "One moment please..." |
| TTS failure | Retell internal error | Log error, continue conversation if possible |

**Example auto-reconnect:**
```typescript
socket.on('close', () => {
  let attempts = 0;
  const reconnect = () => {
    if (attempts >= 3) {
      session.webUiWs.send({ type: "call_error", message: "Connection lost" });
      return;
    }

    setTimeout(() => {
      attempts++;
      // Retell will reconnect automatically if call is still active
    }, Math.pow(2, attempts) * 1000);  // Exponential backoff
  };

  reconnect();
});
```

---

## Cost Model

**Retell AI pricing** (as of 2026):
- **Base cost:** ~$0.05-0.10 per minute (includes ASR + TTS + platform)
- **ASR:** Deepgram or Whisper (built-in)
- **TTS:** ElevenLabs, Azure, or other providers (configurable in Retell dashboard)

**Your LLM costs** (GPT-4o-mini):
- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens
- **Typical conversation:** ~500 input + 200 output tokens/minute = ~$0.00019/min

**Total cost per minute:** ~$0.08-0.10 (Retell) + $0.0002 (LLM) ≈ **$0.08/min**

**Much cheaper than originally estimated!** (Was $0.25/min with OpenAI Realtime API)

---

## KYC & Development Testing

### What KYC Blocks

KYC (via Persona / withpersona.com) is required to **purchase phone numbers** and **make/receive PSTN calls**. It does NOT block development or web-based testing.

| Feature | KYC Required? | Notes |
|---------|---------------|-------|
| Web call testing (dashboard "Test" button) | No | Browser ↔ agent voice call |
| Web Call SDK (`create_web_call` API) | No | Deploy voice agent to your own site |
| Custom LLM WebSocket (`/llm-websocket/:call_id`) | No | Your orchestrator works regardless |
| LLM Playground (text-based prompt testing) | No | Test prompts without voice |
| Batch simulation testing (LLM-to-LLM) | No | Automated test scenarios |
| Purchase phone number | **Yes** | Blocked until KYC approved |
| Outbound PSTN calls | **Yes** | Blocked until KYC approved |
| Inbound PSTN calls | **Yes** | Blocked until KYC approved |

### Testing the Celato Web App Without KYC

The **Web Call SDK** lets you test the full whisper loop without a phone number:

1. **API creates a web call** via Retell's `create_web_call` endpoint (returns an `access_token`)
2. **Browser connects** to Retell using their Web Call SDK with that token
3. **Retell connects** to your `/llm-websocket/:call_id` endpoint (same as PSTN calls)
4. **Full loop works:** user speaks in browser → Retell ASR → your orchestrator → LLM → Retell TTS → user hears agent

The browser acts as "the business" — you're talking to your own agent. This validates the entire whisper pipeline (orchestrator, LLM transformation, transcript display, cost tracking, error handling) without needing a real phone number.

**Limitation:** No real third-party business on the line. True three-way dynamic (user + agent + business) requires PSTN calls and KYC.

**Auto-detection logic:** If `RETELL_FROM_NUMBER` is set AND the user provides a phone number, the API uses PSTN calls (`create-phone-call`). Otherwise, it falls back to web calls (`create-web-call`). No code changes needed to switch — just set the env var when KYC is approved.

**Status:** ✅ Implemented. See `retell-service.ts` (`createRetellWebCall`), `user-ws.ts` (auto-detection), `call-app.tsx` (Retell Web SDK integration).

**Docs:** https://docs.retellai.com/deploy/web-call

### KYC Troubleshooting

**Known issue:** Persona verification fails when document country (e.g., Canada) doesn't match IP country (e.g., Europe). The geolocation mismatch triggers Persona's fraud detection. VPNs make it worse (Persona detects them).

**Resolution:** Email `support@retellai.com` requesting manual KYC verification. Retell staff have confirmed manual review is available when Persona fails.

---

## Official Resources

- **Documentation:** https://docs.retellai.com/api-references/llm-websocket
- **Integration Guide:** https://docs.retellai.com/integrate-llm/integrate-llm
- **Node.js Demo:** https://github.com/RetellAI/retell-custom-llm-node-demo
- **Python Demo:** https://github.com/RetellAI/retell-custom-llm-python-demo
- **Latency Benchmarks:** https://www.retellai.com/resources/sub-second-latency-voice-assistants-benchmarks

---

## Quick Reference

**Minimal working implementation:**

```typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const server = Fastify();
await server.register(websocket);

server.get('/llm-websocket/:call_id', { websocket: true }, (socket, req) => {
  const callId = req.params.call_id;

  // 1. Send config
  socket.send(JSON.stringify({
    response_type: "config",
    config: { auto_reconnect: true, call_details: true }
  }));

  // 2. Handle messages
  socket.on('message', async (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.interaction_type === 'response_required') {
      // 3. Generate agent response (call LLM here)
      const agentText = await generateResponse(msg.transcript);

      // 4. Send back to Retell
      socket.send(JSON.stringify({
        response_type: "response",
        response_id: msg.response_id,
        content: agentText,
        content_complete: true
      }));
    }

    if (msg.interaction_type === 'ping_pong') {
      // 5. Echo ping
      socket.send(JSON.stringify({
        response_type: "ping_pong",
        timestamp: msg.timestamp
      }));
    }
  });
});

server.listen({ port: 4000 });
```

---

## Gotchas & Common Mistakes

1. **Don't send audio to Retell** - It's text-only!
2. **Always respond to `response_required`** - Call will hang if you don't
3. **Match `response_id`** - Retell ignores responses with wrong ID
4. **Echo `ping_pong` immediately** - Delays cause disconnection
5. **Don't use `agent_interrupt` for whispers** - Business will hear it!
6. **Streaming is sentence-based** - Retell waits for complete sentences before TTS
7. **`auto_reconnect: true` is essential** - Prevents random disconnections

---

**Last updated:** 2026-03-09
**Researched by:** AI agent analysis of official Retell AI documentation and demo codebases
