# Unity Stack Guide

> AI generation pitfalls, patterns, and best practices for Unity projects.
> This guide helps AI agents generate correct Unity code on the first try.

## Recommended Stack (2026)

| Category | Choice | Version | Notes |
|---|---|---|---|
| Engine | Unity 6 | 6000.3 LTS | Long-term support, C# 9.0, Awaitable API |
| Language | C# | 9.0 | No C# 10+ features (no global usings, no file-scoped namespaces in older LTS) |
| IDE | Rider / VS Code | latest | VS Code needs C# Dev Kit extension |
| Input | Input System | 1.11+ | **Not** `UnityEngine.Input` (legacy) |
| UI (new projects) | UI Toolkit | built-in | USS + UXML, scales better for complex UI |
| UI (game HUDs) | UGUI | built-in | Still preferred for world-space and animated game UI |
| DI | VContainer | 1.16+ | 5-10x faster than Zenject, zero-alloc resolve |
| Async | UniTask | 2.5+ | Zero-alloc async/await, replaces coroutines for async work |
| Asset loading | Addressables | 2.3+ | **Not** `Resources.Load` |
| Testing | Unity Test Framework | 1.4+ | NUnit-based, EditMode + PlayMode |
| Serialization | Newtonsoft Json Unity | 3.2+ | UPM package `com.unity.nuget.newtonsoft-json` |

> Unity pins C# 9.0 across all current versions (2022 LTS, 2023, Unity 6). Do not use C# 10+ syntax.

---

## What AI Gets Wrong

### 1. Input System (most common mistake)

AI almost always defaults to the legacy Input class. Unity's new Input System has been the standard since 2021.

```csharp
// BAD - legacy Input Manager (AI default)
if (Input.GetKeyDown(KeyCode.Space)) { Jump(); }
float h = Input.GetAxis("Horizontal");

// GOOD - new Input System with generated actions
private PlayerInputActions _input;
void OnEnable() { _input = new PlayerInputActions(); _input.Enable(); }
void OnDisable() { _input.Disable(); }
void Update() {
    if (_input.Player.Jump.WasPressedThisFrame()) { Jump(); }
    float h = _input.Player.Move.ReadValue<Vector2>().x;
}
```

### 2. Update vs FixedUpdate

AI frequently puts physics code in `Update` or input code in `FixedUpdate`. Both cause bugs.

```csharp
// BAD - physics in Update (framerate-dependent)
void Update() { rb.AddForce(Vector3.forward * speed); }

// BAD - input polling in FixedUpdate (missed inputs)
void FixedUpdate() { if (_input.Player.Jump.WasPressedThisFrame()) Jump(); }

// GOOD - read input in Update, apply physics in FixedUpdate
private bool _jumpRequested;
void Update() { if (_input.Player.Jump.WasPressedThisFrame()) _jumpRequested = true; }
void FixedUpdate() {
    if (_jumpRequested) { rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse); _jumpRequested = false; }
}
```

### 3. Coroutine anti-patterns

AI generates coroutines for things that should be async, or leaks them.

```csharp
// BAD - coroutine not stopped on disable (leak)
void Start() { StartCoroutine(SpawnLoop()); }

// GOOD - track and stop coroutines
private Coroutine _spawnRoutine;
void OnEnable() { _spawnRoutine = StartCoroutine(SpawnLoop()); }
void OnDisable() { if (_spawnRoutine != null) StopCoroutine(_spawnRoutine); }

// BETTER - use UniTask for async work (zero-alloc, cancellation-aware)
private CancellationTokenSource _cts;
void OnEnable() { _cts = new(); SpawnLoopAsync(_cts.Token).Forget(); }
void OnDisable() { _cts?.Cancel(); _cts?.Dispose(); }
async UniTaskVoid SpawnLoopAsync(CancellationToken ct) {
    while (!ct.IsCancellationRequested) {
        Spawn();
        await UniTask.Delay(1000, cancellationToken: ct);
    }
}
```

### 4. Resources.Load instead of Addressables

```csharp
// BAD - Resources.Load (bloats build, no async, no memory management)
var prefab = Resources.Load<GameObject>("Enemies/Goblin");

// GOOD - Addressables (async, memory-managed, remote-capable)
var handle = Addressables.LoadAssetAsync<GameObject>("Enemies/Goblin");
await handle; // or handle.Completed += ...
var instance = Instantiate(handle.Result);
// Release when done: Addressables.Release(handle);
```

### 5. Transform manipulation on Rigidbodies

```csharp
// BAD - moving a Rigidbody via Transform (breaks physics)
transform.position += Vector3.forward * speed * Time.deltaTime;

// GOOD - use Rigidbody API in FixedUpdate
rb.MovePosition(rb.position + Vector3.forward * speed * Time.fixedDeltaTime);
```

### 6. DontDestroyOnLoad abuse

AI creates singletons with `DontDestroyOnLoad` everywhere. This causes duplicate objects on scene reload and tangled dependencies.

```csharp
// BAD - naive singleton (duplicates on scene reload)
void Awake() { DontDestroyOnLoad(gameObject); }

// GOOD - use a DI container (VContainer) with project-lifetime scope
// Or if you must use a singleton, guard against duplicates:
void Awake() {
    if (Instance != null) { Destroy(gameObject); return; }
    Instance = this;
    DontDestroyOnLoad(gameObject);
}
```

### 7. Async/await misuse

Unity's threading model is single-threaded. `Task.Run` or `ConfigureAwait(false)` will crash.

```csharp
// BAD - escapes main thread (UnityEngine API calls will throw)
await Task.Run(() => transform.position = Vector3.zero);

// GOOD - Unity 6 Awaitable (stays on main thread by default)
await Awaitable.WaitForSecondsAsync(1f);
transform.position = Vector3.zero;

// GOOD - UniTask (zero-alloc, cancellation, main-thread aware)
await UniTask.Delay(1000, cancellationToken: destroyCancellationToken);
```

### 8. Serialization gotchas

AI forgets that Unity serializes fields, not properties, and only specific types.

```csharp
// BAD - won't serialize (property, not field)
public float Speed { get; set; } = 5f;

// BAD - won't serialize (private without attribute)
private float speed = 5f;

// GOOD - serialized and visible in Inspector
[SerializeField] private float _speed = 5f;

// GOOD - public field (serialized by default, but less encapsulated)
public float speed = 5f;
```

---

## What AI Gets Right

AI is genuinely useful for these Unity tasks -- leverage these strengths:

- **Boilerplate MonoBehaviours** -- simple components with Awake/Start/Update lifecycle
- **Editor scripts and custom inspectors** -- `CustomEditor`, `PropertyDrawer`, `EditorWindow`
- **Shader code** -- HLSL/ShaderLab syntax, especially standard surface shaders
- **Math utilities** -- Vector3 operations, Quaternion.Lerp, raycasting logic
- **Data classes and ScriptableObjects** -- plain data containers, config assets
- **Gizmo drawing** -- `OnDrawGizmos`, `OnDrawGizmosSelected` debug visualization
- **Regex and string parsing** -- non-Unity-specific logic that happens to run in Unity

---

## Key Decisions

### ScriptableObjects

**Decision:** Use for shared configuration and static game data. Do not use as runtime state containers.
**Why:** ScriptableObjects persist across play sessions in the editor (values don't reset on Stop). AI tends to over-use them as service locators or event buses. They work well for weapon stats, level configs, and color palettes. They break when used for mutable runtime state that needs reset.
**Alternatives:** Plain C# classes for runtime state. DI-managed services for shared logic.

### Dependency Injection

**Decision:** VContainer for new projects.
**Why:** 5-10x faster than Zenject, zero GC allocation on resolve, actively maintained. Allows pure C# entry points separate from MonoBehaviour. Zenject/Extenject is still common in existing projects but development has stalled.
**Alternatives:** Zenject (Extenject fork) for existing projects. Manual service locator for tiny prototypes. Reflex is even faster but has a smaller community.

### ECS/DOTS vs MonoBehaviour

**Decision:** Default to MonoBehaviour. Use DOTS only for known performance bottlenecks (1000+ similar entities).
**Why:** DOTS has a completely different programming model (no MonoBehaviour, no GameObjects). AI models generate poor DOTS code because training data is sparse. Use DOTS for simulation-heavy systems (crowds, bullets, particles). Keep gameplay logic, UI, and player controllers as MonoBehaviour.
**Alternatives:** Hybrid approach -- MonoBehaviour for gameplay, DOTS subsystems for hot paths.

### UI System

**Decision:** UI Toolkit for menus, settings, and data-heavy UI. UGUI for world-space and animated game HUDs.
**Why:** UI Toolkit uses USS/UXML (CSS/HTML-like), scales well, and has better performance for complex layouts. UGUI is still superior for world-space canvases, particle integration, and heavily animated elements. AI defaults to UGUI because training data is older.
**Alternatives:** Hybrid is common -- UI Toolkit for editor tools and menus, UGUI for in-game elements.

---

## Unity-Specific C# Constraints

Things that differ from standard C# and trip up AI agents:

| Constraint | Detail |
|---|---|
| **C# 9.0 only** | No global usings, no file-scoped namespaces (use `namespace X { }`), no raw string literals, no required members |
| **No top-level statements** | Entry point is Unity engine, not `Main()` |
| **No async Main** | Use `Awaitable`, UniTask, or coroutines instead |
| **Single-threaded API** | All `UnityEngine` calls must be on the main thread |
| **No `Task.Run` for Unity work** | Use `Awaitable.BackgroundThreadAsync()` then return to main thread |
| **Serialization rules** | Only fields (not properties), only Unity-serializable types, `[SerializeField]` for private |
| **No constructors on MonoBehaviour** | Use `Awake()` or `[Inject]` methods instead |
| **`Awake` vs `Start` vs `OnEnable`** | `Awake` = object init (once), `OnEnable` = each activation, `Start` = first frame after enable |
| **Nullable reference types** | Not supported in Unity's compiler configuration; avoid `#nullable enable` |
| **Struct limitations** | Unity serializes structs but cannot serialize nested struct references |

---

## Testing in Unity

### What's testable

| Test Type | Runner | Use For |
|---|---|---|
| **EditMode** | Runs in editor, no scene | Pure C# logic, ScriptableObject data, utility functions, math |
| **PlayMode** | Runs in play mode with scenes | MonoBehaviour lifecycle, physics, coroutines, integration |

### Assembly setup

Tests require their own `.asmdef` files referencing the code under test:

```
Tests/
  EditMode/
    MyGame.Tests.EditMode.asmdef   # platforms: Editor only
  PlayMode/
    MyGame.Tests.PlayMode.asmdef   # platforms: (empty = all)
```

### What AI gets wrong in tests

- Generates `[Test]` (NUnit) but forgets `[UnityTest]` for coroutine-based PlayMode tests
- Uses `Assert.AreEqual` when `Assert.That(x, Is.EqualTo(y).Within(0.01f))` is needed for floats
- Tries to use xUnit or MSTest -- Unity only supports NUnit
- Creates PlayMode tests for logic that could be EditMode (slower CI for no reason)

```csharp
// EditMode test - fast, no scene needed
[Test]
public void Damage_ReducesHealth() {
    var health = new HealthSystem(100);
    health.TakeDamage(30);
    Assert.AreEqual(70, health.CurrentHealth);
}

// PlayMode test - needs scene/lifecycle
[UnityTest]
public IEnumerator Player_FallsWithGravity() {
    var player = new GameObject().AddComponent<Rigidbody>();
    float startY = player.transform.position.y;
    yield return new WaitForSeconds(1f);
    Assert.Less(player.transform.position.y, startY);
}
```

---

## Project Structure

```
MyGame/
  Assets/
    _Project/                        # all project-specific code
      Runtime/
        MyGame.Runtime.asmdef
        Core/                        # interfaces, data, no Unity deps where possible
        Features/
          Player/
          Combat/
          Inventory/
        Infrastructure/              # save system, networking, platform
      Editor/
        MyGame.Editor.asmdef         # references Runtime asmdef
        CustomInspectors/
      Tests/
        EditMode/
          MyGame.Tests.EditMode.asmdef
        PlayMode/
          MyGame.Tests.PlayMode.asmdef
      ScriptableObjects/             # asset instances (.asset files)
      Prefabs/
      Scenes/
      Art/
      Audio/
    Settings/                        # Input Actions, render pipeline, etc.
  Packages/
    manifest.json
    com.mygame.framework/            # reusable code as local UPM package
      Runtime/
        com.mygame.framework.asmdef
      Editor/
        com.mygame.framework.Editor.asmdef
      package.json
```

### Assembly Definition rules

- One `.asmdef` per boundary (Runtime, Editor, Tests)
- Editor code references Runtime, never the reverse
- Test asmdefs enable "Test Assemblies" toggle and reference code under test
- Use `autoReferenced: false` for framework packages to enforce explicit dependencies
- Keep third-party assets in `Assets/ThirdParty/` outside your asmdef boundaries

### UPM packages for framework code

Reusable code (utilities, base classes, extension methods) belongs in a local UPM package under `Packages/`. This enforces clean API boundaries via `.asmdef` and makes the code portable across projects.

---

## Prompting Tips for Unity

When asking AI to generate Unity code, include these in your prompt:

1. **Specify Unity version** -- "Unity 6 (6000.x)" or "Unity 2022 LTS" to avoid deprecated APIs
2. **Specify Input System** -- "Use the new Input System package, not UnityEngine.Input"
3. **Specify UI system** -- "Use UI Toolkit" or "Use UGUI" explicitly
4. **State the lifecycle method** -- "Put physics in FixedUpdate, input in Update"
5. **Request `[SerializeField]`** -- "Use serialized private fields, not public fields"
6. **Mention async approach** -- "Use UniTask" or "Use Awaitable" to avoid `Task.Run`
7. **Specify 2D vs 3D** -- AI confuses `Rigidbody` vs `Rigidbody2D`, `Collider` vs `Collider2D`
8. **Ask for asmdef-compatible code** -- "No circular dependencies, editor code in Editor asmdef"
9. **Provide MCP context** -- Unity MCP bridges (mcp-unity, unity-mcp) let AI agents inspect your scene, assets, and project settings directly
