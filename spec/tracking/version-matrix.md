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

## Compatibility Notes

> Document known version conflicts, peer dependency issues, or migration gotchas here.
