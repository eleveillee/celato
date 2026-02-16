# Decisions

Technical decisions: open questions awaiting resolution and resolved decisions for reference.
This serves as a lightweight Architecture Decision Record (ADR).

---

## Open Questions

_No open technical decisions currently._

| ID | Question | Context | Blocks | Status |
|----|----------|---------|--------|--------|

### Template for Open Questions
```markdown
### D-###-TAG: [Short question]
**Context:** Why this decision is needed.
**Blocks:** F-003-INV, VS-002-AUT _(which features/slices are waiting on this?)_
**Options:**
| | Option | Pros | Cons |
|---|---|---|---|
| ⭐ | Recommended | ... | ... |
| 🔄 | Alternative | ... | ... |
**Decision:** Pending

_Example IDs: D-005-ARC (Architecture), D-012-DBS (DataBaSe choice)_
```

## Resolved Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D-001-SLC | Use "slices" not "cycles" for VS tracking | Consistent terminology, vertical integration focus | 2026-02-12 |
| D-002-KEY | API keys via environment variables | Simple, secure for Railway deployment, no additional infrastructure needed | 2026-02-16 |
| D-003-WEB | Next.js 14 for VS-1 web UI | Fast development, Vercel deployment for frontend, foundation for future mobile app (React patterns) | 2026-02-16 |
| D-004-WSP | LLM transformation for whispers (GPT-4o-mini) | Natural, context-aware output vs robotic template-based; ~200-400ms latency acceptable | 2026-02-16 |
| D-005-ERR | Graceful degradation + exponential backoff | Better UX than fail-fast; auto-reconnect for transient failures, fallback responses for timeouts | 2026-02-16 |
| D-006-PER | Mode-specific system prompts (transparent vs proxy) | Clear prompt engineering for both modes; transparent identifies as AI, proxy speaks as user | 2026-02-16 |
| D-013-LLM | Multi-model LLM provider architecture | Abstraction layer enables model switching, cost optimization, and provider failover | 2026-02-16 |
| D-014-LAT | Latency optimization strategy | Streaming + prompt caching + predicted responses for sub-500ms typical latency | 2026-02-16 |
| D-015-CTX | Pre-call context input | User provides call purpose before dialing for immediate context | 2026-02-16 |
| D-016-CDG | Context-driven phrase generation | Pre-generate high-probability responses based on user's stated intent (90-95% hit rate) | 2026-02-16 |

### D-001-SLC: Terminology - "Slices" not "Cycles"
**Date:** 2026-02-12

**Context:** During Shabti/Codex architecture sync, noticed inconsistent terminology:
- Shabti used `spec/tracking/cycles/` for vertical slice documents
- Codex uses `spec/tracking/slices/` for the same purpose
- "Cycles" implies time-boxed iterations; "slices" emphasizes vertical integration

**Decision:** Use "Vertical Slices" (slices/) consistently across all Codex-based projects.

**Rationale:**
- "Vertical Slice" is the established pattern name in workflow.md
- Avoids confusion with time-boxed "development cycles" or "sprint cycles"
- Consistent with VS-### ID convention already in use
- Emphasizes end-to-end functionality over time-boxing

**Consequences:**
- All Codex-based projects use `spec/tracking/slices/` directory
- Older projects with `cycles/` should be migrated to `slices/` for consistency
- workflow.md updated with terminology clarification
- AI agents will be trained to use "slice" terminology

**Impact:** Shabti's `spec/tracking/cycles/` will be renamed to `slices/` in a future update.

---

### Template for Resolved Decisions
```markdown
### D-###-TAG: [What was decided]
**Context:** Why this came up.
**Decision:** What we chose.
**Rationale:** Why we chose it.
**Consequences:** What this means going forward.

_Example IDs: D-005-ARC (Architecture), D-012-DBS (DataBaSe choice)_
```

---

## Decision Details

### D-002-KEY: API Key Management Strategy ✅ RESOLVED

**Context:** VS-1 requires Retell AI, OpenAI, and potentially Deepgram API keys. Need a secure, simple way to manage them across local dev and Railway deployment.

**Decision:** Use environment variables (.env files).

**Rationale:**
- Simple: Railway provides built-in env var management in dashboard
- Secure: .env files are gitignored, keys never committed
- Standard: Aligns with 12-factor app principles
- No additional infrastructure: Avoids complexity of secrets managers for MVP

**Implementation:**
- `.env` file in project root (local dev, gitignored)
- `.env.example` with placeholder values (committed as template)
- Railway dashboard for production env vars
- Node.js `--env-file` flag loads .env automatically

**Consequences:**
- API keys must be manually added to Railway after deployment
- No secret rotation strategy (acceptable for MVP, revisit in VS-3)
- Developers need .env file locally (document in setup guide)

---

### D-003-WEB: Frontend Architecture Strategy ✅ RESOLVED

**Context:** Celato needs both web and mobile interfaces. Decision required: single codebase (Expo Universal) or separate codebases (hybrid).

**Decision:** **Hybrid approach** — Next.js (web) + Expo (mobile), with shared business logic.

**Rationale:**
- **Audio APIs require platform-specific code anyway:** Expo doesn't provide unified audio API across web and mobile. Web requires `navigator.mediaDevices.getUserMedia()` (Web Audio API), mobile uses `expo-audio`. Even with Expo Universal, you'd need `Platform.OS === 'web'` branching — no true "write once" benefit for the hardest part (audio).
- **Web performance:** Next.js bundles are 2-3x smaller than React Native Web (~150-300 KB vs ~400-800 KB gzipped). Critical for real-time transcript display.
- **Production-ready, no throwaway work:** VS-1 Next.js web UI becomes production web interface (desktop + mobile browsers). VS-2 adds native mobile apps.
- **40-50% code reuse:** Business logic (WebSocket client, API types, cost tracking, state management) extracted to `packages/shared` and imported by both platforms.
- **Golden path:** Best web performance (Next.js SSR/ISR) + best mobile performance (native Expo) + significant code reuse.

**Alternatives considered:**
- **Expo Universal (single codebase):** ~80% code reuse but heavier web bundles, platform-specific audio code anyway, suboptimal web performance.
- **Separate with no sharing:** 0% code reuse, full duplication of business logic (rejected).

**Consequences:**
- **VS-1:** Next.js web UI (Vercel deployment)
- **VS-2:** Expo mobile UI (EAS deployment for iOS/Android)
- **Shared:** `packages/shared` for business logic, API client, types
- Two UI codebases to maintain (Next.js + Expo)
- Separate styling (Tailwind CSS + React Native StyleSheet)
- Platform-specific audio implementations (optimal for each)
- Independent deployment schedules (web and mobile can evolve separately)

---

### D-004-WSP: Whisper Transformation Approach ✅ RESOLVED

**Context:** User whispers "Tell them I'm running late" → agent should say something natural like "Apologies, I'm running about 5 minutes behind schedule." How do we transform whispers?

**Blocks:** VS-001 F-006-WSP (Whisper Instruction System)

**Options:**

| | Option | Pros | Cons |
|---|--------|------|------|
| ⭐ | **LLM transformation (GPT-4o-mini)** | Natural, context-aware, handles edge cases | Adds 200-400ms latency, costs ~$0.0002/whisper |
| 🔄 | Template-based (string replacement) | Fast (0ms), free, predictable | Robotic phrasing, no context awareness |
| 🔄 | Hybrid (templates + LLM fallback) | Fast for common cases, flexible for complex | More complex implementation |

**Recommendation:** LLM transformation with GPT-4o-mini.

**LLM Prompt Example:**
```
You are transforming a user's whisper instruction into natural agent speech.

User whispered: "Tell them I'm running late"
Current conversation context: [last 3 turns]

Transform this into a natural, polite statement the agent should say:
```

**Output:** "Apologies, I'm running about 5 minutes behind schedule."

**Decision:** **LLM transformation with GPT-4o-mini** (resolved 2026-02-16).

**Rationale:**
- Natural, context-aware transformations
- Adapts to conversation flow
- 200-400ms latency is acceptable (<2s total budget)
- Cost negligible (~$0.0002/whisper)

**Implementation:** See [vs1_design.md § LLM Integration](slices/vs1_design.md#llm-integration--prompt-engineering) for full prompt structure.

---

### D-005-ERR: Error Handling Strategy ✅ RESOLVED

**Context:** What happens when Retell WebSocket disconnects, LLM times out, or OpenAI API returns an error mid-call?

**Blocks:** VS-001 F-011-ERR (Error Handling)

**Options:**

| | Option | Pros | Cons |
|---|--------|------|------|
| ⭐ | **Graceful degradation + retry** | Better UX, recovers from transient failures | More complex implementation |
| 🔄 | Fail fast (end call immediately) | Simple, clear errors | Poor UX, frustrating for users |

**Recommendation:** Graceful degradation with exponential backoff.

**Proposed Behavior:**

| Error | Strategy | User Experience |
|-------|----------|----------------|
| Retell WebSocket disconnect | Auto-reconnect (3 attempts, exponential backoff) | UI shows "Reconnecting..." indicator |
| LLM timeout (>5s) | Send fallback response: "One moment please..." | Conversation continues naturally |
| OpenAI rate limit | Queue whisper, retry after 1s | Whisper delayed but not lost |
| Network error (web UI) | Show error modal, "Retry" button | User can manually retry |

**Decision:** **Graceful degradation with exponential backoff** (resolved 2026-02-16).

**Rationale:**
- Better UX than fail-fast
- Recovers from transient network issues
- Fallback responses maintain conversation flow
- Clear error messages for permanent failures

**Implementation:** See [vs1_design.md § Error Handling Strategy](slices/vs1_design.md#error-handling-strategy) for retry logic and error type matrix.

---

### D-006-PER: Agent Persona System Prompt Design ✅ RESOLVED

**Context:** Agent can operate in multiple modes:
- **Transparent mode:** Agent identifies as AI ("I'm an AI assistant calling on behalf of Eric")
- **Semi-Transparent mode:** Agent mentions user but not AI identity ("I'm calling on behalf of Eric")
- **Proxy mode:** Agent speaks AS the user ("I'm calling to check store hours")

Need to design system prompts that enforce these behaviors.

**Blocks:** VS-001 F-007-PER (Agent Persona System)

**Proposed System Prompts:**

#### Transparent Mode
```
You are an AI assistant making a phone call on behalf of your client, Eric.

CRITICAL RULES:
- Always identify yourself as an AI assistant in your first turn
- Refer to Eric in third person ("my client", "the person I'm calling for")
- Be polite, professional, and helpful
- If asked about your nature, be honest: "I'm an AI assistant"

Example greeting: "Hello, I'm an AI assistant calling on behalf of Eric. [state purpose]"
```

#### Semi-Transparent Mode (VS-3+)
```
You are calling on behalf of Eric.

CRITICAL RULES:
- Introduce yourself as calling on behalf of Eric
- Do NOT mention that you are an AI (unless directly asked)
- Refer to Eric in third person ("Eric", "my client")
- Be polite, professional, and helpful

Example greeting: "Hello, I'm calling on behalf of Eric to [state purpose]"
```

#### Proxy Mode
```
You are making a phone call as Eric.

CRITICAL RULES:
- Speak in first person ("I'm calling to...", "I need to...")
- Do NOT mention that you are an AI
- If directly asked, deflect naturally: "I'm just calling to check on [topic]"
- Be polite, professional, and helpful

Example greeting: "Hi, I'm calling to check on [topic]."
```

**Decision:** **Mode-specific system prompts** (resolved 2026-02-16).

**Transparent mode (VS-1):** Agent identifies as AI, refers to user in third person.
**Proxy mode (VS-1):** Agent speaks as user in first person, no AI disclosure.
**Semi-Transparent mode (VS-3+):** Agent mentions user but not AI identity — middle ground for professional contexts.

**Rationale:**
- Clear prompt engineering for each mode
- User chooses transparency level
- Transparent mode ensures ethical AI disclosure
- Proxy mode enables more natural conversations when appropriate
- Semi-Transparent balances honesty with naturalness ("calling on behalf of" is common business practice)

**Implementation:** See [vs1_design.md § LLM Integration](slices/vs1_design.md#llm-integration--prompt-engineering) for full system prompt examples.

**Open Questions Resolved:**
1. Proxy mode ethical constraints → User's responsibility, agent follows instructions
2. "Are you a robot?" in Proxy mode → Deflect naturally ("I'm calling to check on [topic]")
3. Semi-Transparent mode → **Added as VS-3+ feature** — good default for professional contexts

---

### D-013-LLM: Multi-Model Provider Architecture ✅ RESOLVED

**Context:** User may want to choose between different LLM providers (OpenAI, Anthropic, etc.) or models (GPT-4o-mini vs GPT-4o) for cost vs quality tradeoffs.

**Blocks:** F-010-LLM (LLM Integration), future cost optimization

**Decision:** **Abstraction layer for LLM providers** (resolved 2026-02-16).

**Architecture:**
```typescript
// packages/shared/interfaces/llm-provider.ts
interface LLMProvider {
  name: string; // "openai-gpt4o-mini", "anthropic-claude-sonnet"

  complete(params: {
    messages: ChatMessage[];
    systemPrompt: string;
    stream?: boolean;
  }): Promise<LLMResponse>;

  costPerInputToken: number;
  costPerOutputToken: number;
}
```

**Implementation Timeline:**
- **VS-1:** OpenAI GPT-4o-mini only (simplest integration)
- **VS-3:** Add model selection in user settings (GPT-4o, Claude Sonnet, Llama, etc.)
- **VS-3:** Auto-switch models based on conversation complexity

**Rationale:**
- Easy to A/B test different models
- User preference for cost vs quality
- Fallback to different provider if primary fails
- Future: smart model selection based on task complexity

**Consequences:**
- All LLM calls go through abstraction layer (slight indirection)
- Model-specific optimizations (like OpenAI prompt caching) implemented per provider
- Cost tracking unified across all providers

---

### D-014-LAT: Latency Optimization Strategy ✅ RESOLVED

**Context:** Current latency budget: whisper → business hears response in <2 seconds. User feedback: 2 seconds feels too long for normal interaction. Need aggressive latency optimization.

**Goal:** **Sub-500ms typical latency** for normal conversation, <1s for complex whispers.

**Decision:** **Multi-layered latency optimization** (resolved 2026-02-16).

**Strategies:**

| Strategy | Latency Savings | Implementation Complexity | VS |
|----------|----------------|---------------------------|-----|
| **Streaming responses** | 200-400ms (start TTS immediately) | Medium | VS-1 |
| **Prompt caching** | 50-100ms (cached system prompt) | Low (OpenAI native) | VS-1 |
| **Predicted responses** | 300-500ms (instant playback) | Medium | VS-2 |
| **Context windowing** | 20-50ms (fewer tokens) | Low | VS-1 |
| **Parallel processing** | 100-200ms (LLM + TTS overlap) | High | VS-3 |

**Detailed Implementation:**

**1. Streaming Responses (VS-1)**
```typescript
// Start TTS as soon as first tokens arrive
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  stream: true
});

let fullResponse = '';
for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || '';
  fullResponse += delta;

  // Send to Retell as soon as we have a complete sentence
  if (delta.match(/[.!?]\s/)) {
    retellSocket.send({
      response_type: 'response',
      content: fullResponse,
      content_complete: false // More coming
    });
  }
}
```

**2. Prompt Caching (VS-1)**
```typescript
// OpenAI caches system prompt automatically
// Saves 50-100ms on repeat calls with same system prompt
const systemPrompt = buildSystemPrompt(session.personaMode);
// First call: ~400ms, subsequent calls: ~250ms
```

**3. Predicted Responses (VS-2)**
```typescript
// Pre-generate common responses, play instantly
const PREDICTED_RESPONSES = {
  'yes': 'Yes, that works for me.',
  'no': 'No, that won't work.',
  'wait': 'One moment please, let me check.',
  'confirm': 'Yes, that's correct.'
};

// If user whispers "say yes", play pre-generated audio immediately
// Latency: ~50ms (WebSocket only), no LLM call
```

**4. Context Windowing (VS-1)**
```typescript
// Only send last 10 turns to LLM (not full history)
const recentContext = conversation.slice(-10);
// Saves 20-50ms on token processing
```

**5. Parallel Processing (VS-3)**
```typescript
// Start TTS generation while LLM is still generating
// Overlap LLM (200ms) + TTS (200ms) → total 200ms instead of 400ms
```

**Expected Latency After Optimizations:**

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Normal conversation (business → agent) | 450-800ms | **250-400ms** | 40-50% |
| Whisper (user → agent) | 450-800ms | **300-500ms** | 35-40% |
| Predicted response (common phrases) | 450-800ms | **50-100ms** | 85-90% |

**Rationale:**
- Streaming gives biggest win for minimal complexity
- Prompt caching is free (OpenAI native)
- Predicted responses cover 60-70% of simple whispers
- Combined effect: sub-500ms typical latency

**Consequences:**
- More complex WebSocket message handling (streaming)
- Need to build predicted response library
- Trade-off: context window size vs latency (acceptable for most calls)

**Implementation:** See [vs1_design.md § Latency Optimization](slices/vs1_design.md#latency-optimization) for full technical details.

---

### D-015-CTX: Pre-Call Context Input ✅ RESOLVED

**Context:** User needs to provide call purpose/context before dialing so agent has full information from turn 1. Currently, agent starts cold and user must whisper context.

**Blocks:** F-004-WEB (Web UI), future contact management

**Decision:** **Pre-call context input field** (resolved 2026-02-16).

**Implementation:**

**VS-1: Basic Context Input**
```typescript
interface CallContext {
  phoneNumber: string;
  businessName?: string;
  purpose: string; // "Make dinner reservation for 2 at 7pm Friday"
  userNotes?: string; // "Mention I have nut allergies"
}

// System prompt includes context
const systemPrompt = `You are calling ${context.businessName || 'a business'} to ${context.purpose}.

${context.userNotes ? `Important: ${context.userNotes}` : ''}

Your opening: State the purpose clearly in your first turn.`;
```

**VS-3: Contact Context (Pre-filled)**
```typescript
interface Contact {
  name: string;
  phone: string;
  contextNotes: string; // "Always order large pepperoni. Tip 20%."
  commonPhrases: string[]; // Pre-cached sentences
  callHistory: number;
}

// When calling saved contact, context auto-filled
// Common phrases pre-generated and cached
```

**VS-2: Sentence Caching**
```typescript
// Two-level cache
const UNIVERSAL_CACHE = {
  'yes': { audio: Buffer, text: 'Yes, that works.' },
  'no': { audio: Buffer, text: 'No, that won't work.' }
  // ~10 universal phrases
};

const CONTEXT_SPECIFIC_CACHE = {
  'restaurant': {
    'make_reservation': 'I'd like to make a reservation for [N] people.',
    'check_hours': 'What are your hours today?'
    // ~20 restaurant-specific phrases
  },
  'support': {
    'check_status': 'I'm checking on my order status.',
    // ~20 support-specific phrases
  }
};

// Hit rate tracking + auto-pruning low-usage entries
```

**Rationale:**
- Eliminates cold start (agent has context from turn 1)
- Reduces latency (pre-cached common phrases = instant playback)
- Better UX (user doesn't need to whisper basic context)
- Contact context enables personalization (remembers preferences)

**Expected Impact:**
- **Latency:** Common phrases 50-100ms (cached) vs 300-500ms (LLM)
- **Cost:** Cache reduces LLM calls by 30-40% for repeat contacts
- **UX:** Natural opening ("I'm calling to make a reservation for 2...") vs awkward cold start

**Implementation Timeline:**
- **VS-1:** Basic purpose input field (text area, optional)
- **VS-2:** Universal sentence cache (10-15 common phrases)
- **VS-3:** Contact context + context-specific cache (restaurant, support, etc.)
- **VS-4+:** Hit rate optimization + cache personalization per user

**Consequences:**
- Web UI needs purpose input field (3-4 lines, above "Call" button)
- Cache storage: ~5-10 MB for audio buffers (acceptable)
- Need cache invalidation strategy (TTS voice changes, phrase updates)

---

## Future Optimizations (Backlog)

### Speculative Response Generation (BL-015-SPG)

**Concept:** Pre-generate 2-3 likely responses in parallel while agent is speaking. If conversation goes predicted direction, instant response. If not, discard predictions.

**Example:**
```typescript
// While agent asks "Does that work for you?"
// Generate 3 speculative responses in parallel
const [yesResponse, noResponse, repeatResponse] = await Promise.all([
  llm.complete({ predicted: "Yes, that works" }),
  llm.complete({ predicted: "No, that doesn't work" }),
  llm.complete({ predicted: "Can you repeat that?" })
]);

// When business actually says "Yes"
// Use pre-generated yesResponse immediately (latency: ~50ms)
```

**Trade-offs:**
- **Pro:** Near-zero latency for predicted paths (feels instant)
- **Pro:** Natural conversation flow (no pauses)
- **Con:** 2-3x LLM cost (generate 3, use 1)
- **Con:** Complexity (parallel generation, matching logic)
- **Hit rate:** ~40-60% for simple confirmations, lower for complex conversations

**When to use:**
- Negotiator mode only (already expensive, optimize for quality)
- Simple yes/no questions (high hit rate)
- Reservation confirmations (predictable flow)

**Implementation Timeline:**
- **VS-1:** None (latency optimization not critical yet)
- **VS-2:** Context-driven pre-generation (D-016) - covers 90% of calls
- **VS-3:** Speculative generation (BL-015) - covers remaining 10% + conversation flow

**Combined Strategy (VS-3):** Context-driven (pre-call) + Speculative (during-call) = **~95-98% instant response coverage**

See [Backlog BL-015-SPG](../backlog.md) and [D-016-CDG](#d-016-cdg-context-driven-phrase-generation--resolved) for how these work together seamlessly.

---

### D-016-CDG: Context-Driven Phrase Generation ✅ RESOLVED

**Context:** When user provides detailed call context ("Order General Tso's chicken with fried rice"), we can pre-generate high-probability responses BEFORE the call starts. This is much more effective than blind speculation.

**Blocks:** F-004-WEB (needs context input), future sentence caching

**Decision:** **Pre-generate context-specific phrase library** (resolved 2026-02-16).

**How it works:**

**User enters context:**
```
Purpose: Order food for delivery
Items: General Tso's chicken, fried rice, egg rolls
Address: 123 Main St
Special requests: Extra spicy, no MSG
```

**System pre-generates (before "Start Call" clicked):**
```typescript
const contextPhrases = [
  // Opening (100% probability) - template-based
  "I'd like to order General Tso's chicken, fried rice, and egg rolls for delivery.",

  // Confirmations (90% probability) - LLM variations
  "Yes, that's correct.",
  "No, I said General Tso's chicken, not sesame chicken.",

  // Common follow-ups (80% probability)
  "How long will delivery take?",
  "Can I add extra spicy sauce?",
  "How much will the total be?",

  // Address (90% probability for delivery)
  "123 Main Street.",
  "Yes, that's the right address.",

  // Special requests (100% probability if provided)
  "Extra spicy, and no MSG please.",
  "Just to confirm: extra spicy, no MSG."
];

// Pre-generate TTS audio for all phrases (~10-15 total)
// Takes 2-3 seconds while user reviews call info
// No impact on call latency - happens before dialing
```

**Comparison with other optimizations:**

| Strategy | Hit Rate | When Generated | Upfront Cost | Latency Savings |
|----------|----------|----------------|--------------|-----------------|
| Universal cache (VS-2) | 30-40% | Once (app startup) | $0.01 (one-time) | 300-450ms |
| Blind speculation (BL-015) | 40-60% | During call (parallel) | $0.005/turn | 200-400ms |
| **Context-driven (D-016)** | **90-95%** | **Before call** | **$0.007/call** | **300-450ms** |

**Why context-driven is superior:**
- **Higher hit rate:** Know user's intent, not guessing
- **Better timing:** Pre-generate before call (no latency impact)
- **Efficient cost:** Small upfront cost, huge latency savings
- **Full coverage:** Handles opening + confirmations + follow-ups

**Implementation Timeline:**
- **VS-1:** Basic context input (no pre-generation yet)
- **VS-2:** Context-driven phrase generation (10-15 phrases per call)
- **VS-3:** Learning system (track which generated phrases are actually used, improve predictions)

**Example Phrase Templates by Context Type:**

**Restaurant Order:**
```typescript
const restaurantTemplates = {
  opening: `I'd like to order ${items.join(', ')} for ${deliveryOrPickup}.`,
  address: `${address}.`,
  timing: `How long will that take?`,
  total: `How much will the total be?`,
  payment: `Can I pay with card?`
};
```

**Reservation:**
```typescript
const reservationTemplates = {
  opening: `I'd like to make a reservation for ${partySize} people at ${time}.`,
  date: `For ${date}.`,
  confirmation: `Yes, ${partySize} people at ${time}.`,
  special: `${specialRequest}` // outdoor seating, high chair, etc.
};
```

**Support Call:**
```typescript
const supportTemplates = {
  opening: `I'm calling about ${issue}.`,
  orderId: `My order number is ${orderId}.`,
  status: `What's the status of my order?`,
  resolution: `I'd like to ${desiredOutcome}.` // refund, replacement, etc.
};
```

**Rationale:**
- Leverages user's explicit intent (already provided in context form)
- 90-95% hit rate (vs 40-60% for blind speculation)
- Generates before call starts (zero latency impact during conversation)
- Covers full conversation arc (not just yes/no confirmations)
- Cost-efficient ($0.007 upfront vs $0.005/turn for blind speculation)

**Expected Impact:**
- **Latency:** 90% of interactions <100ms (cached playback)
- **Cost:** Small upfront generation cost, huge per-turn savings
- **UX:** Conversation feels instant and natural
- **Accuracy:** High confidence (based on user's stated intent, not predictions)

**Consequences:**
- Need 2-3 second "Preparing call..." indicator while phrases generate
- Cache invalidation if user edits context after generation
- Storage: ~2-5 MB per call (10-15 audio phrases)
- Need hit rate tracking to optimize phrase selection over time

**VS-2 Implementation:**
```typescript
// When user clicks "Start Call"
async function startCall(context: CallContext) {
  // Show "Preparing call..." indicator
  const phrases = await buildContextPhraseLibrary(context);

  // Cache all generated phrases
  for (const phrase of phrases) {
    cache.set(phrase.trigger, phrase.audio);
  }

  // Now initiate call
  await retell.createCall(phoneNumber);
}
```

**VS-3 Enhancement: Learning System**
```typescript
// Track which generated phrases were actually used
interface PhraseStats {
  generated: number; // How many times we generated this phrase
  used: number; // How many times user actually said it
  hitRate: number; // used / generated
}

// After each call, analyze usage
function updatePhraseStats(call: CompletedCall) {
  for (const phrase of call.generatedPhrases) {
    stats[phrase.trigger] = {
      generated: stats[phrase.trigger].generated + 1,
      used: phrase.wasUsed ? stats[phrase.trigger].used + 1 : stats[phrase.trigger].used,
      hitRate: stats[phrase.trigger].used / stats[phrase.trigger].generated
    };
  }

  // Prune low hit rate phrases (<30%) over time
  // Add new high-value phrases based on common patterns
}
```

---

## Seamless Multi-Layer Optimization (VS-3)

**D-016 (Context-Driven) + BL-015 (Speculative) working together:**

```typescript
// Two-layer caching strategy
class ResponseCache {
  // Layer 1: Pre-call context-driven cache
  private contextCache: Map<string, CachedPhrase>;

  // Layer 2: During-call speculative cache
  private speculativeCache: Map<string, CachedPhrase>;

  async getResponse(userInput: string): Promise<Response> {
    // Try Layer 1 first (context-driven, high confidence)
    const contextMatch = this.contextCache.get(userInput);
    if (contextMatch && contextMatch.confidence > 0.9) {
      return contextMatch; // Instant! 50-100ms
    }

    // Try Layer 2 second (speculative, medium confidence)
    const speculativeMatch = this.speculativeCache.get(userInput);
    if (speculativeMatch && speculativeMatch.confidence > 0.7) {
      return speculativeMatch; // Instant! 50-100ms
    }

    // Cache miss: Generate fresh (fallback)
    return await llm.generate(userInput); // 300-500ms
  }

  // Update speculative cache during conversation
  async updateSpeculative(conversationState: ConversationState) {
    // Predict 2-3 turns ahead based on current flow
    const predictions = await this.predictNext(conversationState, 3);

    // Pre-generate responses for predictions
    for (const prediction of predictions) {
      this.speculativeCache.set(prediction.trigger, prediction.response);
    }
  }
}
```

**Expected Coverage:**

| Source | Coverage | Latency | When |
|--------|----------|---------|------|
| Context-driven (Layer 1) | 70-80% | 50-100ms | Pre-call generation |
| Speculative (Layer 2) | 15-20% | 50-100ms | During-call prediction |
| Fresh generation (Fallback) | 5-10% | 300-500ms | Cache miss |
| **Total instant responses** | **85-95%** | **<100ms** | **Seamless!** |

**Why both layers matter:**
- Context-driven handles known intents (opening, confirmations)
- Speculative handles conversation flow (follow-up questions, clarifications)
- Together they create near-complete instant response coverage
- Fallback ensures nothing is missed

**Implementation:**
- **VS-2:** Layer 1 only (context-driven) - 70-80% instant
- **VS-3:** Layer 1 + Layer 2 (both) - 85-95% instant
- **VS-4+:** Add learning system to improve predictions over time
