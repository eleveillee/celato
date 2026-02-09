# C# / .NET Stack Guide

> Key decisions for the Setup Wizard. Researched for 2026 best practices.
> Always prefer the latest stable version. Minimums below are the tested "known-good" floor.

## Recommended Stack (2026)

| Category | Package | Minimum | Notes |
|---|---|---|---|
| Runtime | .NET | 10 LTS | C# 14, supported through Nov 2028 |
| Web API | ASP.NET Core | 10 | Minimal APIs default |
| ORM | EF Core | 10+ | Migrations, LINQ, change tracking |
| ORM (perf) | Dapper | 2+ | Hot paths, full SQL control |
| Testing | xUnit | 2.8+ | Async-first, constructor setup |
| Assertions | AwesomeAssertions | latest | Free fork of FluentAssertions |
| Mocking | NSubstitute | latest | Clean API, no SponsorLink |
| Validation | FluentValidation | 11+ | Separated from models |
| Logging | Serilog | 4+ | Structured, ILogger<T> abstraction |
| Serialization | System.Text.Json | built-in | Source generators for AOT |
| Resilience | Microsoft.Extensions.Http.Resilience | latest | Built on Polly v8 |
| Analyzers | Meziantou.Analyzer | latest | Catches common async/string mistakes |
| Cloud-native | .NET Aspire | 9+ | Service discovery, dashboard, OTEL |

> Update this table as the base evolves.

---

## .NET Version

**Decision:** Target **.NET 10** (LTS, November 2025 -- supported through November 2028).
**Why:** .NET 10 is the current LTS release. .NET 8 LTS and .NET 9 STS both reach end-of-support in November 2026, so new projects should start on 10. Significant performance gains, improved Native AOT, and .NET Aspire integration.
**Alternatives:** .NET 8 LTS is acceptable for projects that must stay on VS 2022 (VS 2026 is required for .NET 10 targeting).

Pin the SDK version with `global.json` (`"rollForward": "latestFeature"` allows patch updates only).

---

## C# Language Version

**Decision:** Use **C# 14** (ships with .NET 10 SDK).
**Why:** Key features worth adopting immediately:
- **Extension members** -- extension properties, operators, and static methods (headline feature).
- **`field` keyword** -- write property accessors without declaring backing fields.
- **Null-conditional assignment** -- `obj?.Prop = value` eliminates null-check boilerplate.
- **Implicit Span conversions** -- less ceremony passing arrays/spans to APIs.
- **Primary constructors** (C# 12+) -- `class Service(ILogger logger)` reduces boilerplate.
- **Collection expressions** (C# 12+) -- `[1, 2, 3]` unified syntax.
- **Records, pattern matching, file-scoped namespaces** -- continue using these from earlier versions.
**Alternatives:** C# 13 if staying on .NET 9. Feature availability is tied to SDK version.

---

## Project Structure

**Decision:** **Core/Infrastructure split** with **feature-based organization** inside each project.
**Why:** Clean Architecture's dependency rule (Core has zero external references, Infrastructure implements Core interfaces) remains the most teachable and maintainable pattern. Organize files by feature (`Features/Orders/CreateOrder.cs`), not by technical layer (`Services/`, `Repositories/`).
**Alternatives:** Vertical Slice Architecture for experienced teams who want all code for a feature in one place. The 2025-2026 consensus is that the two approaches are complementary -- use Clean Architecture for the boundary structure and vertical slices for feature organization within those boundaries. Small APIs (< 5 endpoints) do not need the Core/Infrastructure split at all.

```
MyProject/
  MyProject.sln
  global.json / Directory.Build.props / Directory.Packages.props / .editorconfig
  src/
    MyProject/                  # entry point, DI wiring
    MyProject.Core/             # domain logic, no external deps
    MyProject.Infrastructure/   # DB, HTTP, third-party integrations
  tests/
    MyProject.Tests/
    MyProject.IntegrationTests/
```

---

## Project File Essentials

**Decision:** Set these properties in `Directory.Build.props` so they apply to all projects:
**Why:** Prevents entire categories of bugs and eliminates per-project repetition.

| Property | Rationale |
|---|---|
| `<Nullable>enable</Nullable>` | Non-negotiable. Compiler catches null bugs at build time. |
| `<ImplicitUsings>enable</ImplicitUsings>` | Reduces file boilerplate. |
| `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` | Warnings never accumulate; CI enforces this. |

Use **Central Package Management** (`Directory.Packages.props` with `<ManagePackageVersionsCentrally>true`) to lock all NuGet versions in one place.

---

## Code Style & Formatting

**Decision:** Use **.editorconfig** for style rules + **`dotnet format`** for enforcement. Consider **CSharpier** as an alternative.
**Why:** `.editorconfig` is the ecosystem standard -- Visual Studio, Rider, VS Code, and `dotnet format` all read it natively. Run `dotnet format --verify-no-changes` in CI to enforce. CSharpier is faster and fully opinionated (zero config), but is a third-party tool and can conflict with .editorconfig formatting rules.
**Alternatives:** CSharpier if the team wants Prettier-style zero-config formatting. Pick one formatter; do not use both.

Key .editorconfig rules to set: file-scoped namespaces (`warning`), `var` preference, `_camelCase` for private fields, expression-bodied members.

---

## Analyzers

**Decision:** Enable these analyzers in every project:
**Why:** Catches bugs, security issues, and performance anti-patterns at build time -- far cheaper than runtime discovery.

| Analyzer | Purpose |
|---|---|
| **Microsoft.CodeAnalysis.NetAnalyzers** | Built into the SDK. Correctness, performance, security, API design. On by default. |
| **Meziantou.Analyzer** | Catches common mistakes (string comparisons, async pitfalls, missing CancellationToken). |
| **SonarAnalyzer.CSharp** | Code smells, cognitive complexity, additional security rules. |

**Alternatives:** Roslynator (500+ rules, good for refactoring suggestions). Configure severity overrides in `.editorconfig`, not in-code suppressions.

---

## Testing

**Decision:** **xUnit** + **NSubstitute** + **AwesomeAssertions** (or Shouldly).
**Why:** xUnit is the most widely used modern .NET test framework with excellent async support and constructor-based setup. NSubstitute has the cleanest mocking API and avoids the Moq SponsorLink controversy. FluentAssertions v8+ requires a commercial license ($130/dev/year); **AwesomeAssertions** is the community fork (Apache 2.0, drop-in replacement, same API). Shouldly is a simpler alternative if the team prefers `ShouldBe()` syntax.
**Alternatives:** NUnit if the team already uses it. TUnit is a new source-generator-based framework (async-first, no reflection) -- worth evaluating for greenfield projects but still maturing. Pin Moq at 4.18.4 if migrating away is not feasible.

| Library | Purpose |
|---|---|
| **xUnit** | Test framework |
| **NSubstitute** | Mocking |
| **AwesomeAssertions** | Fluent assertions (free fork of FluentAssertions) |
| **Bogus** | Fake data generation |
| **coverlet** | Code coverage (Cobertura XML for CI) |
| **Testcontainers** | Real Docker containers for integration tests |
| **WebApplicationFactory** | In-memory ASP.NET Core test server |

---

## Web API Approach

**Decision:** Default to **Minimal APIs**. Use Controllers for large/complex APIs.
**Why:** Microsoft recommends Minimal APIs for new projects. They have full feature parity (filters, auth, OpenAPI, DI) with less ceremony. Performance is slightly better. Every .NET release adds more Minimal API capabilities.
**Alternatives:** Controllers when the API is large-scale with complex routing, versioning, or the team prefers MVC conventions. Both can coexist in one project.

---

## Serialization

**Decision:** **System.Text.Json** exclusively. Use source generators for AOT compatibility.
**Why:** Built-in, significantly faster and lower-allocation than Newtonsoft.Json. .NET 10 adds `JsonSerializerOptions.Strict` (rejects duplicate properties, ambiguous JSON) and `PipeReader` support for streaming large payloads. Source generators (`[JsonSerializable(typeof(T))]`) enable Native AOT and faster serialization.
**Alternatives:** Newtonsoft.Json only when you need `JObject` dynamic parsing, `JsonPath`, or must serialize types without public constructors.

---

## ORM / Data Access

**Decision:** **EF Core** by default. Add **Dapper** for performance-critical queries.
**Why:** EF Core provides migrations, change tracking, and LINQ -- optimal for developer productivity in CRUD-heavy apps. EF Core compiled queries are now within 1.5-2x of Dapper for reads. Use Dapper (or raw SQL) for hot paths where sub-millisecond latency matters. They are complementary, not mutually exclusive.
**Alternatives:** Dapper-only for projects that are entirely read-heavy or where the team prefers full SQL control.

---

## Dependency Injection

**Decision:** Use the **built-in** `Microsoft.Extensions.DependencyInjection` container.
**Why:** Sufficient for the vast majority of applications. Deeply integrated with all ASP.NET Core infrastructure. No third-party dependency needed.
**Alternatives:** Autofac or Lamar only if you need property injection, interceptors, or convention-based assembly scanning.

---

## Logging

**Decision:** **Serilog** as the provider, **`ILogger<T>`** as the abstraction in code.
**Why:** Serilog remains the dominant structured logging library in .NET. Structured log events (not string concatenation) are essential for searchable logs. Use `ILogger<T>` everywhere so code is decoupled from the provider. Serilog integrates with OpenTelemetry via `Serilog.Sinks.OpenTelemetry` for unified observability.
**Alternatives:** Built-in `Microsoft.Extensions.Logging` providers are adequate for simple apps. For cloud-native apps using .NET Aspire, OpenTelemetry is configured automatically.

---

## Resilience

**Decision:** Use **`Microsoft.Extensions.Http.Resilience`** (built on Polly v8) for HTTP calls. Use **`Microsoft.Extensions.Resilience`** for non-HTTP resilience.
**Why:** Integrates directly with `IHttpClientFactory`. `AddStandardResilienceHandler()` provides retry, circuit breaker, and timeout with sensible defaults in one line. Polly v8 has improved performance, built-in telemetry, and fluent syntax. The older `Microsoft.Extensions.Http.Polly` package is deprecated.
**Alternatives:** Direct Polly v8 usage when you need custom pipeline composition beyond the standard handler.

---

## Native AOT

**Decision:** **Opt-in for suitable workloads**, not a blanket default.
**Why:** Production-ready in .NET 10 for Minimal APIs, gRPC, and worker services. Produces self-contained binaries with instant startup and no runtime dependency -- ideal for containers and serverless. However, reflection-heavy code, some ASP.NET Core features (Razor views, dynamic loading), and many third-party libraries are not AOT-compatible.
**Alternatives:** Standard publish (`dotnet publish -c Release`) when AOT compatibility is not worth the constraints. Always validate with `dotnet publish -p:PublishAot=true` early if AOT is a goal.

---

## .NET Aspire

**Decision:** Use **.NET Aspire** for cloud-native / distributed applications. Do not add it to simple single-project APIs.
**Why:** Aspire is GA and production-ready. It provides service discovery, orchestration, health checks, OpenTelemetry integration, and a developer dashboard out of the box. The CLI is GA as of Aspire 9.4. It eliminates boilerplate for multi-service apps (API + database + cache + message broker).
**Alternatives:** Manual Docker Compose + configuration for teams that want full control or have existing orchestration. Skip entirely for single-service applications.

---

## Validation

**Decision:** **FluentValidation** for complex validation rules. Data annotations for simple cases.
**Why:** Separates validation logic from models. Expressive rule definitions. Integrates with the ASP.NET Core model validation pipeline.
**Alternatives:** Data annotations (`[Required]`, `[Range]`) are built-in and sufficient for simple DTOs.

---

## HTTP Clients

**Decision:** Always use **`IHttpClientFactory`** via typed clients.
**Why:** Direct `HttpClient` instantiation causes socket exhaustion. The factory manages connection pooling, DNS rotation, and lifetime. Pair with `AddStandardResilienceHandler()` for retry/circuit-breaker.

---

## New Project Checklist

1. `dotnet new sln` + `global.json` (pin SDK to .NET 10)
2. `Directory.Build.props` (Nullable, ImplicitUsings, TreatWarningsAsErrors)
3. `Directory.Packages.props` (central package management)
4. `.editorconfig` (style rules)
5. Create `src/` and `tests/` project structure
6. Configure Serilog + structured logging
7. Configure CI: `dotnet restore && build && format --verify-no-changes && test`
8. `dotnet new gitignore`
