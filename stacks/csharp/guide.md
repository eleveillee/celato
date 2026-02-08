# C# / .NET Stack Guide

This guide provides researched best practices for C#/.NET projects.
The Setup Wizard references this when configuring a new project.

---

## .NET Version

**Why it matters:** .NET version determines available language features, performance characteristics, support lifecycle, and deployment options.

- **Recommend .NET 8+** (LTS through November 2026, significant performance gains, native AOT compilation support, container-optimized runtime).
- Use the **latest C# language version** enabled by the SDK. Key features to leverage:
  - File-scoped namespaces (`namespace Foo;`) -- reduces nesting, one less indent level per file.
  - Records (`record Person(string Name, int Age)`) -- immutable data types with value semantics.
  - Pattern matching (`is`, `switch` expressions) -- expressive conditional logic.
  - Primary constructors (`class Service(ILogger logger)`) -- reduces constructor boilerplate, available in C# 12+.
  - Collection expressions (`[1, 2, 3]`) -- unified collection initialization syntax in C# 12+.
  - `required` members -- enforce initialization without constructors.
- Pin the SDK version with `global.json` so all developers and CI use the same toolchain.

```json
{
  "sdk": {
    "version": "8.0.400",
    "rollForward": "latestFeature"
  }
}
```

---

## Project Structure

**Why it matters:** Consistent layout makes navigation predictable, enforces dependency direction, and scales as the codebase grows.

```
MyProject/
  MyProject.sln
  global.json
  Directory.Build.props
  Directory.Packages.props
  .editorconfig
  src/
    MyProject/                        # main application (entry point)
    MyProject.Core/                   # domain/business logic, no external deps
    MyProject.Infrastructure/         # DB, HTTP clients, file I/O, third-party integrations
  tests/
    MyProject.Tests/                  # unit tests
    MyProject.IntegrationTests/       # integration tests (DB, API)
```

**Key principles:**

- **Solution file (.sln) at root.** Everything builds from `dotnet build` at the repo root.
- **`src/` and `tests/` separation.** Keeps production code distinct from test code. CI can target them independently.
- **Core/Infrastructure split** enforces the dependency rule: Core has zero external package references. Infrastructure references Core and implements its interfaces. The main project wires everything together. Only add this split when complexity warrants it -- a small API does not need three projects.
- **Feature-based organization within each project.** Group by feature/domain concept, not by technical layer. Prefer `Features/Orders/CreateOrder.cs` over `Services/OrderService.cs` + `Models/Order.cs` + `Repositories/OrderRepository.cs`.

---

## Project File (.csproj)

**Why it matters:** Modern .csproj is the single source of truth for build configuration. Getting these properties right prevents entire categories of bugs.

### Essential Properties

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

| Property | Rationale |
|---|---|
| `<Nullable>enable</Nullable>` | **Non-negotiable.** Enables nullable reference types. The compiler catches null-related bugs at compile time. Every new project should have this. |
| `<ImplicitUsings>enable</ImplicitUsings>` | Auto-imports common namespaces (`System`, `System.Collections.Generic`, `System.Linq`, etc.). Reduces file boilerplate. |
| `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` | Prevents warnings from accumulating. Especially important in CI -- warnings become errors on the build server, even if relaxed locally during development. |
| `<InvariantGlobalization>true</InvariantGlobalization>` | For APIs/services that don't need locale-specific formatting. Reduces deployment size and avoids culture-related surprises. Omit for user-facing apps that need localization. |

### Directory.Build.props (Shared Properties)

Place at solution root to apply settings to every project without repetition:

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

### Central Package Management (Directory.Packages.props)

**Why:** Ensures all projects use the same package versions. Prevents version drift and diamond dependency problems.

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Serilog" Version="4.0.0" />
    <PackageVersion Include="FluentValidation" Version="11.9.0" />
    <PackageVersion Include="xunit" Version="2.8.0" />
  </ItemGroup>
</Project>
```

Individual .csproj files then reference packages without a version:

```xml
<PackageReference Include="Serilog" />
```

---

## Code Style & Linting

**Why it matters:** Consistent style eliminates formatting debates in code review and makes diffs cleaner. C# has the richest `.editorconfig` support of any language.

### .editorconfig

Place at solution root. This is the authoritative style configuration -- IDEs (Visual Studio, Rider, VS Code with C# Dev Kit) and `dotnet format` all read it.

Key rules to set:

```ini
[*.cs]

# Organize usings
dotnet_sort_system_directives_first = true
dotnet_separate_import_directive_groups = false

# Namespace declaration
csharp_style_namespace_declarations = file_scoped:warning

# var preferences
csharp_style_var_for_built_in_types = true:suggestion
csharp_style_var_when_type_is_apparent = true:suggestion
csharp_style_var_elsewhere = true:suggestion

# Expression-bodied members
csharp_style_expression_bodied_methods = when_on_single_line:suggestion
csharp_style_expression_bodied_properties = true:suggestion

# Naming conventions (PascalCase for public, _camelCase for private fields)
dotnet_naming_rule.private_fields_should_be_camel_case.severity = warning
dotnet_naming_rule.private_fields_should_be_camel_case.symbols = private_fields
dotnet_naming_rule.private_fields_should_be_camel_case.style = camel_case_underscore

dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private
dotnet_naming_style.camel_case_underscore.required_prefix = _
dotnet_naming_style.camel_case_underscore.capitalization = camel_case
```

### Formatting Tools

- **`dotnet format`** -- Built into the SDK. Enforces .editorconfig rules. Run in CI as a check: `dotnet format --verify-no-changes`.
- **CSharpier** -- Opinionated formatter (like Prettier for C#). Less configuration, more consistency. Good choice if the team wants to eliminate all formatting discussions.

Pick one. Do not use both.

### Analyzers

- **Microsoft.CodeAnalysis.NetAnalyzers** -- Built into .NET 5+ SDKs. Covers correctness, performance, security, and API design rules. Enable via `<EnableNETAnalyzers>true</EnableNETAnalyzers>` (on by default in .NET 5+).
- **SonarAnalyzer.CSharp** -- Additional rules for code smells, cognitive complexity, and security. Good complement to the built-in analyzers.
- **Meziantou.Analyzer** -- Catches common mistakes (missing ConfigureAwait, improper string comparisons, etc.).

Configure severity in `.editorconfig` rather than suppressing in code:

```ini
# Promote specific rules to errors
dotnet_diagnostic.CA1062.severity = error   # Validate arguments of public methods
dotnet_diagnostic.CA2007.severity = none    # Don't require ConfigureAwait (ASP.NET Core doesn't need it)
```

---

## Testing

**Why it matters:** .NET has a mature testing ecosystem. Choosing the right combination of libraries significantly impacts test readability and maintenance.

### Test Framework: xUnit

**Why xUnit:** Most widely used in modern .NET. Excellent async/await support. Constructor injection for test setup (no `[SetUp]` attribute). Used by the .NET team itself.

**Alternative:** NUnit is equally capable and has a larger assertion library built-in. Choose NUnit if the team already knows it.

### Supporting Libraries

| Library | Purpose | Why This One |
|---|---|---|
| **FluentAssertions** | Readable assertions | `result.Should().Be(42)` is clearer than `Assert.Equal(42, result)`. Rich collection/object assertions. |
| **NSubstitute** | Mocking | Cleaner API than Moq (`substitute.Method().Returns(value)` vs lambda syntax). No sealed-class limitations with source generators. |
| **Moq** | Mocking (alternative) | More established, larger community. Either choice is fine. |
| **coverlet** | Code coverage | Integrates with `dotnet test`. Outputs Cobertura XML for CI dashboards. |
| **Bogus** | Test data generation | Generates realistic fake data. Better than hand-crafting test fixtures. |

### Integration Testing

- **`Microsoft.AspNetCore.Mvc.Testing`** (WebApplicationFactory) -- Spins up an in-memory test server. Test full HTTP request/response pipelines without a real server. The standard approach for ASP.NET Core integration tests.
- **Testcontainers** -- Spins up real Docker containers (Postgres, Redis, RabbitMQ) for tests. Use when you need to test real database queries or external service interactions.

### Example Test Project Setup

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="xunit" />
    <PackageReference Include="xunit.runner.visualstudio" />
    <PackageReference Include="FluentAssertions" />
    <PackageReference Include="NSubstitute" />
    <PackageReference Include="coverlet.collector" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\..\src\MyProject\MyProject.csproj" />
  </ItemGroup>
</Project>
```

Run with coverage:

```bash
dotnet test --collect:"XPlat Code Coverage"
```

---

## Frameworks

**Why this section exists:** C#/.NET covers a wide range of application types. The wizard should ask what kind of project the user is building and recommend accordingly.

### Web API

| Approach | When to Use |
|---|---|
| **Minimal APIs** | Small-to-medium APIs, microservices, when you want less ceremony. Map endpoints directly: `app.MapGet("/items", () => ...)`. |
| **Controllers** | Larger APIs with complex routing, versioning, or when the team prefers the MVC pattern. More structure, more conventions. |

Both run on the same ASP.NET Core pipeline. Minimal APIs are not "lesser" -- they support filters, auth, OpenAPI, and dependency injection. Start with Minimal APIs; migrate to controllers if the routing file gets unwieldy.

### Background Services

- **Worker Services / IHostedService** -- For long-running background tasks, queue consumers, scheduled jobs. Same hosting model as ASP.NET Core (DI, configuration, logging all work the same).
- Add `<Project Sdk="Microsoft.NET.Sdk.Worker">` for a standalone worker.

### Desktop

| Framework | Platform | Notes |
|---|---|---|
| **WPF** | Windows only | Mature, rich ecosystem. Best for Windows-only business apps. |
| **.NET MAUI** | Cross-platform (Windows, macOS, iOS, Android) | Microsoft's cross-platform UI. Still maturing; best for mobile-first or multi-platform needs. |
| **Avalonia** | Cross-platform (Windows, macOS, Linux) | Community-driven. Strongest Linux desktop support. XAML-based like WPF. |

### Game Development

| Engine | Notes |
|---|---|
| **Unity** | C# scripting. Largest ecosystem, most tutorials. Best for 2D/3D games targeting many platforms. |
| **Godot** | C# support alongside GDScript. Lighter weight, open source. Growing community. |

---

## Common Packages (with Rationale)

**Why it matters:** The .NET ecosystem has mature, well-maintained packages for common concerns. Choosing wisely avoids reinventing the wheel and reduces onboarding time.

### Validation: FluentValidation

```csharp
public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
        RuleFor(x => x.Total).GreaterThan(0);
    }
}
```

**Why:** Separates validation logic from models. Expressive rule definitions. Integrates with ASP.NET Core model validation pipeline.

### Serialization: System.Text.Json

**Why:** Built into .NET. Significantly faster and lower-allocation than Newtonsoft.Json. Use `System.Text.Json` by default. Only reach for Newtonsoft.Json when you need features like `JObject` dynamic parsing, `JsonPath`, or must serialize types with no public constructors.

Enable source generators for AOT compatibility and faster serialization:

```csharp
[JsonSerializable(typeof(WeatherForecast))]
internal partial class AppJsonContext : JsonSerializerContext { }
```

### HTTP Client: IHttpClientFactory

**Why:** Creating `HttpClient` directly causes socket exhaustion. `IHttpClientFactory` manages connection pooling, DNS rotation, and lifetime.

```csharp
builder.Services.AddHttpClient<GitHubService>(client =>
{
    client.BaseAddress = new Uri("https://api.github.com");
    client.DefaultRequestHeaders.UserAgent.ParseAdd("MyApp/1.0");
});
```

### Database Access

| Library | When to Use |
|---|---|
| **EF Core** | Productivity-first. Migrations, change tracking, LINQ queries. Best for most CRUD apps. |
| **Dapper** | Performance-critical paths or when you want full SQL control. Micro-ORM, maps query results to objects. |

They're not mutually exclusive -- use EF Core for general CRUD and Dapper for hot paths or complex queries.

### Logging: Serilog + Microsoft.Extensions.Logging

**Why:** Serilog provides structured logging (log events as data, not just strings). Use `Microsoft.Extensions.Logging.ILogger<T>` as the abstraction in your code, and configure Serilog as the provider. This keeps your code decoupled from the logging implementation.

```csharp
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));
```

Log structured data:

```csharp
_logger.LogInformation("Order {OrderId} created for {CustomerId}", order.Id, order.CustomerId);
```

### Dependency Injection

**Why built-in:** `Microsoft.Extensions.DependencyInjection` is sufficient for the vast majority of applications. It integrates with all ASP.NET Core infrastructure. Only consider a third-party container (Autofac, Lamar) if you need advanced features like property injection, interceptors, or assembly scanning with conventions.

### Mediator: MediatR

**Why:** Implements the mediator pattern for CQRS (Command Query Responsibility Segregation). Decouples request handling from the caller. Useful for pipeline behaviors (validation, logging, transactions).

**When to use:** Medium-to-large applications where you want clear separation between API endpoints and business logic. Overkill for small CRUD apps.

### Resilience: Polly / Microsoft.Extensions.Http.Resilience

**Why:** External service calls fail. Polly provides retry, circuit breaker, timeout, and fallback policies. `Microsoft.Extensions.Http.Resilience` (built on Polly) integrates directly with `IHttpClientFactory`.

```csharp
builder.Services.AddHttpClient<CatalogService>()
    .AddStandardResilienceHandler();
```

---

## Configuration

**Why it matters:** .NET has a powerful, layered configuration system. Understanding the pattern prevents secrets leaking and environment-specific bugs.

### Configuration Layering

Sources are loaded in order; later sources override earlier ones:

1. `appsettings.json` -- defaults, safe to commit.
2. `appsettings.{Environment}.json` -- environment-specific overrides (Development, Staging, Production).
3. Environment variables -- for deployment (Docker, cloud). Override any JSON setting using `__` as section separator: `ConnectionStrings__Default=...`.
4. User secrets (development only) -- `dotnet user-secrets set "ApiKey" "abc123"`. Stored outside the repo. Never committed.
5. Command-line arguments.

### Options Pattern

**Why:** Typed configuration. Compile-time safety. Validation at startup.

```csharp
public class SmtpSettings
{
    public const string SectionName = "Smtp";

    public required string Host { get; init; }
    public required int Port { get; init; }
    public required string FromAddress { get; init; }
}
```

Register and validate:

```csharp
builder.Services
    .AddOptions<SmtpSettings>()
    .BindConfiguration(SmtpSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

Inject via `IOptions<SmtpSettings>`, `IOptionsSnapshot<SmtpSettings>` (reloads per request), or `IOptionsMonitor<SmtpSettings>` (change notifications).

### appsettings.json Example

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Smtp": {
    "Host": "localhost",
    "Port": 1025,
    "FromAddress": "noreply@example.com"
  },
  "ConnectionStrings": {
    "Default": ""
  }
}
```

Connection strings and API keys should never appear in `appsettings.json`. Use user secrets locally and environment variables in production.

---

## CI/CD

**Why it matters:** .NET's CLI tooling makes CI straightforward. Pin the SDK, run standard commands, and produce artifacts.

### Core CLI Commands

```bash
dotnet restore              # Restore NuGet packages
dotnet build --no-restore   # Build without redundant restore
dotnet test --no-build      # Run tests (assumes build already happened)
dotnet publish -c Release   # Produce deployment artifacts
```

### global.json (SDK Pinning)

**Why:** Without this, different machines may use different SDK versions, causing subtle build differences.

```json
{
  "sdk": {
    "version": "8.0.400",
    "rollForward": "latestFeature"
  }
}
```

`rollForward: "latestFeature"` allows patch updates (8.0.401, 8.0.402) but not minor/major bumps. This balances reproducibility with security patches.

### CI Script Pattern

A typical CI pipeline:

```bash
# Restore
dotnet restore

# Build
dotnet build --no-restore --configuration Release

# Lint check (enforce .editorconfig)
dotnet format --verify-no-changes

# Test with coverage
dotnet test --no-build --configuration Release \
  --collect:"XPlat Code Coverage" \
  --results-directory ./test-results

# Publish
dotnet publish src/MyProject/MyProject.csproj \
  --no-build --configuration Release \
  --output ./publish
```

### Docker Support

For containerized deployments, use the SDK image for build and the runtime image for production:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/MyProject/MyProject.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "MyProject.dll"]
```

For even smaller images, consider native AOT publishing (`dotnet publish -p:PublishAot=true`) which produces a self-contained binary with no runtime dependency.

---

## Quick Reference: New Project Checklist

1. Create solution with `dotnet new sln`
2. Add `global.json` to pin SDK version
3. Add `Directory.Build.props` with shared properties (Nullable, ImplicitUsings, TreatWarningsAsErrors)
4. Add `Directory.Packages.props` for central package management
5. Add `.editorconfig` with team style rules
6. Create `src/` and `tests/` project structure
7. Configure logging (Serilog + structured logging)
8. Configure CI pipeline (restore, build, format-check, test, publish)
9. Add `.gitignore` (use `dotnet new gitignore`)
