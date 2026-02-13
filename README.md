# Celato

**The "Bionic Director" for phone calls.** A real-time collaborative voice agent that lets you whisper instructions to an AI agent who negotiates with businesses on your behalf — while you stay in control.

Unlike standard translation apps or fully autonomous agents, Celato keeps you in the loop. You listen to the translated conversation and can "whisper" directions to the AI, who then handles the interaction professionally in the target language.

---

## The Problem We're Solving

Ever tried to:
- Book a restaurant reservation in a foreign country?
- Navigate government bureaucracy in a language you don't speak?
- Call customer support and explain a complex issue through a translator?

Existing solutions fall short:
- **Google Translate** - literal translation with no agency
- **Samsung/Google AI Call** - built into hardware, literal translation only
- **AI Call app** - autonomous but doesn't let you course-correct mid-call

## The Celato Difference

**You're the Director. The AI is your Actor.**

1. **Whisper instructions** - speak privately to the AI without the business hearing
2. **Agent negotiates** - handles the conversation professionally in target language
3. **Stay in control** - approve, reject, or clarify in real-time
4. **Autonomous holding** - agent keeps conversation flowing while you think

**Example:** Calling a Tokyo pizza place:
- You whisper: "Large pepperoni"
- Agent: "One large pepperoni, please" (in Japanese)
- Business: "We're out of pepperoni"
- Agent (to you): "Bad news, no pepperoni. What's backup?"
- You whisper: "Damn. Just cheese then."
- Agent (to business): "That's okay, we'll take a cheese pizza instead." *(filters profanity, polite delivery)*

---

## Tech Stack

- **Mobile:** React Native (Expo) - cross-platform iOS/Android
- **Backend:** Node.js 22 + Fastify - audio routing orchestrator
- **Telephony:** Retell AI - handles VAD, interruptions, turn-taking
- **Intelligence:** OpenAI Realtime API (GPT-4o) - audio-to-audio agent
- **Database:** Supabase - user data, call logs, prompts
- **Monorepo:** pnpm workspaces

## Project Structure

```
celato/
├── packages/
│   ├── mobile/            # React Native (Expo) app
│   ├── api/               # Node.js orchestrator
│   └── shared/            # Shared types & contracts
│
├── spec/
│   ├── celato/            # Product vision (concept, UX, roadmap)
│   ├── architecture.md    # Technical architecture
│   ├── api-contracts.md   # WebSocket protocol, API shapes
│   ├── tracking/          # Milestones, bugs, decisions, learnings
│   └── features/          # Extracted feature specs
│
├── CLAUDE.md              # AI agent instructions
└── README.md              # This file
```

## Development Roadmap

**Phase 1: Wizard of Oz Prototype** (Weeks 1-2)
- Web interface to validate "whisper" interaction model
- Simple dialer with spacebar whisper button
- Test with real business calls

**Phase 2: Bionic Director MVP** (Weeks 3-6)
- React Native mobile app with full VoIP
- Real-time whisper audio injection
- Live transcripts and basic contexts

**Phase 3: Smart Cost & Polish** (Weeks 7-10)
- Model switching (cheap "Parrot" vs smart "Negotiator")
- Call history and transcript review
- Multi-language support

See `spec/tracking/milestone.md` for current status and detailed tasks.

---

## Getting Started

### Prerequisites

- Node.js 22 LTS
- pnpm 9+
- Expo account (for mobile dev)
- API keys: OpenAI, Retell AI, Supabase

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Fill in your API keys in .env

# Start development
pnpm dev
```

### Development Workflow

1. Check `spec/tracking/milestone.md` for current vertical slice and tasks
2. Product vision lives in `spec/celato/` - read before implementing features
3. Technical architecture in `spec/architecture.md`
4. API contracts in `spec/api-contracts.md` (single source of truth)

### Key Documentation

| Document | Purpose |
|----------|---------|
| `spec/celato/concept.md` | Competitive analysis, core UX philosophy |
| `spec/celato/ux_design.md` | "Director's Chair" interface, smart cost architecture |
| `spec/celato/architecture.md` | Component diagram, whisper loop data flow |
| `spec/tracking/milestone.md` | Current status, tasks, roadmap |
| `spec/tracking/qa.md` | Feature health and verification status |

---

## Customization

### Adding New Rules
- Claude Code: add `.md` files to `.claude/rules/`.
- Cursor: add `.mdc` files to `.cursor/rules/`.
- Both are auto-loaded. Keep rules in sync between tools.

### Adding New Stacks
- Create a new file under `stacks/` (e.g., `stacks/rust.md`).
- Follow the key-decision format: `Decision / Why / Alternatives` per topic.
- Include a "Recommended Stack" version table at the top.
- Guides tell the wizard WHAT to generate and WHY — not full configs (the wizard generates those).

### Personal Preferences
- Create `CLAUDE.local.md` at root for personal Claude Code overrides (gitignored).
- These override project rules for your local environment only.

---

## Reference

| Document | Purpose |
|----------|---------|
| [Architecture](spec/architecture.md) | System architecture patterns and principles |
| [Coding Standards](spec/coding-standards.md) | Parseable code rules for AI agents |
| [Workflow](spec/workflow.md) | Two-phase tracking (inline → extracted) |
| [API Contracts](spec/api-contracts.md) | Single source of truth for API shapes |
| [Setup Wizard](spec/setup-wizard.md) | Interactive guide to convert base into a project |
