# Architecture Guide

This document describes Celato's technical architecture. For product vision and UX patterns, see `spec/celato/`.

## System Architecture

### High-Level System Diagram

```
┌─────────────────┐
│  Mobile App     │ ◄─── User (Director)
│  React Native   │
└────────┬────────┘
         │ WebSocket (Control + Whisper Audio)
         ▼
┌─────────────────┐
│  Orchestrator   │ ◄─── Audio Routing & LLM Context
│  Node.js +      │
│  Fastify        │
└────┬────────┬───┘
     │        │
     │        └──► OpenAI Realtime API (GPT-4o)
     │
     ▼
┌─────────────────┐
│  Retell AI      │ ◄─── Telephony Provider
│  (VAD, Turn-    │
│   taking)       │
└────────┬────────┘
         │ PSTN / SIP
         ▼
┌─────────────────┐
│  Business       │ ◄─── Third Party (Phone)
└─────────────────┘
```

### The Three-Way Dynamic

**Participants:**
- **User (Director)** - controls via mobile app, whispers private instructions
- **Agent (Actor)** - AI that negotiates, follows user's direction
- **Business (Third Party)** - only hears the agent, not the whispers

**Audio Routing Modes:**

| Mode | User Audio | Agent Audio | Business Hears |
|------|------------|-------------|----------------|
| **Standard** | Muted | Active ↔ Business | Agent only |
| **Whisper** | Active → Agent | Active ↔ Business | Agent only (not user) |
| **Passthrough** | Active ↔ Business | Silent | User directly |

### The "Whisper Loop" Data Flow

1. **State:** Call active. Agent talking to business.
2. **User presses "Whisper" button** on mobile app.
3. **App:**
   - Mutes user audio to Retell (business doesn't hear)
   - Streams user audio to Orchestrator via separate WebSocket channel
4. **Orchestrator:**
   - Transcribes user audio: *"Tell them I'm running 5 mins late"*
   - Injects instruction into LLM context as high-priority system message:
     `[DIRECTOR INSTRUCTION: Tell them user is 5 mins late. Be polite.]`
5. **LLM (OpenAI Realtime API):**
   - Generates audio response: *"Apologies, my client is running about 5 minutes behind schedule."*
6. **Retell AI:** Plays LLM audio to business.

**Critical Latency Constraint:** Whisper → Agent → Business must complete in under 1-2 seconds for natural conversation flow.

---

## General Architectural Principles

---

## Components

### 1. Mobile App (Frontend)
**Stack:** React Native (Expo)

**Responsibilities:**
- **VoIP Interface:** Visualizing call state (User, Agent, Third Party)
- **Audio Handling:** Capturing user microphone for "Whisper" and "Passthrough"
- **Control Panel:** Buttons for "Whisper", "Hold", "Take Over"
- **State Sync:** Receiving real-time transcripts and state updates from Orchestrator

### 2. Celato Orchestrator (Backend)
**Stack:** Node.js 22 (TypeScript) + Fastify

**Responsibilities:**
- **Session Management:** Linking user's app session to Retell phone call
- **Audio Mixing/Routing:**
  - Standard: User (muted) → Agent (active) ↔ Business
  - Whisper: User (active) → Agent (active); Business (excluded)
  - Passthrough: User (active) ↔ Business; Agent (silent)
- **LLM Context Management:** Injecting system prompts, handling tool calls, managing conversation state

### 3. Telephony & Audio (Retell AI)
**Why Retell AI:**
- Built-in VAD (Voice Activity Detection)
- Interruption handling and turn-taking logic out of the box
- "Custom LLM" feature allows routing audio to our Orchestrator
- Enables whisper instruction injection before audio reaches the model

**Alternative:** Twilio (raw streams, requires building VAD/turn-taking ourselves)

### 4. Intelligence (OpenAI Realtime API)
**Primary Model:** GPT-4o Audio

**Why:**
- Native audio-to-audio (avoids transcription latency)
- Critical for sub-2-second whisper loop
- Handles multi-turn context naturally

**Cost Fallback (Future):** Deepgram + GPT-4o-mini for simple confirmations and "hold" handling (~$0.01/min vs ~$0.20/min)

### 5. Database (Supabase)
**Schema:**
- **Users:** Auth & preferences
- **Contacts:** Saved business numbers with context (e.g., "Mario's Pizza - usually order pepperoni")
- **Calls:** Call logs, transcripts, cost tracking
- **Prompts:** Custom system prompts for different scenarios (Restaurant, Support, Emergency)

---

## Core Principles

### 1. Feature-Based Organization
Organize code by **what it does**, not by **what it is**.

**Do this:**
```
src/
├── features/
│   ├── auth/           # Everything for authentication
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── auth.test.ts
│   │   └── types.ts
│   └── billing/
│       ├── checkout.ts
│       └── billing.test.ts
├── shared/             # Truly shared utilities
└── app/                # Entry point / framework wiring
```

**Not this:**
```
src/
├── controllers/        # Layer-based = scattered features
├── models/
├── services/
├── utils/
└── types/
```

**Why:** Feature-based organization gives AI tools (and humans) isolated context.
You can understand, modify, and test a feature without loading the entire codebase.

### 2. Separation of Concerns
Each module has a single, clear responsibility:

| Layer | Responsibility | Depends On |
|-------|---------------|------------|
| **Presentation** | UI rendering, user interaction | Application |
| **Application** | Orchestration, use cases, workflows | Domain |
| **Domain** | Business logic, rules, entities | Nothing |
| **Infrastructure** | Database, APIs, file system, external services | Domain (implements interfaces) |

The **dependency rule**: outer layers depend on inner layers, never the reverse.
Domain logic never imports from infrastructure. Infrastructure implements domain interfaces.

### 3. Boundaries and Contracts
- Define clear boundaries between modules/features.
- Communicate across boundaries through well-defined interfaces, not direct imports of internals.
- Validate data at boundaries (API input, external service responses, user input).
- Trust internal code. Don't re-validate data that already passed a boundary check.

### 4. Configuration
- All configuration comes from the environment, never hardcoded.
- Use typed configuration objects, not raw `process.env` / `os.environ` access scattered through code.
- Provide sensible defaults for development. Require explicit values for production.
- Document all configuration in `.env.example`.

---

## Common Patterns

### Repository Pattern
Abstract data access behind an interface. The application layer works with the interface;
the infrastructure layer provides the implementation.

```
Domain:          IUserRepository (interface)
Infrastructure:  PostgresUserRepository implements IUserRepository
Application:     UserService depends on IUserRepository
```

**When to use:** When you have database access or external service calls that you want to
mock in tests or swap implementations.

**When NOT to use:** For simple CRUD with a single database. An ORM often suffices.

### Service Layer
Business logic lives in service functions/classes, not in controllers or UI components.
Controllers are thin: parse input, call service, return response.

### Event-Driven Communication
For cross-feature communication, prefer events over direct imports.
Feature A emits an event; Feature B subscribes to it. Neither knows about the other.

**When to use:** When features need to react to each other but shouldn't be coupled.

**When NOT to use:** For simple, synchronous workflows where a direct function call is clearer.

### Error Handling Strategy
- Define a base error type with `code`, `message`, and optional `details`.
- Business errors are expected (user not found, validation failed) - handle gracefully.
- System errors are unexpected (database down, OOM) - log and fail fast.
- Never swallow errors silently. Either handle them or let them propagate.

---

## Scaling Patterns

### Starting Small (Single Module)
```
src/
├── features/
├── shared/
└── app/
```

### Growing (Multi-Module)
```
src/
├── features/
├── shared/
│   ├── components/
│   ├── lib/
│   └── types/
└── app/
```

### Large Project (Modular Monolith)
```
packages/
├── core/           # Domain logic, shared types
├── web/            # Web application
├── api/            # API server
├── cli/            # CLI tool
└── shared/         # Shared utilities
```

The key: start simple, extract modules only when complexity demands it.
Don't pre-architect for scale you don't have.

---

## Decision Framework

When facing an architectural choice, evaluate in this order:

1. **Simplicity** - Is there a simpler approach that works?
2. **Testability** - Can I test this easily?
3. **Maintainability** - Will this be clear in 6 months?
4. **Performance** - Does this meet performance requirements? (Don't optimize prematurely)
5. **Scalability** - Will this handle growth? (Only consider if growth is expected)
