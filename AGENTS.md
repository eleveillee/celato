# Celato

Real-time collaborative voice agent for phone calls - the "Bionic Director" that lets you whisper instructions to an AI agent who negotiates on your behalf.

## Tech Stack
- **Monorepo:** pnpm workspace (TypeScript)
- **Mobile:** React Native (Expo)
- **API:** Node.js 22 + Fastify
- **Telephony:** Retell AI
- **Intelligence:** OpenAI Realtime API (GPT-4o)
- **Database:** Supabase (PostgreSQL)

## Commands
```bash
pnpm dev              # Start all packages
pnpm test             # Run tests
pnpm check            # Lint + format check
pnpm build            # Build all packages
```

## Principles
- Modular code, single responsibility. Max ~300 lines per file, ~50 per function.
- Test-driven development. Every task includes relevant tests.
- Research best practices. Don't guess.
- Named exports. Early returns. Guard clauses.
- Conventional commits: feat:, fix:, chore:, docs:, refactor:, test:
- Never read/output .env files, API keys, or credentials.

## Project Structure
- `spec/` - Architecture, standards, tracking, and feature specs
- `spec/features/` - Feature deep-dives with task breakdowns
- `spec/tracking/` - Milestones, backlog, bugs, decisions, learnings, tech-debt, versions
- `src/` - Source code (feature-based organization)

## Key Files
- `spec/coding-standards.md` - Detailed code rules with language-specific sections
- `spec/workflow.md` - Two-phase tracking (inline → extracted) with AI transition detection
- `spec/api-contracts.md` - API contracts single source of truth (when applicable)

## Communication
- Options in tables with emoji indicators. Always recommend one.
- After tasks: 3-5 QoL suggestions + 2-3 follow-ups.
- Reviews: 🔴 obvious fix / 🟡 needs attention / 🟢 can postpone.
- Task lists: split by milestone, order quick-win to complex.
