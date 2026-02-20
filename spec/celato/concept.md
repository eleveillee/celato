# Project Celato: Competitive Analysis & Concept

| Competitor | Core Philosophy | Seamless Phone Call? | "Mediator" Intent? | User Input during Call | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Celato** | **Collaborative Agent** | Yes (via VoIP App) | **Yes (Core Feature)** | **Continuous Direction** | **Concept** |
| **AI Call** | Delegation ("Do it for me") | Yes (App) | Yes (Autonomous Mode) | Limited (Mode switch) | Live (Consumer) |
| **SpeakLink** | Literal Pipe ("Translate me") | No (Web Browser) | No (Literal) | No (Direct Speech) | Live (Consumer) |
| **Samsung Galaxy AI** | Native Utility | **Yes (Native Dialer)** | No (Literal) | No (Direct Speech) | Live (Built-in) |
| **Google Pixel Call Screen** | Gatekeeper ("Screen calls") | Yes (Native) | Yes (Screening only) | Yes (Select prompts) | Live (Built-in) |
| **Bland AI / Retell** | Infrastructure (API) | N/A (Dev Tool) | Programmable | Programmable | Dev Platform |

## Feature Gap Analysis

| Feature | Your Idea | AI Call | SpeakLink | Samsung/Google |
| :--- | :--- | :--- | :--- | :--- |
| **Real-time Translation** | ✅ | ✅ | ✅ | ✅ |
| **Autonomous "Hold"** (Filler talk) | ✅ | ❌ | ❌ | ❌ |
| **Clarifying Questions** (Agent -> User) | ✅ | ❌ (Guesses or fails) | ❌ | ❌ |
| **Mid-Call Direction** ("Tell them X") | ✅ | ❌ | ❌ | ❌ |
| **Native Phone Integration** | ❌ (Requires App) | ❌ (Requires App) | ❌ (Browser) | ✅ (Hardware excl.) |

---

# Product Design: Project Celato

**Code Name:** Project Celato (Meaning: "Hidden" / "Concealed" in Italian)

## 1. The Core UX: "The Director's Chair"
Instead of a simple "Mic on/off" interface, the user sees a **Live Conversation Feed** with a **Director Control Panel**.

### Screen Layout (During Call)

*   **Top (The Other Side):**
    *   Visualizer of the other person speaking.
    *   **Live Transcript (Translated):** "They are asking if you have the receipt number."
    *   *Status:* [Listening...] [Speaking...]

*   **Middle (The Agent - "Mediator"):**
    *   **Agent Thought Bubble:** "I need the receipt number to proceed. Asking user..."
    *   **Agent Output (Text):** "Uno momento, por favor..." (Agent holds the line autonomously)

*   **Bottom (User Controls - "The Director"):**
    *   **Main Mic Button:** Hold to speak directly (Agent translates literally).
    *   **"Whisper" Button:** Hold to give *directions* (Internal voice).
        *   *User says:* "Tell them I don't have it, can they look up by name?"
    *   **Quick Actions (Context Aware):**
        *   [Wait / Hold]
        *   [Ask to Repeat]
        *   [Yes] / [No]
        *   [Give My Info]

## 2. Key "Mediator" Behaviors

1.  **Autonomous "Holding":**
    *   *Scenario:* User doesn't answer immediately.
    *   *Agent:* "Just a second, let me check that..." (in target language) to keep the line alive.
    
2.  **Clarification Loop:**
    *   *Business:* "Do you want the deluxe or standard?"
    *   *Agent (to User):* "They need to know: Deluxe or Standard?"
    *   *User (Whisper):* "What's the difference?"
    *   *Agent (to Business):* "¿Cuál es la diferencia entre los dos?"
    *   *(Agent does NOT just translate "What's the difference?" blindly, it effectively routes the question).*

3.  **Hybrid Mode:**
    *   User can switch between **"Parrot Mode"** (Literal translation for simple chit-chat) and **"Agent Mode"** (Business/Complex tasks) instantly.

## 3. Technical Architecture (High Level)
*(See [Full Architecture Spec](../architecture.md))*

*   **Mobile App:** React Native (Expo) - VoIP dialer and Director UI
*   **Backend:** Node.js + Fastify - audio routing orchestrator
*   **Telephony:** Retell AI - handles VAD, interruption, turn-taking
*   **Intelligence:** OpenAI API (GPT-4o-mini) - text-based LLM (Retell handles ASR/TTS)
*   **Database:** Supabase (PostgreSQL) - call logs, transcripts, user data
*   **Logic:**
    *   System prompt separates "User Intent" from "Translation Output"
    *   Agent uses tools to distinguish "Talk to User" vs "Talk to Business"

## 4. User Journey Examples

### A. The Phone Call (Remote)

1.  **User opens app**, types/pastes a phone number (e.g., Pizza place in Tokyo).
2.  **Context Setup:** User selects "Ordering Food" (Sets system prompt context).
3.  **Call Starts:** Agent connects.
4.  **Agent:** "Moshi moshi..." (Greetings).
5.  **Agent (to User):** "Connected. They are asking for your order."
6.  **User (Whisper):** "Large Pepperoni."
7.  **Agent (to Business):** "One Large Pepperoni, please."
8.  **Business:** "We are out of pepperoni."
9.  **Agent (to User):** "Bad news, no pepperoni. What's backup?"
10. **User (Whisper):** "Damn. Just cheese then."
11. **Agent (to Business):** "That's okay, we'll take a Cheese pizza instead." *(Filters out "Damn", polite delivery).*

### B. The "Face-to-Face" Mode (Local / Restaurant)

*Simulates a "Google Translate" flow but with Agency.*

1.  **Context Pre-fill:** User enters a restaurant. Opens app and types/speaks context: *"Table for 2, no dairy, prefer outside."*
2.  **Action:** User presses **"Speak for Me"** and holds phone up to the waiter.
3.  **Agent (via Speakerphone):** "Hello! We would like a table for two people, please. Ideally outside."
4.  **Waiter:** "Outside is full, but we have a nice booth inside."
5.  **Agent (to User - on Screen/Earbud):** "Outside is full. Booth inside?"
6.  **User (Tap/Whisper):** "Booth is fine."
7.  **Agent (to Waiter):** "A booth inside is perfect, thank you. Also, one of us has a dairy allergy."
8.  **Waiter:** "Understood. Right this way."
