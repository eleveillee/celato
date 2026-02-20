# VS-001-WOZ: Wizard of Oz Prototype

## Status: ⬚ Not Started

## Philosophy

The Wizard of Oz prototype validates the core "whisper" interaction before investing in full mobile development. By building a web interface first, we can:
- Test the whisper-to-agent flow with real phone calls
- Validate latency assumptions (<2 seconds)
- Measure actual costs (Retell + LLM)
- Prove the concept works before building React Native UI
- Learn about edge cases and failure modes

**This is a functional prototype, not throwaway code.** The web UI can become an admin/testing interface later.

---

## Goal

Validate "whisper" interaction via web interface. User makes a real phone call to a business, whispers text instructions mid-conversation (business doesn't hear), and the AI agent follows the instruction naturally within 2 seconds.

---

## Success Criteria

VS-001 is DONE when:

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | User initiates call via web UI | Enter phone number → "Call" button → Retell call_id received |
| 2 | Call connects to real business | Phone rings, business answers, WebSocket receives `call_details` event |
| 3 | Agent persona mode works | Toggle "Transparent" → agent says "I'm an AI assistant"; "Proxy" → agent speaks as user |
| 4 | Business speaks, transcript appears in UI | Business says something → appears in conversation log within 500ms |
| 5 | Agent responds naturally | LLM generates contextual response → business hears it via Retell TTS |
| 6 | User presses spacebar to whisper | Spacebar held → "Whispering..." indicator → text input active |
| 7 | Whisper instruction is HIDDEN from business | User types "Tell them I'm late" → business does NOT hear this raw text |
| 8 | Agent incorporates whisper naturally | Agent's next speech includes instruction (e.g., "I'm running 5 minutes behind") |
| 9 | Whisper-to-agent latency <2s | Timestamp: whisper submitted → agent response heard by business |
| 10 | Cost tracked in real-time | UI displays running cost, accurate to ±10% |
| 11 | Call completes gracefully | "Hang up" button → call ends, transcript saved locally |
| 12 | Transcript exportable | "Copy" button → full conversation in clipboard |
| 13 | Platform abstraction interfaces defined | All 6 interfaces defined with TypeScript types, web implementations working |
| 14 | Multi-language whisper translation works | Select Spanish → whisper in English → agent speaks Spanish to business |

**Test scenario:**
```
1. Set persona to "Transparent mode"
2. Call local business (e.g., pizza restaurant, library)
3. Agent: "Hello, I'm an AI assistant calling on behalf of Eric. What are your hours?"
4. Business: Responds with hours
5. User whispers: "Ask if they deliver to ZIP 12345"
6. Agent: "Do you deliver to ZIP code 12345?" (natural phrasing)
7. Business: Responds yes/no
8. User: Clicks "Hang up"
9. Verify: Full transcript exported, cost <$0.50 for 2-min call
```

---

## Blocking Decisions

| ID | Question | Status |
|----|----------|--------|
| D-002-KEY | API key management strategy | ✅ Resolved: env vars |
| D-003-WEB | Web framework choice | ✅ Resolved: Next.js 14 |
| D-004-WSP | Whisper prompt transformation approach | ✅ Resolved: LLM transformation (GPT-4o-mini) |
| D-005-ERR | Error handling strategy | ✅ Resolved: Graceful degradation + exponential backoff |
| D-006-PER | Agent persona system prompt design | ✅ Resolved: Mode-specific prompts (transparent/proxy) |

---

## Build Phases

VS-1 is organized into 3 sequential phases. Each phase builds on the previous one and has clear success criteria.

### Phase 1: Core Validation ⬚ [0/4 features]

**Goal:** Prove the whisper concept works with real phone calls.

**Features:**
- F-012-ABS: Platform Abstraction Interfaces → [design](vs1_design.md#platform-abstraction-interfaces)
- F-005-RET: Retell AI Integration → [design](vs1_design.md#retell-websocket-integration)
- F-006-WSP: Whisper Instruction System → [design](vs1_design.md#whisper-loop-implementation)
- F-010-LLM: LLM Integration → [design](vs1_design.md#llm-integration)

**Success Criteria:**
- API orchestrator connects to Retell via Custom LLM WebSocket
- User can submit text whisper via test client
- LLM transforms whisper into natural agent speech
- Business hears agent response, NOT raw whisper text
- Whisper → agent latency <2 seconds
- Platform abstraction interfaces defined and web implementations working

**Test:** wscat test client → send whisper → verify Retell receives transformed response

---

### Phase 2: Production Features 🔄 [0/4 features]

**Goal:** Build usable web UI with full feature set.

**Features:**
- F-004-WEB: Next.js Web Interface → [design](vs1_design.md#web-ui-implementation)
- F-007-PER: Agent Persona System → [design](vs1_design.md#persona-system)
- F-008-CST: Cost Tracking → [design](vs1_design.md#cost-tracking)
- F-009-TRS: Transcript Management

**Success Criteria:**
- User can initiate call from web UI
- Spacebar "whisper" interaction works
- Persona toggle (Transparent vs Proxy) affects agent behavior
- Real-time cost display accurate to ±10%
- Transcript exportable to clipboard

**Test:** Real call to business → whisper mid-call → verify full UX flow

---

### Phase 3: Polish & Deploy ⬚ [0/2 features]

**Goal:** Production deployment with error handling.

**Features:**
- F-011-ERR: Error Handling → [design](vs1_design.md#error-handling-strategy)
- Deploy to Railway (API) + Vercel (web)

**Success Criteria:**
- WebSocket auto-reconnects on disconnect
- LLM timeout handled gracefully
- Errors displayed in UI with recovery options
- Production deployment stable for 24h
- All VS-1 success criteria met

**Test:** Simulate network failures, LLM timeouts, concurrent calls

---

## Feature Details

### F-012-ABS: Platform Abstraction Interfaces ⬚

Define 6 core interfaces for future platform support (mobile, AR, desktop).

**Interfaces:**
- AudioInterface (record, playback)
- InputInterface (text, voice, gestures)
- NotificationInterface (visual, audio, haptic)
- StorageInterface (get, set, remove)
- NetworkInterface (connection quality)
- WebSocketInterface (connect, send, reconnect)

**See:** [vs1_design.md § Platform Abstraction](vs1_design.md#platform-abstraction-interfaces) for full interface definitions and rationale.

### F-005-RET: Retell AI Integration ⬚

Connect to Retell Custom LLM WebSocket for phone call management (text-only protocol).

**Critical:** Retell AI is TEXT-ONLY. No audio routing. Business speech → text transcript → LLM → text response → TTS.

**DTMF support:** Retell `digit_to_press` field in WebSocket responses sends DTMF tones into the call (for secure CC entry per D-021-CLR). **Caveat:** Retell docs don't explicitly state whether `digit_to_press` values appear in their transcript/dashboard logs. Needs verification during integration — test with a real call or contact Retell support.

**See:**
- [vs1_design.md § Retell WebSocket](vs1_design.md#retell-websocket-integration) for protocol implementation
- [spec/integrations/retell-ai.md](../../integrations/retell-ai.md) for full protocol reference

### F-006-WSP: Whisper Instruction System ⬚

Core feature: inject hidden instructions mid-conversation without business hearing.

**How it works:** User whisper → stored in conversation context → LLM transforms → natural agent speech in target language → business hears only output.

**Multi-language (first-class):** User whispers in their preferred language (e.g., English). Agent speaks to business in the call's target language (e.g., Spanish, Mandarin). The LLM translates as part of the whisper transformation — no separate translation step. This is a core whisper capability, not an add-on.

**See:** [vs1_design.md § Whisper Loop](vs1_design.md#whisper-loop-implementation) for 13-step detailed flow.

### F-010-LLM: LLM Integration ⬚

GPT-4o-mini text-based chat completion for agent intelligence.

**Cost:** ~$0.0002/min (vs GPT-4o audio $0.20/min). Latency: 200-400ms.

**Multi-language support:** System prompt includes target language for agent output. LLM natively translates whisper instructions into the target language as part of response generation. No separate translation API call — single LLM pass handles context + instruction + language in one shot. Supported from VS-1 via language selector in pre-call UI.

**See:** [vs1_design.md § LLM Integration](vs1_design.md#llm-integration) for prompt engineering and token tracking.

### F-004-WEB: Next.js Web Interface ⬚

Web UI for call control, whisper input, transcript display, cost tracking.

**Tech:** Next.js 14 (App Router), TypeScript, Tailwind CSS, WebSocket client.

**Pre-call UI includes:**
- Phone number input (E.164)
- Call purpose / context (text area)
- Persona mode selector (Transparent / Proxy)
- **Language selector** — target language for agent speech (English default, Spanish, French, Mandarin, Japanese, etc.). First-class UI element, not buried in settings.

**See:** [vs1_design.md § Web UI](vs1_design.md#web-ui-implementation) for component breakdown.

### F-007-PER: Agent Persona System ⬚

Toggle between Transparent (AI disclosure) and Proxy (speak as user) modes.

**Transparent:** "Hello, I'm an AI assistant calling on behalf of Eric..."
**Proxy:** "Hi, I'm calling to check your store hours..."

**See:** [vs1_design.md § Persona System](vs1_design.md#persona-system) for full system prompt design.

### F-008-CST: Cost Tracking ⬚

Real-time cost display: Retell ($0.08/min) + LLM tokens.

**See:** [vs1_design.md § Cost Model](vs1_design.md#cost-model) for detailed breakdown.

### F-009-TRS: Transcript Management ⬚

Local transcript storage and clipboard export (JSON or Markdown format).

### F-011-ERR: Error Handling ⬚

Auto-reconnect, LLM timeouts, rate limits, network failures.

**See:** [vs1_design.md § Error Handling](vs1_design.md#error-handling-strategy) for retry logic and fallbacks.

---

## Deployment

**Split deployment:** Railway (API + WebSockets) + Vercel (Next.js frontend).

**See:** [vs1_design.md § Deployment](vs1_design.md#deployment-architecture) for full configuration and environment variables.

---

## Transition Checklist

Before moving to VS-002 (Mobile MVP):

- [ ] All 3 phases complete (Core Validation, Production Features, Polish & Deploy)
- [ ] All features ✅ or explicitly deferred with rationale
- [ ] All blocking decisions resolved (D-004, D-005, D-006)
- [ ] Test scenario completed successfully (real business call with all success criteria met)
- [ ] Learnings documented in `spec/tracking/learnings.md`:
  - Whisper latency (actual vs target <2s)
  - Retell AI integration lessons
  - Cost analysis (actual vs estimated ~$0.08/min)
  - Persona mode effectiveness (transparent vs proxy)
  - LLM prompt engineering insights
- [ ] Cost analysis complete (actual vs estimated ~$0.08/min)
- [ ] Architecture decisions validated (text-based Retell, Railway + Vercel deployment)
- [ ] Platform abstraction interfaces validated (web implementations working)
- [ ] VS-001 marked complete in [milestone.md](../milestone.md)
- [ ] VS-002 dependencies confirmed (mobile can reuse API architecture + shared business logic)
