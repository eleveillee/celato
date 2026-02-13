# Project Celato: UX & Interaction Design

## 1. Core Philosophy: "The Bionic Director"
The user is not just a passive observer (like watching a TV show) nor a frantic operator (like a switchboard). They are a **Director**. The Agent is the **Actor**. The Director can let the scene play out ("Hands-Off") or step in to give notes ("Hands-On").

## 2. The Interface (Mobile First)

### A. The Stage (Main View)
A vertical chat history, but richer than WhatsApp.
*   **Left Side (The Other Party):**
    *   *Visual:* Waveform avatar (shows they are talking).
    *   *Text:* Real-time streaming transcript (translated).
    *   *Style:* Gray bubbles.
*   **Right Side (The Agent):**
    *   *Visual:* Agent avatar (pulsing when thinking/talking).
    *   *Text:* What the agent is saying to *them* (translated back to you).
    *   *Style:* Blue bubbles.
*   **Center/Bottom (The Director/User):**
    *   *Visual:* "Whisper" directives appear as small, distinct notes in the stream.
    *   *Style:* Yellow/Gold distinct notes. *Example:* 📝 *"Ask for a discount"*

### B. The Control Deck (Bottom Bar)
Instead of a static input field, a dynamic "Command Center."

1.  **The "Whisper" Mic (Hold-to-Talk):**
    *   *Action:* Hold button -> Speak to Agent -> Release.
    *   *Effect:* Agent hears you (Business does NOT). Agent nods/acknowledges and integrates the direction into the *next* turn.
    *   *Latency:* Immediate local feedback ("Listening...").

2.  **The "Take Over" Button (Toggle):**
    *   *Action:* Tap "Take Over."
    *   *Effect:* Agent goes silent. Your mic is routed *directly* to the business (Passthrough Mode).
    *   *Visual:* Screen border turns Red/Green to indicate "You are Live."
    *   *Smart Fallback:* If you go silent for > 5s, Agent prompts: "Want me to jump back in?"

3.  **Smart Suggestions (Quick Chips):**
    *   Context-aware buttons that appear based on the conversation.
    *   *Examples:* [Ask Price], [Confirm], [Say No], [Hold On].

### C. Interaction: "Point & Direct" (The Feature You Asked For)
User can interact with *past* messages to guide the *future*.

*   **Scenario:** Business said "We have a table at 8 PM" (3 messages ago).
*   **Action:** User taps that specific message bubble.
*   **Menu Options:**
    *   *Clarify This:* Agent asks "Is that 8 PM *sharp* or a window?"
    *   *Refuse This:* Agent says "8 PM doesn't work for us."
    *   *Pin Context:* Highlights the message. Agent knows "This info is critical for the next step."

---

## 3. "Smart Cost" Architecture (Smart & Cheap)
To keep costs low while maintaining "Realtime" feel, we use a **Tiered Intelligence Strategy**.

### Tier 1: The "Parrot" (Cheap & Fast)
*   *Engine:* Deepgram + Local Logic / Small LLM (Haiku/GPT-4o-mini).
*   *Usage:* Greetings, simple confirmations ("Yes", "No", "One moment"), repeating numbers.
*   *Cost:* ~$0.01/min.
*   *Latency:* < 200ms.

### Tier 2: The "Negotiator" (Smart & Pricey)
*   *Engine:* OpenAI Realtime API (GPT-4o).
*   *Usage:* Complex reasoning, handling unexpected questions, taking "Whisper" directives.
*   *Cost:* ~$0.20/min.
*   *Trigger:*
    1.  User presses "Whisper" button.
    2.  Business asks a question (detected by question mark intonation).
    3.  Conversation sentiment turns negative/confused.

### Tier 3: The "Auto-Cut" (Cost Saver)
*   *Logic:* If the conversation is idle for > 15s or detects "Hold Music," the Agent switches to **Standby Mode**.
    *   *Standby:* Stops streaming audio to LLM (saves $$$). Uses simple VAD to detect when human speech returns.
    *   *Wake Word:* "Hello?" or User Input wakes it back up to Tier 2.

---

## 4. Documentation Structure

Documentation is organized in three layers:

1.  **Product Spec (`spec/celato/`)**: UX flows, "Director" metaphor, and feature requirements.
2.  **Tech Spec (`spec/architecture.md`)**: WebSocket protocol, audio routing logic, and model switching state machine.
3.  **API Contract (`spec/api-contracts.md`)**: JSON schema for WebSocket messages between client and server.
