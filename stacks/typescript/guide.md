# TypeScript / Node.js Stack Guide

This guide provides researched best practices for TypeScript/Node.js projects.
The Setup Wizard references this when configuring a new project.

---

## Package Manager

**Why it matters:** The package manager affects install speed, disk usage, and whether your project can accidentally import packages it doesn't explicitly depend on (phantom dependencies).

**Recommendation: pnpm**

- **pnpm** is the default choice. It uses a content-addressable store with hard links, so disk usage drops dramatically across projects. Its strict `node_modules` structure (non-flat) prevents phantom dependencies -- you can only import what you explicitly declare in `package.json`. Install speed is consistently faster than npm.
- **npm** is an acceptable fallback for simple projects, tutorials, or teams unfamiliar with pnpm. It ships with Node so there is zero setup.
- **Avoid yarn** unless the project already uses it. Yarn Classic (v1) is legacy. Yarn Berry (v3+) works but its PnP mode introduces compatibility friction with many tools.

```bash
# Install pnpm globally
npm install -g pnpm

# Initialize a new project
pnpm init
```

---

## TypeScript Configuration

**Why it matters:** TypeScript's value is proportional to how strict you configure it. Loose settings let entire categories of bugs slip through. The flags below represent the current best-practice consensus.

### Key Flags

| Flag | Rationale |
|---|---|
| `strict: true` | Non-negotiable. Enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and others. Without this, TypeScript is a linter, not a type system. |
| `noUncheckedIndexedAccess: true` | Forces you to handle `undefined` when accessing arrays/objects by index. Catches subtle runtime crashes that `strict` alone misses. |
| `exactOptionalProperties: true` | Distinguishes between "property is missing" and "property is `undefined`". Prevents passing `{ name: undefined }` where `{ }` is expected. |
| `noEmit: true` | Use when a bundler (Vite, esbuild, SWC) handles transpilation. TypeScript only type-checks; the bundler emits JS. Avoids duplicate build steps. |
| `moduleResolution: "bundler"` | The correct setting for projects using a bundler. Understands `package.json` `exports`, conditional imports, and extensionless imports. Use `"nodenext"` only for pure Node libraries that ship without a bundler. |
| `module: "ESNext"` | Emit modern ES modules. For Node libraries targeting CJS consumers, use `"NodeNext"` instead. |
| `target: "ES2022"` | For Node 18+. Includes top-level `await`, `Array.at()`, `Object.hasOwn()`, error `cause`. For browser projects, set based on your support matrix (typically `"ES2020"` or higher). |
| `verbatimModuleSyntax: true` | Enforces explicit `import type` for type-only imports. Ensures bundlers can safely tree-shake types without needing TypeScript's analysis. |

### Path Aliases

Map `@/*` to `src/*` so imports read `@/features/auth/login` instead of `../../../features/auth/login`. The bundler or test runner must also be configured to resolve this alias.

### Recommended tsconfig.json

```jsonc
{
  "compilerOptions": {
    // Type safety -- all non-negotiable
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalProperties": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    // Modules
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    // Emit -- let the bundler handle it
    "noEmit": true,
    "target": "ES2022",
    "lib": ["ES2023"],

    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // Interop
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

> **For Node libraries that emit JS directly (no bundler):** replace `"noEmit": true` with `"outDir": "dist"` and `"declaration": true`, and change `moduleResolution` to `"nodenext"` and `module` to `"NodeNext"`.

---

## Project Structure

**Why it matters:** Feature-based organization scales. Layer-based organization (`controllers/`, `services/`, `models/`) forces you to scatter related code across the tree, making features hard to trace and refactor.

### General Pattern

```
src/
  features/         # Feature modules (each self-contained)
    auth/
      login.ts
      login.test.ts
      register.ts
    billing/
      ...
  shared/           # Cross-cutting utilities, types, constants
    utils/
    types/
    config/
  app/              # App bootstrap, routing, middleware wiring
tests/              # Integration / E2E tests (unit tests live next to source)
docs/               # Project documentation
spec/               # API specs, OpenAPI definitions
```

### Conventions

- **Unit tests** live next to the source file: `login.ts` and `login.test.ts` in the same directory. This keeps context together and makes it obvious when a file lacks tests.
- **Integration/E2E tests** go in a top-level `tests/` directory since they span features.
- **For libraries:** flatten the structure. `src/` for source, `examples/` for usage demos, `benchmarks/` for perf tests.

---

## Linting & Formatting

**Why it matters:** Consistent style eliminates bikeshedding in code review. Speed matters because slow linters get skipped or turned off.

### Recommendation: Biome

Biome is a single Rust-based tool that replaces both ESLint and Prettier. It is 10-25x faster, has zero npm dependencies, and produces consistent output with no config debates.

```jsonc
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "warn",
        "noUnusedVariables": "warn",
        "useExhaustiveDependencies": "warn"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".next", "coverage"]
  }
}
```

### Alternative: ESLint + Prettier

Use this path only if you need ESLint plugins that Biome does not yet cover (e.g., `eslint-plugin-react-compiler`, specialized framework plugins). In that case:

- Use **ESLint flat config** (`eslint.config.js`) -- the legacy `.eslintrc` format is deprecated.
- Use `eslint-config-prettier` to disable ESLint's formatting rules, letting Prettier own formatting.
- Use `typescript-eslint` v8+ with typed linting enabled.

---

## Testing

**Why it matters:** Tests that are slow or painful to write don't get written. Vitest eliminates the configuration overhead of Jest while staying API-compatible.

### Recommendation: Vitest

- **Native TypeScript** -- no `ts-jest` or Babel transforms needed.
- **Jest-compatible API** -- `describe`, `it`, `expect` work as expected. Migration is near-trivial.
- **Fast** -- uses Vite's transform pipeline and runs tests in parallel by default.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use 'jsdom' or 'happy-dom' for browser code
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/types.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

### E2E Testing

- **Web apps:** Playwright. Cross-browser, auto-waiting, excellent DX.
- **APIs:** Supertest (or Vitest + native `fetch` against a test server).

---

## Frameworks

**Don't prescribe -- the wizard should ask the user.** Below are trade-offs to inform the decision.

### Web APIs

| Framework | Best for | Trade-off |
|---|---|---|
| **Fastify** | Performance-sensitive APIs, microservices | Fast (2-3x Express), schema-based validation, good plugin system. Smaller ecosystem than Express. |
| **Express** | Maximum ecosystem compatibility | Huge middleware ecosystem. Slower, callback-oriented, less type-safe. |
| **Hono** | Edge runtimes, universal deploy targets | Tiny, runs everywhere (Cloudflare Workers, Deno, Bun, Node). Newer, smaller ecosystem. |

### Full-Stack

| Framework | Best for | Trade-off |
|---|---|---|
| **Next.js (App Router)** | SEO-critical apps, React ecosystem | Huge ecosystem, Vercel-optimized. Complex mental model (RSC, server actions). |
| **Remix / React Router v7** | Data-heavy apps, progressive enhancement | Web-standards focused, excellent data loading. Smaller ecosystem than Next. |

### CLI Tools

- **Commander** for argument parsing + **Inquirer** for interactive prompts.
- For complex CLIs, consider **oclif** (Salesforce-backed, plugin architecture).

---

## Common Packages

Each recommendation is chosen for TypeScript-first design, active maintenance, and minimal dependency footprint.

### Validation
- **Zod** -- TypeScript-first schema validation. Infers static types from schemas, so you write the schema once and get runtime validation + compile-time types. Composable, zero dependencies.

### HTTP Client
- **Built-in `fetch`** (Node 18+) -- sufficient for most use cases. No extra dependency.
- **ky** -- tiny wrapper over fetch with retries, hooks, and better error handling. Prefer over axios for new projects.
- **axios** -- only if you need interceptors, upload progress, or automatic transforms that ky doesn't cover.

### Database
- **Prisma** -- best DX, auto-generated typed client, excellent migrations. Slightly slower query performance due to the query engine layer.
- **Drizzle** -- SQL-like syntax with full type safety, no code generation step, thinner abstraction. Better raw performance. Less hand-holding than Prisma.

### Authentication
- **better-auth** -- framework-agnostic, TypeScript-first, modern approach. Good for custom auth flows.
- **next-auth (Auth.js)** -- the standard for Next.js projects. Broad provider support.
- **passport** -- the legacy option. Use only if you need a specific strategy not covered by the above.

### Date/Time
- **date-fns** -- tree-shakeable, functional, immutable. Import only what you use.
- **Temporal API** -- the future standard, available behind flags or via polyfill. Consider for new long-lived projects.

### Other Essentials
- **nanoid** -- URL-safe unique ID generation (smaller, faster than uuid).
- **pino** -- fast structured JSON logging for Node services.
- **dotenv** -- environment variable loading. Note: Node 20.6+ has built-in `--env-file` support.

---

## Git Hooks

**Why it matters:** Catching lint errors and type failures before they hit CI saves review cycles and keeps the commit history clean.

### Setup: Husky + lint-staged

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### .husky/pre-commit

```sh
pnpm exec lint-staged
```

### lint-staged config (in package.json)

```jsonc
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --write --no-errors-on-unmatched"
    ],
    "*.{json,md,yaml,yml}": [
      "biome format --write --no-errors-on-unmatched"
    ]
  }
}
```

> **Tip:** Don't run `tsc` in lint-staged -- it type-checks the whole project regardless of staged files and is too slow for a pre-commit hook. Run type-checking in CI or as a separate script.

---

## Scripts Pattern

**Why it matters:** Consistent script names across projects mean every team member (and CI pipeline) runs the same commands without checking docs.

### Recommended package.json scripts

```jsonc
{
  "scripts": {
    // Development
    "dev": "vite dev",                           // or tsx watch, nodemon, next dev
    "build": "vite build",                       // or tsc && node-build, next build
    "start": "node dist/index.js",               // or next start
    "preview": "vite preview",                   // for web apps

    // Quality
    "check": "biome check .",                    // lint + format check (CI)
    "check:fix": "biome check --write .",        // lint + format fix (local)
    "type-check": "tsc --noEmit",                // type verification only

    // Testing
    "test": "vitest run",                        // single run (CI)
    "test:watch": "vitest",                      // watch mode (development)
    "test:coverage": "vitest run --coverage",    // with coverage report

    // Utilities
    "clean": "rm -rf dist node_modules/.cache",  // reset build artifacts
    "prepare": "husky"                           // auto-setup git hooks on install
  }
}
```

### Conventions

- `dev` always starts the development server/watcher.
- `build` always produces a production artifact.
- `test` (no args) always runs the full suite once. `test:watch` is the interactive mode.
- `check` is the CI-oriented lint/format verification. `check:fix` is the local auto-fix variant.
- `type-check` runs `tsc --noEmit` separately because bundlers skip type-checking for speed.
- `prepare` is a special npm/pnpm lifecycle hook that runs after `install`, ensuring git hooks are always set up.
