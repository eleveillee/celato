# Python Stack Guide

> Key decisions for the Setup Wizard. Researched for 2026 best practices.
> Always prefer the latest stable version. Minimums below are the tested "known-good" floor.

## Recommended Stack (2026)

| Category | Package | Minimum | Notes |
|---|---|---|---|
| Language | Python | 3.13+ | Target 3.14 for free-threaded / JIT |
| Package manager | uv | latest | Replaces pip, venv, pip-tools |
| Web framework | FastAPI | 0.115+ | Async, auto OpenAPI, Pydantic |
| Validation | Pydantic | 2.10+ | Rust core, 5-50x faster than v1 |
| ORM | SQLAlchemy | 2.0+ | Modern typing, full async |
| ORM (alt) | SQLModel | latest | SQLAlchemy + Pydantic unified |
| HTTP client | httpx | 0.28+ | Sync + async, HTTP/2 |
| Linting | Ruff | 0.15+ | Replaces flake8 + black + isort |
| Type checking | pyright | 1.1+ | Watch ty (Astral) for successor |
| Testing | pytest | 8+ | De facto standard |
| Config | pydantic-settings | 2.7+ | Type-safe env/config loading |
| Logging | structlog | latest | Structured JSON logging |
| Build backend | hatchling | latest | Modern, src-layout default |

> Update this table as the base evolves.

---

## Python Version

**Decision:** Python 3.13+ (minimum), target 3.14 for new projects.
**Why:** 3.14 (released Oct 2025) officially supports free-threaded builds (PEP 779 -- GIL removal no longer experimental), deferred annotation evaluation (PEP 649), t-string literals (PEP 750), and an experimental JIT compiler. 3.13 remains a safe floor for maximum library compatibility.
**Alternatives:** Pin `>=3.13` if any dependency lacks 3.14 wheels. Avoid 3.12 for new projects -- it is entering the back half of its support window.

**Key config:** Set `requires-python = ">=3.13"` (or `">=3.14"`) in `pyproject.toml`. Always use `pyproject.toml` (PEP 621) as the single config file -- no `setup.py`, `requirements.txt`, or per-tool config files.

---

## Package Manager

**Decision:** uv
**Why:** Rust-based, 10-100x faster than pip. Replaces pip, venv, pip-tools, and virtualenv in a single binary. Manages Python versions (`uv python install 3.14`), creates venvs automatically, generates `uv.lock` for reproducible builds, and adheres to PEP standards via `pyproject.toml` natively.
**Alternatives:** Poetry only if a team already uses it and migration cost is prohibitive. Avoid raw pip for application projects.

---

## Project Structure

**Decision:** `src/` layout
**Why:** Prevents the project root from shadowing installed packages on `sys.path`. Forces editable install before testing, which catches packaging bugs early. This is the PyPA-recommended layout for anything beyond toy scripts.
**Alternatives:** Flat layout is acceptable for single-file scripts or throwaway prototypes.

---

## Type Checking

**Decision:** pyright (`typeCheckingMode = "standard"`)
**Why:** 3-5x faster than mypy, superior type inference on unannotated code, and powers Pylance in VS Code so editor feedback matches CI. Implements new typing PEPs ahead of mypy.
**Alternatives:** mypy if the team has extensive mypy plugin investment. Watch **ty** (Astral, beta Dec 2025) -- 10-60x faster than pyright, Rust-based, targeting stable release in 2026. Once ty reaches stable, it becomes the default recommendation.

**Policy:** Type hints are mandatory on all function signatures. Use modern built-in generics (`list[str]`, `str | None`) -- no `from typing import List, Optional`.

---

## Linting & Formatting

**Decision:** Ruff (linter + formatter)
**Why:** Single Rust-based tool replacing flake8, isort, black, pyupgrade, and 50+ plugins. 10-100x faster. Built-in formatter is Black-compatible. v0.15+ supports block suppression comments and 2026 style guide formatting.
**Alternatives:** None worth considering for new projects. Ruff has subsumed the Python linting ecosystem.

**Recommended rule set:**

```toml
[tool.ruff.lint]
select = [
    "E", "W", "F", "I", "N", "UP", "B", "SIM", "RUF",
    "S", "A", "C4", "DTZ", "T20", "PT", "ANN",
]
```

Note: `ANN101` and `ANN102` were removed in Ruff 0.8 -- do not reference them in ignore lists.

---

## Testing

**Decision:** pytest with `pytest-asyncio` (or `anyio` plugin for multi-backend)
**Why:** De facto standard. Plain `assert`, fixtures, parametrize, and a massive plugin ecosystem. `pytest-asyncio` with `asyncio_mode = "auto"` eliminates boilerplate for async tests.
**Alternatives:** Use `anyio` pytest plugin instead of `pytest-asyncio` when you need to test against both asyncio and trio backends.

**Key config decisions:**
- `testpaths = ["tests"]`, `pythonpath = ["src"]` (required for src layout).
- `--strict-markers` and `--strict-config` to catch typos early.
- Coverage via `pytest-cov`: set `fail_under = 80`, `branch = true`, exclude `TYPE_CHECKING` blocks.

---

## Web Frameworks

**Decision:** Context-dependent -- do not prescribe a single framework.

| Need | Pick | Why |
|------|------|-----|
| API / microservice | **FastAPI** | Async, auto OpenAPI, Pydantic validation, largest async-API ecosystem |
| Full-stack web app | **Django** | Batteries-included (ORM, admin, auth, migrations) |
| API with max performance | **Litestar** | Uses msgspec (~2x faster serialization), built-in DI, CSRF, sessions |
| Existing Django + API | **Django Ninja** | FastAPI-like DX inside Django |

**Why not default to Litestar:** FastAPI's ecosystem (tutorials, middleware, third-party integrations) is still significantly larger. Litestar is a strong choice when performance is the primary concern and the team accepts a smaller community.

---

## CLI Frameworks

**Decision:** Typer for new CLIs.
**Why:** Type-hint-driven interface with auto-generated help. Built on Click, so it composes well.
**Alternatives:** Click for complex plugin architectures. argparse only for zero-dependency scripts.

---

## Validation

**Decision:** Pydantic v2
**Why:** Rust core makes it 5-50x faster than v1. Deep integration with FastAPI, SQLModel, and pydantic-settings. Ecosystem standard for request/response schemas and config.
**Alternatives:** msgspec when raw serialization speed is critical (2-5x faster than Pydantic v2) and you do not need Pydantic's richer validation API or ecosystem integrations. Litestar uses msgspec natively.

---

## HTTP Client

**Decision:** httpx
**Why:** Supports both sync and async in one library. API mirrors `requests` for easy migration. HTTP/2 built-in. Better timeout and transport control than requests.
**Alternatives:** aiohttp for pure-async, high-concurrency workloads where maximum throughput matters more than API ergonomics. Never use `requests` for new async projects.

---

## ORM

**Decision:** SQLAlchemy 2.0 (default), SQLModel for FastAPI-centric projects.
**Why:** SQLAlchemy 2.0 is the industry standard with full async support and modern typing. SQLModel unifies SQLAlchemy + Pydantic models, reducing boilerplate in FastAPI apps, and you can drop down to raw SQLAlchemy when needed.
**Alternatives:** Django ORM for Django projects (do not mix). Tortoise ORM only if you want a Django-like async ORM outside Django.

---

## Task Queues

**Decision:** Context-dependent.

| Need | Pick | Why |
|------|------|-----|
| Production scale, multiple brokers | **Celery** | Battle-tested, supports RabbitMQ + Redis, rich ecosystem |
| Simpler API, fewer footguns | **Dramatiq** | Better defaults, built-in retries with backoff, RabbitMQ or Redis |
| Async-native, lightweight | **arq** | Built on asyncio + Redis, ideal for I/O-bound tasks in async apps |

**Default:** Celery for most production systems. arq if the entire stack is already asyncio-native.

---

## Configuration

**Decision:** pydantic-settings
**Why:** Type-safe config loaded from env vars / `.env` files with Pydantic validation at startup. Same validation patterns as the rest of the stack. Twelve-factor app compliant.
**Alternatives:** Dynaconf for multi-environment config file hierarchies (YAML/TOML/JSON). Raw `os.environ` only for trivial scripts.

---

## Logging

**Decision:** structlog
**Why:** Structured JSON output for production, colorized pretty-print for development. Composable processors (request IDs, timing). Integrates with stdlib `logging` so third-party library logs are captured.
**Alternatives:** stdlib `logging` for simple scripts or when zero dependencies is a hard requirement.

---

## Pre-commit

**Decision:** Use the `pre-commit` framework with Ruff + pyright hooks.
**Why:** Catches lint, format, and type errors before they reach CI. Single `.pre-commit-config.yaml` manages all hooks with pinned versions. Run `pre-commit autoupdate` periodically.

---

## Build Backend

**Decision:** hatchling
**Why:** Lightweight, modern, good defaults for src layout. No `setup.py` needed.
**Alternatives:** setuptools if the project has complex C extensions. flit-core for pure-Python libraries that want minimal config.
