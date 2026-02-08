# Architecture Guide

This document describes the architectural patterns and principles used across
all projects built from this base. It's technology-agnostic — specific stack
choices are covered in `stacks/`. AI agents should reference this when making
architectural decisions.

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
