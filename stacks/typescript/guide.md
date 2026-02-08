# TypeScript / Node.js Stack Guide

> Key decisions for the Setup Wizard. Researched for 2026 best practices.

---

## Runtime

**Decision:** Node.js 22 LTS (default), Bun for greenfield performance-sensitive projects

**Why:** Node.js 22 LTS is the safe production choice with the largest ecosystem. It now supports native TypeScript execution via type stripping (unflagged since v22.18) and stable `--env-file` support (v22.21). Bun 1.2+ has near-complete Node.js API compatibility with 2-3x HTTP throughput, but edge incompatibilities still surface. Deno 2 is viable but has the smallest ecosystem of the three.

**Alternatives:** Choose Bun when cold start time and raw throughput matter (serverless, edge). Choose Deno for its built-in security model and standards-first approach.

---

## Package Manager

**Decision:** pnpm (default), Bun install if using Bun runtime

**Why:** pnpm's content-addressable store uses hard links to cut disk usage by ~70%. Its strict non-flat `node_modules` prevents phantom dependencies. In CI benchmarks it consistently beats npm. If you chose Bun as your runtime, use `bun install` for its 10-30x cold-install speed advantage and unified toolchain.

**Alternatives:** npm is fine for simple projects, tutorials, or teams that want zero setup. Avoid Yarn unless the project already uses it.

---

## TypeScript Configuration

**Decision:** Strict mode with the flags below. Use `erasableSyntaxOnly` for Node.js type-stripping compatibility.

**Why:** TypeScript's value is proportional to strictness. Loose settings let entire bug categories through. The flags below are the 2026 consensus baseline.

### Must-have flags

| Flag | Rationale |
|---|---|
| `strict: true` | Non-negotiable. Enables `strictNullChecks`, `noImplicitAny`, etc. |
| `noUncheckedIndexedAccess: true` | Forces handling `undefined` on index access. Catches crashes `strict` misses. |
| `exactOptionalProperties: true` | Distinguishes missing property from `undefined` value. |
| `verbatimModuleSyntax: true` | Enforces explicit `import type`. Required for bundler tree-shaking and Node type stripping. |
| `erasableSyntaxOnly: true` | **New in TS 5.8.** Errors on enums, namespaces, and parameter properties — constructs that Node.js type stripping cannot handle. Enable when targeting native TS execution in Node 22+. |
| `moduleResolution: "bundler"` | Correct for bundled apps. Understands `exports`, conditional imports. Use `"nodenext"` for unbundled Node libraries. |
| `module: "ESNext"` | Emit modern ESM. Use `"NodeNext"` for CJS-compatible libraries. |
| `target: "ES2022"` | Node 18+. Includes top-level `await`, `Array.at()`, error `cause`. |
| `noEmit: true` | Let the bundler emit JS. TypeScript only type-checks. |

### Path aliases

Map `@/*` to `src/*`. The bundler and test runner must also resolve this alias.

> **For Node libraries (no bundler):** replace `noEmit` with `outDir: "dist"` + `declaration: true`, and switch to `moduleResolution: "nodenext"` / `module: "NodeNext"`.

---

## Linting & Formatting

**Decision:** Biome (default), ESLint + Prettier only when Biome lacks a required plugin

**Why:** Biome v2 is a single Rust binary replacing both ESLint and Prettier. It's 10-25x faster, ships 423+ lint rules, and now includes type-aware linting without requiring `tsc` (via its own inference engine). One config file, zero npm dependencies. Biome v2 also adds a plugin system and experimental Vue/Svelte/Astro support.

**Alternatives:** Use ESLint flat config + Prettier when you need plugins Biome doesn't cover (e.g., `eslint-plugin-react-compiler`, highly specialized framework rules). Use `typescript-eslint` v8+ with typed linting and `eslint-config-prettier` to avoid conflicts.

---

## Testing

**Decision:** Vitest for unit/integration, Playwright for E2E

**Why:** Vitest has native TypeScript support (no `ts-jest`), uses Vite's transform pipeline for speed, and is Jest-API-compatible. It is the clear frontrunner for unit testing in 2026. Playwright provides cross-browser E2E with auto-waiting and excellent DX.

**Alternatives:** Jest remains viable for existing projects with heavy Jest plugin investment. For API E2E, Vitest + native `fetch` against a test server works well.

---

## Build Tools

**Decision:** Vite (default for apps), tsup/esbuild (for libraries)

**Why:** Vite serves native ESM in dev with near-instant HMR, and uses Rollup for optimized production builds. It is the dominant build tool for frontend and full-stack apps in 2026. For libraries, tsup (which wraps esbuild) provides fast builds with dts generation.

**Alternatives:** Turbopack is maturing inside Next.js — use it if you're in the Next.js ecosystem. SWC is used internally by Next.js and Vite (via plugins) but is rarely configured standalone. Bun's bundler is an option for Bun-native projects.

---

## Frameworks

> Don't prescribe — the wizard should ask the user. These are trade-offs to inform the decision.

### Web APIs

| Framework | Best for | Trade-off |
|---|---|---|
| **Hono** | Edge, serverless, multi-runtime | Tiny, runs everywhere (Workers, Deno, Bun, Node). TypeScript-first. Growing ecosystem. |
| **Fastify** | High-throughput Node.js APIs | Schema validation, plugin system, mature. Node-only. |
| **Express** | Maximum ecosystem compatibility | Huge middleware ecosystem. Slower, less type-safe. |

### Full-Stack

| Framework | Best for | Trade-off |
|---|---|---|
| **Next.js (App Router)** | SEO-critical React apps, large ecosystem | RSC, server actions, Vercel-optimized. Complex mental model. Turbopack now default in dev. |
| **Remix / React Router v7** | Data-heavy apps, progressive enhancement | Web-standards focused, nested routing. Smaller ecosystem than Next. |

### CLI Tools

Commander + Inquirer for most CLIs. Consider oclif for plugin-based CLIs.

---

## Validation

**Decision:** Zod (default), with awareness of Standard Schema for interoperability

**Why:** Zod remains the ecosystem standard — TypeScript-first, infers static types from schemas, composable, zero dependencies. Most tools (tRPC, React Hook Form, TanStack) integrate with Zod first. Standard Schema 1.0 (co-authored by Zod, Valibot, ArkType creators) now lets you swap validation libraries without rewriting integrations.

**Alternatives:** Valibot for bundle-sensitive apps (tree-shakeable, much smaller output). ArkType for maximum type inference (writes like TS syntax, 100x faster validation) but larger runtime footprint.

---

## Database / ORM

**Decision:** Drizzle for new projects, Prisma when DX and tooling matter more than bundle size

**Why:** Drizzle is code-first TypeScript, no generation step, ~7.4kb min+gzip, ideal for serverless/edge. Prisma 7 (late 2025) removed the Rust engine entirely — now pure TypeScript with 90% smaller bundles, 3x faster queries, and 70% faster type-checking. Both are excellent choices in 2026.

**Alternatives:** Choose Prisma when you want auto-generated migrations, nested writes, and Prisma Studio. Choose Drizzle when you want SQL transparency, minimal abstraction, and the smallest possible cold start.

---

## Authentication

**Decision:** better-auth (default for new projects), Auth.js for Next.js OAuth-heavy apps

**Why:** better-auth is TypeScript-first, framework-agnostic, and ships 2FA, org management, and session handling out of the box. Its plugin ecosystem covers most auth patterns. Auth.js (NextAuth v5) is the standard for Next.js with broad OAuth provider support.

**Alternatives:** Lucia was deprecated in early 2025 — it is now a learning resource, not a library. For Lucia-like low-level control, implement sessions from scratch using the Oslo and Arctic libraries (maintained by the Lucia author).

---

## Project Structure

**Decision:** Feature-based organization, co-located unit tests

**Why:** Feature folders (`features/auth/`, `features/billing/`) keep related code together, making features easy to trace and refactor. Layer-based organization (`controllers/`, `services/`) scatters related code.

**Conventions:** Unit tests live next to source (`login.ts` / `login.test.ts`). Integration/E2E tests go in a top-level `tests/` directory. For libraries, flatten to `src/`, `examples/`, `benchmarks/`.

---

## Common Packages

| Category | Recommendation | Notes |
|---|---|---|
| HTTP client | Built-in `fetch` | No dependency needed on Node 18+. Use `ky` if you need retries/hooks. |
| Date/time | `date-fns` | Tree-shakeable, immutable. Watch the Temporal API (polyfill available). |
| IDs | `nanoid` | URL-safe, smaller and faster than uuid. |
| Logging | `pino` | Fast structured JSON logging for Node services. |
| Env vars | `--env-file` flag | Native in Node 22 LTS (stable). No `dotenv` needed for new projects. |

---

## Git Hooks

**Decision:** Husky + lint-staged

**Why:** Catches lint/format errors before CI. Run `biome check --write` on staged files. Do not run `tsc` in pre-commit — it type-checks the whole project and is too slow. Run type-checking in CI.

---

## Scripts Pattern

Consistent script names across all projects:

| Script | Purpose |
|---|---|
| `dev` | Start development server/watcher |
| `build` | Produce production artifact |
| `start` | Run production build |
| `check` | Lint + format check (CI) |
| `check:fix` | Lint + format auto-fix (local) |
| `type-check` | `tsc --noEmit` (separate from bundler) |
| `test` | Single run (CI) |
| `test:watch` | Watch mode (development) |
| `test:coverage` | With coverage report |
| `prepare` | Husky setup (runs after install) |
