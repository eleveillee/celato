# Version Matrix

Tracks current dependency versions, target upgrades, and known compatibility notes.
Update when adding, upgrading, or removing dependencies.

---

## Core Dependencies

| Dependency | Current | Target | Notes |
|------------|---------|--------|-------|
| Node.js | 22.0.0 | 22.x LTS | Native TypeScript support |
| TypeScript | 5.8.3 | 5.8.x | erasableSyntaxOnly for Node type stripping |
| React Native | 0.76.6 | 0.76.x | Expo SDK 52 compatible |
| Fastify | 5.2.0 | 5.x | Low overhead for WebSocket |
| Expo | 52.0.29 | 52.x | Latest stable |

## Dev Dependencies

| Dependency | Current | Target | Notes |
|------------|---------|--------|-------|
| Biome | 2.0.0 | 2.x | Fast linting + formatting |
| Vitest | 3.0.0 | 3.x | Native TS test runner |
| pnpm | 9.15.4 | 9.x | Monorepo package manager |

## Upgrade Plan

_No upgrades planned yet. All dependencies are on latest stable versions._

| ID | Dependency | From → To | Blocked By | Priority |
|----|------------|-----------|------------|----------|

_Example IDs: UP-001-R19 (React 19 upgrade), UP-005-N22 (Node 22 migration)_

## Third-Party Service Costs

| Service | Usage | Cost | VS | Notes |
|---------|-------|------|-----|-------|
| Retell AI | Phone calls (outbound) | ~$0.07-0.12/min | VS-1 | Custom LLM mode; includes ASR + TTS |
| OpenAI GPT-4o-mini | Whisper transformation | ~$0.15/1M input, $0.60/1M output | VS-1 | ~$0.0002/whisper |
| Deepgram | Audio whisper transcription | ~$0.0043/min | VS-2 | Mobile audio → text; not needed for VS-1 (text whispers) |
| Railway | API orchestrator hosting | ~$5-20/mo (usage-based) | VS-1 | Persistent WebSocket support; check connection limits |
| Vercel | Next.js web hosting | Free tier (hobby) | VS-1 | Static/serverless; no WebSocket support |
| Supabase | PostgreSQL + Auth | Free tier (50K MAU) | VS-3 | User data, call logs, transcripts |
| EAS Build | Expo native builds | Free (2 builds/day), $29/mo (priority) | VS-2 | Required for iOS/Android binary builds |

## Compatibility Notes

> Document known version conflicts, peer dependency issues, or migration gotchas here.
