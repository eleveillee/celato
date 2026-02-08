# Python Stack Guide

This guide provides researched best practices for Python projects.
The Setup Wizard references this when configuring a new project.
It is NOT a copy-paste template -- it explains WHY certain choices are made
so the wizard can generate fresh, tailored configurations.

---

## Python Version

**Recommend: Python 3.12+**

- 3.12 brought significant performance improvements (up to 5% faster overall), better error
  messages with fine-grained tracebacks, and `f-string` grammar improvements.
- 3.13 adds an experimental free-threaded mode (no GIL) and a JIT compiler foundation.
- For maximum library compatibility with modern syntax, 3.12 is the sweet spot.
- Always pin the minimum version in `pyproject.toml` via `requires-python = ">=3.12"`.

**Single config file:** Use `pyproject.toml` (PEP 621) as the unified configuration file for
project metadata, dependencies, and all tool settings. This eliminates the need for
`setup.py`, `setup.cfg`, `requirements.txt`, `MANIFEST.in`, and per-tool config files.

---

## Package Manager

**Recommend: uv**

| Tool | Speed | Venvs | Lock file | Publishing | Notes |
|------|-------|-------|-----------|------------|-------|
| **uv** | 10-100x faster than pip | Built-in | `uv.lock` | Via `uv publish` | Rust-based, drop-in pip replacement |
| Poetry | ~1x pip | Built-in | `poetry.lock` | Built-in | Mature, large ecosystem |
| pip + venv | Baseline | stdlib | None (pip-compile) | twine | Manual orchestration |

**Why uv:**
- Written in Rust -- installs packages 10-100x faster than pip.
- Replaces pip, venv, pip-tools, and virtualenv with a single binary.
- Compatible with the pip interface (`uv pip install`, `uv pip compile`).
- Manages Python versions itself (`uv python install 3.12`).
- Creates and manages virtualenvs automatically (`uv venv`, `uv run`).
- Generates reproducible lock files with `uv lock`.
- Supports `pyproject.toml` natively -- no `requirements.txt` needed.

**Key commands:**
```bash
uv init my-project          # Scaffold a new project
uv add fastapi httpx        # Add dependencies (updates pyproject.toml + lock)
uv add --dev pytest ruff    # Add dev dependencies
uv run python app.py        # Run inside the managed venv
uv run pytest               # Run tools inside the managed venv
uv sync                     # Install from lock file (CI / fresh clone)
uv build                    # Build sdist + wheel
uv publish                  # Publish to PyPI
```

**When to choose Poetry instead:**
- Team already uses Poetry and migration cost is high.
- Need plugin ecosystem (Poetry has more mature plugins).

---

## Project Structure

**Recommend: `src/` layout**

**Why `src/` layout over flat layout:**
- Prevents accidentally importing the local package instead of the installed version.
  Without `src/`, running `python` from the project root adds `.` to `sys.path`, so
  `import mypackage` resolves to the local directory rather than the installed package.
  This hides missing files, broken `__init__.py`, or packaging errors.
- Forces you to install the package (even in editable mode) before testing, which catches
  packaging bugs early.
- Clearer separation between source code and project-level files.

### CLI Application

```
my-cli-app/
  pyproject.toml
  uv.lock
  README.md
  src/
    my_cli_app/
      __init__.py
      __main__.py        # Enables `python -m my_cli_app`
      cli.py             # Typer/Click entry point
      commands/
        __init__.py
        serve.py
        migrate.py
      core/
        __init__.py
        config.py        # pydantic-settings based configuration
        models.py
      utils/
        __init__.py
  tests/
    __init__.py
    conftest.py          # Shared fixtures
    test_cli.py
    test_core/
      __init__.py
      test_config.py
      test_models.py
```

### Web API (FastAPI)

```
my-api/
  pyproject.toml
  uv.lock
  README.md
  alembic.ini
  src/
    my_api/
      __init__.py
      main.py            # FastAPI app factory
      config.py          # pydantic-settings
      dependencies.py    # Dependency injection
      routers/
        __init__.py
        health.py
        users.py
        items.py
      models/
        __init__.py
        user.py          # SQLAlchemy / SQLModel ORM models
        item.py
      schemas/
        __init__.py
        user.py          # Pydantic request/response schemas
        item.py
      services/
        __init__.py
        user_service.py
      db/
        __init__.py
        session.py
        migrations/      # Alembic migrations
  tests/
    __init__.py
    conftest.py
    test_routers/
      test_users.py
    test_services/
      test_user_service.py
```

### Library

```
my-library/
  pyproject.toml
  uv.lock
  README.md
  src/
    my_library/
      __init__.py        # Public API, __version__
      core.py
      exceptions.py
      types.py
      py.typed           # PEP 561 marker for type hint support
  tests/
    __init__.py
    conftest.py
    test_core.py
  docs/
    index.md
```

### Directory Purposes

| Directory / File | Purpose |
|-----------------|---------|
| `src/<pkg>/` | All importable source code |
| `tests/` | Test suite (mirrors `src/` structure) |
| `docs/` | Documentation (libraries/frameworks) |
| `scripts/` | One-off dev/ops scripts not part of the package |
| `conftest.py` | Shared pytest fixtures |
| `py.typed` | Marker file declaring the package ships type hints (PEP 561) |

---

## Type Hints

**Policy: MANDATORY on all function signatures.**

Type hints are not optional style -- they serve as machine-readable documentation,
enable static analysis to catch bugs before runtime, and dramatically improve
IDE autocompletion and refactoring support.

**Modern syntax (Python 3.10+):**
```python
# YES -- modern built-in generics (PEP 604, PEP 585)
def process(items: list[str], mapping: dict[str, int]) -> str | None: ...

# NO -- legacy typing module
from typing import List, Dict, Optional, Union
def process(items: List[str], mapping: Dict[str, int]) -> Optional[str]: ...
```

**For Python 3.9 support**, add this import at the top of every module to enable
modern annotation syntax:
```python
from __future__ import annotations
```

**Type checker: Recommend pyright**

| Tool | Speed | Inference | Strictness levels | Editor integration |
|------|-------|-----------|-------------------|--------------------|
| **pyright** | Fast (TypeScript-based) | Superior | basic / standard / strict | Native in VS Code (Pylance) |
| mypy | Slower | Good | Gradual | Plugins available |

**Why pyright:**
- Faster than mypy on large codebases (parallelized, incremental).
- Better type inference -- infers more types without explicit annotations.
- Strictness is configurable per-file or per-project.
- Powers Pylance in VS Code, so editor checking matches CI checking.
- Actively maintained by Microsoft.

**pyright config in `pyproject.toml`:**
```toml
[tool.pyright]
pythonVersion = "3.12"
typeCheckingMode = "standard"   # "basic" for gradual adoption, "strict" for libraries
venvPath = "."
venv = ".venv"
```

---

## Linting & Formatting

**Recommend: Ruff**

Ruff is a single Rust-based tool that replaces flake8, isort, black, pyupgrade,
autoflake, pycodestyle, pydocstyle, and 50+ flake8 plugins.

**Why Ruff:**
- 10-100x faster than the tools it replaces (lints large codebases in milliseconds).
- Single tool, single config section -- no juggling multiple tool configs.
- Drop-in compatible with flake8 rule codes (e.g., `E501`, `F401`).
- Built-in formatter (`ruff format`) that is Black-compatible but faster.
- Actively maintained with frequent releases and new rule additions.
- Auto-fix support for most rules (`ruff check --fix`).

**pyproject.toml config:**
```toml
[tool.ruff]
target-version = "py312"
line-length = 88                       # Black-compatible default

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "UP",     # pyupgrade (modernize syntax)
    "B",      # flake8-bugbear (common gotchas)
    "SIM",    # flake8-simplify
    "RUF",    # Ruff-specific rules
    "S",      # flake8-bandit (security)
    "A",      # flake8-builtins (shadowing built-ins)
    "C4",     # flake8-comprehensions
    "DTZ",    # flake8-datetimez (timezone-aware datetimes)
    "T20",    # flake8-print (no print statements)
    "PT",     # flake8-pytest-style
    "TCH",    # flake8-type-checking (move type-only imports behind TYPE_CHECKING)
    "ANN",    # flake8-annotations (enforce type hints)
]
ignore = [
    "ANN101",  # Missing type annotation for self
    "ANN102",  # Missing type annotation for cls
]

[tool.ruff.lint.isort]
known-first-party = ["my_package"]     # Replace with actual package name

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
docstring-code-format = true
```

**Key commands:**
```bash
ruff check .               # Lint
ruff check . --fix         # Lint with auto-fix
ruff format .              # Format (Black-compatible)
ruff format . --check      # Check formatting without changing files
```

---

## Testing

**Recommend: pytest**

pytest is the de facto standard for Python testing. It offers concise syntax (plain
`assert` instead of `self.assertEqual`), powerful fixtures, parametrize, and a rich
plugin ecosystem.

**pyproject.toml config:**
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = [
    "-ra",                    # Show summary of all non-passing tests
    "--strict-markers",       # Fail on unknown markers
    "--strict-config",        # Fail on config errors
    "-x",                     # Stop on first failure (remove for CI)
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks integration tests",
]
```

### Fixtures and conftest.py

Fixtures provide reusable setup/teardown. Place shared fixtures in `conftest.py`:

```python
# tests/conftest.py
import pytest

@pytest.fixture
def sample_user() -> dict[str, str]:
    return {"name": "Ada Lovelace", "email": "ada@example.com"}

@pytest.fixture
async def db_session():
    """Async fixture for database testing."""
    async with get_async_session() as session:
        yield session
        await session.rollback()
```

### Parametrize

Test multiple inputs without duplicating test functions:

```python
@pytest.mark.parametrize(
    ("input_val", "expected"),
    [
        ("hello", 5),
        ("", 0),
        ("world!", 6),
    ],
)
def test_string_length(input_val: str, expected: int) -> None:
    assert len(input_val) == expected
```

### Coverage

```toml
# In pyproject.toml
[tool.coverage.run]
source = ["src"]
branch = true

[tool.coverage.report]
fail_under = 80
show_missing = true
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "if __name__",
]
```

```bash
uv run pytest --cov --cov-report=term-missing
```

### Async Testing

For async code (FastAPI, httpx, etc.), use `pytest-asyncio`:

```toml
# In pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"          # Automatically handle async test functions
```

```python
async def test_fetch_data() -> None:
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        assert response.status_code == 200
```

---

## Frameworks

The wizard should ask about the project type and recommend accordingly.
Do not prescribe a single framework -- present trade-offs.

### Web API

| Framework | Best for | Pros | Cons |
|-----------|----------|------|------|
| **FastAPI** | APIs, microservices | Async, auto OpenAPI docs, Pydantic validation, high performance | Not batteries-included (no ORM, admin, auth built in) |
| **Django** | Full-stack web apps | Batteries-included (ORM, admin, auth, migrations), massive ecosystem | Heavier, sync by default (async support improving), steeper learning curve |
| **Litestar** | APIs (FastAPI alternative) | Class-based controllers, built-in DI, OpenAPI docs | Smaller community than FastAPI |
| **Flask** | Simple apps, learning | Minimal, flexible, well-documented | Manual setup for everything, sync by default |

**Guidance:**
- API-first / microservice --> FastAPI
- Full web app with admin, forms, server-rendered pages --> Django
- Already have a Django project that needs an API --> Django REST Framework or Django Ninja

### CLI

| Framework | Best for | Pros | Cons |
|-----------|----------|------|------|
| **Typer** | Modern CLIs | Type-hint based, auto-generated help, built on Click | Smaller ecosystem than Click |
| **Click** | Complex CLIs | Mature, composable, extensive docs | Verbose compared to Typer |
| **argparse** | Simple scripts | stdlib, no dependencies | Verbose, no auto-completion |

**Guidance:**
- New CLI project --> Typer (less boilerplate, type hints drive the interface)
- Complex nested commands, need plugins --> Click
- Zero-dependency script --> argparse

### Data / ML

No single "right" stack -- depends on the workload:
- **Data manipulation:** pandas (or polars for performance)
- **Numerical:** numpy
- **ML traditional:** scikit-learn
- **ML deep learning:** PyTorch (research-friendly) or TensorFlow
- **Data validation:** pandera (DataFrame validation via type hints)
- **Workflow orchestration:** Prefect or Dagster

---

## Common Packages (with Rationale)

### Validation: Pydantic v2

- Core rewritten in Rust -- 5-50x faster than v1.
- Provides TypeScript-like experience: define a model, get validation + serialization free.
- Deeply integrated with FastAPI, SQLModel, and the broader ecosystem.
- Use `model_validator` and `field_validator` for custom logic.

### HTTP Client: httpx

- Async and sync support in one library (`httpx.AsyncClient`, `httpx.Client`).
- API nearly identical to `requests` -- easy migration.
- HTTP/2 support built-in.
- Better timeout handling and transport customization.
- Prefer over `requests` for new projects (requests lacks async).

### Database ORM

| ORM | Best for | Notes |
|-----|----------|-------|
| **SQLAlchemy 2.0** | Complex queries, mature projects | Industry standard, 2.0 style uses modern Python typing |
| **SQLModel** | FastAPI projects | Combines SQLAlchemy + Pydantic, less boilerplate, simpler |
| **Tortoise ORM** | Async-first projects | Django-like API, fully async |
| **Django ORM** | Django projects | Tightly coupled with Django, excellent migrations |

**Guidance:** SQLAlchemy 2.0 for most projects. SQLModel if using FastAPI and want less boilerplate.

### Task Queues

| Tool | Best for | Notes |
|------|----------|-------|
| **Celery** | Production workloads | Mature, battle-tested, supports multiple brokers |
| **arq** | Async lightweight tasks | Built on asyncio + Redis, simpler than Celery |
| **Dramatiq** | Celery alternative | Simpler API, fewer footguns than Celery |

### Configuration: pydantic-settings

- Reads from environment variables, `.env` files, secrets files.
- Type-safe: validates config values at startup, not at first use.
- Integrates with Pydantic models -- same validation everywhere.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    debug: bool = False
    api_key: str
    max_connections: int = 10
```

### Logging: structlog

- Structured (JSON) logging for production, pretty-printed for development.
- Composable processors (add request IDs, timing, etc.).
- Integrates with stdlib `logging` so third-party library logs are also captured.
- Prefer over stdlib `logging` alone for anything beyond simple scripts.

---

## Pre-commit Hooks

**Use the `pre-commit` framework** to run checks automatically before each commit.
This catches issues locally before they reach CI.

**Install:**
```bash
uv add --dev pre-commit
uv run pre-commit install
```

**Example `.pre-commit-config.yaml`:**
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/RobertCraiwordie/pyright-python
    rev: v1.1.391
    hooks:
      - id: pyright

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-toml
      - id: check-added-large-files
        args: [--maxkb=500]
      - id: debug-statements          # Catch leftover breakpoint() / pdb

  - repo: local
    hooks:
      - id: pytest
        name: pytest (fast tests only)
        entry: uv run pytest -x -q -m "not slow and not integration"
        language: system
        types: [python]
        pass_filenames: false
```

**Note:** Pin `rev` values. Run `pre-commit autoupdate` periodically to bump them.

---

## pyproject.toml

The unified config file replaces `setup.py`, `setup.cfg`, `requirements.txt`,
`tox.ini`, `.flake8`, `.isort.cfg`, `mypy.ini`, `pytest.ini`, and more.

**Complete example:**

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "A short description of the project"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.12"
authors = [
    { name = "Your Name", email = "you@example.com" },
]
dependencies = [
    "fastapi>=0.115",
    "httpx>=0.28",
    "pydantic>=2.10",
    "pydantic-settings>=2.7",
    "sqlalchemy>=2.0",
    "uvicorn>=0.34",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.25",
    "pytest-cov>=6.0",
    "ruff>=0.8",
    "pyright>=1.1.390",
    "pre-commit>=4.0",
]

[project.scripts]
my-project = "my_project.cli:app"          # CLI entry point

[build-system]
requires = ["hatchling"]
backend-path = ["src"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/my_project"]

# --- Tool Configuration ---

[tool.ruff]
target-version = "py312"
line-length = 88

[tool.ruff.lint]
select = ["E", "W", "F", "I", "N", "UP", "B", "SIM", "RUF", "S", "A", "C4", "T20", "PT", "ANN"]
ignore = ["ANN101", "ANN102"]

[tool.ruff.lint.isort]
known-first-party = ["my_project"]

[tool.ruff.format]
quote-style = "double"
docstring-code-format = true

[tool.pyright]
pythonVersion = "3.12"
typeCheckingMode = "standard"
venvPath = "."
venv = ".venv"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = ["-ra", "--strict-markers", "--strict-config"]
asyncio_mode = "auto"
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]

[tool.coverage.run]
source = ["src"]
branch = true

[tool.coverage.report]
fail_under = 80
show_missing = true
exclude_lines = ["pragma: no cover", "if TYPE_CHECKING:", "if __name__"]
```

### Key Points

- **`[project]`** -- PEP 621 standard metadata. This is what PyPI reads.
- **`[project.optional-dependencies]`** -- Group dev/test/docs dependencies separately.
  Install with `uv sync --all-extras` or `uv sync --extra dev`.
- **`[project.scripts]`** -- Defines CLI entry points. After install, `my-project`
  becomes a command that calls `my_project.cli:app`.
- **`[build-system]`** -- Declares the build backend. `hatchling` is lightweight and
  modern. Alternatives: `setuptools`, `flit-core`, `pdm-backend`.
- **All tool configs** live under `[tool.<name>]` -- a single file to find, read, and maintain.
