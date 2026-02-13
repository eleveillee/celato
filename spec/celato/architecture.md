# Project Celato: Technical Architecture

## Overview

Celato is a **real-time collaborative voice agent**. The architecture requires low-latency audio streaming, state management for the "Director/Actor" dynamic, and telephony integration.

## High-Level Diagram

```mermaid
graph TD
    User[User (Mobile App)] <-->|WebSocket (Control + Whisper Audio)| Server[Celato Orchestrator]
    Server <-->|WebSocket (Audio Stream)| Retell[Retell AI / Telephony Provider]
    Retell <-->|PSTN / SIP| Business[Third Party (Phone)]
    Server <-->|Realtime API| LLM[OpenAI / Anthropic]
```

## Components

### 1. Mobile App (Frontend)
*   **Stack**: React Native (Expo).
*   **Responsibilities**:
    *   **VoIP Interface**: Visualizing the call state (User, Agent, Third Party).
    *   **Audio Handling**: Capturing user microphone (for "Whisper" and "Passthrough").
    *   **Control Panel**: Buttons for "Whisper", "Hold", "Take Over".
    *   **State Sync**: Receiving real-time transcripts and state updates from the Orchestrator.

### 2. Celato Orchestrator (Backend)
*   **Stack**: Node.js (TypeScript) / Fastify or Hono (for low overhead).
*   **Responsibilities**:
    *   **Session Management**: Linking the User's app session to the Retell phone call.
    *   **Audio Mixing/Routing**:
        *   *Standard*: User (Muted) -> Agent (Active) <-> Business.
        *   *Whisper*: User (Active) -> Agent (Active); Business (excluded).
        *   *Passthrough*: User (Active) <-> Business; Agent (Silent).
    *   **LLM Context Management**: Injecting system prompts ("You are a mediator...") and handling tool calls.

### 3. Telephony & Audio (Infrastructure)
*   **Provider**: **Retell AI** (Recommended for "Agent" focus) or **Twilio** (Raw streams).
*   **Retell AI Advantage**: Handles the VAD (Voice Activity Detection), interruption handling, and turn-taking logic out of the box.
*   **Custom LLM Endpoint**: We will use Retell's "Custom LLM" feature to route audio to our Orchestrator, allowing us to inject the "Whisper" instructions before they reach the model.

### 4. Intelligence (The Brain)
*   **Primary Model**: **OpenAI Realtime API (GPT-4o)**.
    *   *Why*: Native audio-to-audio avoids transcription latency. Critical for the "Director" feel.
*   **Fallback/Cost-Saver**: **Groq (Llama 3) + Deepgram**.
    *   *Why*: For simple confirmation loops or "Hold" music handling.

## Data Flow: The "Whisper" Loop

1.  **State**: Call is active. Agent is talking to Business.
2.  **Action**: User presses "Whisper" button on App.
3.  **App**:
    *   Mutes User audio to Retell (Business doesn't hear).
    *   Streams User audio to **Orchestrator** via separate channel.
4.  **Orchestrator**:
    *   Transcribes User audio (Whisper): *"Tell them I'm running 5 mins late."*
    *   Injects instruction into LLM Context as a `system` or `user` message with high priority: *[DIRECTOR INSTRUCTION: Tell them user is 5 mins late. Be polite.]*
5.  **LLM**:
    *   Generates audio response: *"Apologies, my client is running about 5 minutes behind schedule."*
6.  **Retell**: Plays LLM audio to Business.

## Data Model (Supabase/Postgres)

*   **Users**: Auth & Preferences.
*   **Contacts**: Saved "Business" numbers with context (e.g., "Mario's Pizza - usually order Pepperoni").
*   **Calls**: Call logs, transcripts, cost tracking.
*   **Prompts**: Custom system prompts for different scenarios (Restaurant, Support, Emergency).

## Security & Privacy
*   **Audio Storage**: Transient processing only (unless User opts in to recording).
*   **Payment**: Stripe integration for usage-based billing (pass-through Retell/OpenAI costs + margin).
