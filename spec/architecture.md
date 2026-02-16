# Architecture Guide

This document describes Celato's technical architecture. For product vision and UX patterns, see `spec/celato/`.

## System Architecture

### High-Level System Diagram (Hybrid Architecture)

```
┌──────────────────────────────────────────────────────────────┐
│                     User Interfaces                           │
│                                                               │
│  ┌────────────────┐              ┌─────────────────────────┐ │
│  │  Web (VS-1)    │              │  Mobile (VS-2)          │ │
│  │  Next.js       │              │  Expo (React Native)    │ │
│  ├────────────────┤              ├─────────────────────────┤ │
│  │ Desktop browser│              │ iOS app (App Store)     │ │
│  │ Mobile browser │              │ Android app (Play Store)│ │
│  ├────────────────┤              ├─────────────────────────┤ │
│  │ Text whispers  │              │ Audio whispers          │ │
│  │ (keyboard)     │              │ (microphone → Deepgram) │ │
│  │ Web Audio API  │              │ expo-audio              │ │
│  └───────┬────────┘              └────────┬────────────────┘ │
└──────────┼─────────────────────────────────┼──────────────────┘
           │                                 │
           │ WebSocket (control + whisper)   │
           └────────────┬────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Orchestrator       │ ◄─── Session Management
              │  Fastify (Railway)  │      LLM Context Injection
              │                     │      Cost Tracking
              └──────┬──────────┬───┘
                     │          │
                     │          └──► OpenAI API (GPT-4o-mini)
                     │               Text-based LLM
                     │
                     │ WebSocket (TEXT-ONLY)
                     ▼
              ┌─────────────────────┐
              │  Retell AI          │ ◄─── Telephony + Audio
              │  Custom LLM Mode    │      - ASR (speech → text)
              │                     │      - TTS (text → speech)
              └──────┬──────────────┘      - VAD, turn-taking
                     │ PSTN / SIP
                     ▼
              ┌─────────────────────┐
              │  Business Phone     │ ◄─── Third Party
              └─────────────────────┘      Hears agent ONLY
```

**Architecture Strategy: Hybrid (Production-Ready)**
- **Web:** Next.js (optimal web performance, smaller bundles)
- **Mobile:** Expo (optimal native performance, VoIP integration)
- **Shared:** `packages/shared` (WebSocket client, API types, business logic)
- **Code Reuse:** ~40-50% (all business logic, platform-specific UI)

**Critical:** Retell AI's "Custom LLM" mode is **TEXT-BASED**. All audio processing (ASR/TTS) happens within Retell's platform. Our orchestrator receives text transcripts and sends text responses.

### The Three-Way Dynamic

**Participants:**
- **User (Director)** - controls via mobile app, whispers private instructions
- **Agent (Actor)** - AI that negotiates, follows user's direction
- **Business (Third Party)** - only hears the agent, not the whispers

**Audio Routing Modes:**

| Mode | User Audio | Agent Audio | Business Hears |
|------|------------|-------------|----------------|
| **Standard** | Muted | Active ↔ Business | Agent only |
| **Whisper** | Active → Agent | Active ↔ Business | Agent only (not user) |
| **Passthrough** | Active ↔ Business | Silent | User directly |

### The "Whisper Loop" Data Flow

**Goal:** User whispers instruction that business does NOT hear.

1. **State:** Call active. Agent talking to business.
2. **User presses "Whisper" button** on mobile app (or spacebar in VS-1 web UI).
3. **User input:**
   - **VS-1 (text):** Types whisper: *"Tell them I'm running 5 mins late"*
   - **VS-2+ (audio):** Speaks whisper → transcribed via Deepgram/Whisper API
4. **App → Orchestrator:** WebSocket message with whisper text (NOT sent to Retell)
5. **Orchestrator:**
   - Stores whisper in conversation context as system message:
     ```
     { role: "system", content: "[DIRECTOR INSTRUCTION: Tell them I'm running late]" }
     ```
   - **Business does NOT hear this** — it's context only
6. **Next turn:** Retell sends `response_required` (business stopped talking, agent should respond)
7. **Orchestrator → LLM (GPT-4o-mini):**
   - Sends conversation history + whisper instruction
   - LLM transforms whisper into natural agent speech:
     ```
     Input: "[DIRECTOR INSTRUCTION: Tell them I'm running late]"
     Output: "Apologies, I'm running about 5 minutes behind schedule."
     ```
8. **Orchestrator → Retell:** Text response (only the LLM output)
9. **Retell:** Synthesizes via TTS → plays to business
10. **Business hears:** Natural agent speech (NOT the raw whisper text)

**✅ Business never hears the whisper instruction, only the natural agent response.**

**Latency Budget:**
- User submits whisper: 50-100ms (network)
- LLM transformation (GPT-4o-mini): 200-400ms
- Retell TTS: 200-300ms
- **Total: 450-800ms** (well within 1-2 second constraint)

---

## Platform-Specific Implementation

### Comparison Matrix

| Feature | Web (Desktop Browser) | Web (Mobile Browser) | iOS Native | Android Native |
|---------|----------------------|---------------------|------------|----------------|
| **Framework** | Next.js 14 | Next.js 14 | Expo (React Native) | Expo (React Native) |
| **Deployment** | Vercel | Vercel | App Store | Play Store |
| **Whisper Input** | Text (keyboard) | Text (touch keyboard) | Audio (microphone) | Audio (microphone) |
| **Audio Transcription** | N/A | N/A | Deepgram (server-side) | Deepgram (server-side) |
| **Audio API** | Web Audio API | Web Audio API | expo-audio | expo-audio |
| **WebSocket** | Native browser | Native browser | react-native-ws | react-native-ws |
| **VoIP** | N/A (browser only) | N/A (browser only) | CallKit integration | ConnectionService |
| **Background Audio** | Limited (tab must stay open) | Limited (iOS Safari restrictions) | ✅ Full support | ✅ Full support |
| **Push Notifications** | N/A | N/A | APNs (VoIP push) | FCM (VoIP push) |
| **Bundle Size** | ~150-300 KB (gzipped) | ~150-300 KB (gzipped) | Native binary | Native binary |

### Shared Architecture (All Platforms)

**These components work identically across all platforms:**

| Component | Implementation | Location |
|-----------|---------------|----------|
| **WebSocket Protocol** | Same message types, same event flow | `packages/shared/api-client` |
| **API Contracts** | TypeScript types, Zod schemas | `packages/shared/types` |
| **Cost Tracking** | Same calculation logic | `packages/shared/utils/cost.ts` |
| **Transcript Formatting** | Same speaker labeling, timestamps | `packages/shared/utils/transcript.ts` |
| **Retell Integration** | Same text-based WebSocket protocol | API orchestrator (platform-agnostic) |

**Code Reuse Estimate:**
- Business logic: 100% shared
- UI components: 0% shared (platform-specific)
- **Total: ~40-50% code reuse**

### Platform-Specific Whisper Implementations

#### Web (VS-1)
```typescript
// packages/web/components/WhisperButton.tsx
function WhisperButton({ onWhisper }: Props) {
  const [isWhispering, setIsWhispering] = useState(false);
  const [whisperText, setWhisperText] = useState('');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !isWhispering) {
      setIsWhispering(true);
      // Show text input
    }
  };

  const handleSubmit = () => {
    // Send text whisper to API
    ws.send(JSON.stringify({
      type: 'whisper',
      text: whisperText,
      timestamp: Date.now()
    }));
  };
}
```

#### Mobile (VS-2)
```typescript
// packages/mobile/components/WhisperButton.tsx
import { Audio } from 'expo-av';

function WhisperButton({ onWhisper }: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // Send audio to API for transcription
    const formData = new FormData();
    formData.append('audio', { uri, type: 'audio/m4a', name: 'whisper.m4a' });

    ws.send(JSON.stringify({
      type: 'whisper',
      audioData: await readAudioFile(uri),
      timestamp: Date.now()
    }));
  };
}
```

**Key Difference:** Web sends text directly, mobile sends audio that gets transcribed server-side.

---

## Platform Abstraction Strategy

**Goal:** Enable future platform support (AR glasses, watches, voice assistants, desktop apps) without rewriting business logic.

**Approach:** Define abstract interfaces in VS-1/VS-2 that platform-specific code implements. Business logic in `packages/shared` works with interfaces, not concrete implementations.

### Core Abstraction Interfaces

#### 1. AudioInterface
**Purpose:** Platform-agnostic audio capture and playback.

```typescript
// packages/shared/interfaces/audio.ts
interface AudioInputInterface {
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioBuffer>;
  isRecording(): boolean;
}

interface AudioOutputInterface {
  play(buffer: AudioBuffer): Promise<void>;
  pause(): void;
  stop(): void;
  getVolume(): number;
  setVolume(level: number): void;
}
```

**Platform Implementations:**

| Platform | Audio Input | Audio Output |
|----------|------------|--------------|
| **Web** | Web Audio API (`navigator.mediaDevices.getUserMedia()`) | HTMLAudioElement |
| **iOS/Android** | `expo-audio` (Recording API) | `expo-audio` (Sound API) |
| **AR Glasses (Meta Ray-Ban)** | Frame microphone (Meta View SDK) | Bone conduction speakers |
| **AR Glasses (Vision Pro)** | AVAudioEngine (visionOS) | Spatial audio (AVFoundation) |
| **AR Glasses (Android XR)** | Android Audio APIs | ARCore audio positioning |
| **Apple Watch** | WatchKit audio recording | WKAudioFilePlayer |
| **Desktop (Electron)** | Node.js audio libs (node-mic) | Electron audio APIs |

**VS-1/VS-2 Action:** Define interface, implement web + mobile versions.

#### 2. InputInterface
**Purpose:** Platform-agnostic input methods (text, voice commands, gestures, hardware buttons).

```typescript
// packages/shared/interfaces/input.ts
interface InputInterface {
  onTextInput(callback: (text: string) => void): void;
  onVoiceCommand(callback: (command: string) => void): void;
  onGesture?(gesture: GestureType, callback: () => void): void;
  onHardwareButton?(button: string, callback: () => void): void;
}

enum GestureType {
  Tap = 'tap',
  DoubleTap = 'double_tap',
  SwipeLeft = 'swipe_left',
  SwipeRight = 'swipe_right',
  Pinch = 'pinch',
  HeadNod = 'head_nod',  // AR glasses
  HandGesture = 'hand_gesture'  // AR glasses
}
```

**Platform Implementations:**

| Platform | Primary Input | Secondary Input |
|----------|--------------|-----------------|
| **Web (Desktop)** | Keyboard (spacebar for whisper) | Mouse clicks |
| **Web (Mobile)** | Touch keyboard | Touch gestures |
| **iOS/Android** | Voice (microphone) | Touch gestures |
| **Meta Ray-Ban** | Frame tap (hardware button) | Voice commands |
| **Vision Pro** | Eye tracking + pinch gestures | Voice commands |
| **Android XR** | Hand gestures (ARCore) | Voice commands |
| **Apple Watch** | Digital Crown + tap | Raise-to-speak |
| **CarPlay/Android Auto** | Voice-only (hands-free) | Steering wheel buttons |
| **Voice Assistants** | Voice commands only | N/A |

**VS-2 Action:** Add voice command parser for hands-free operation (enables AR glasses, CarPlay, voice assistants).

#### 3. NotificationInterface
**Purpose:** Platform-agnostic user feedback (visual, audio, haptic).

```typescript
// packages/shared/interfaces/notification.ts
interface NotificationInterface {
  showVisual(message: string, type: 'info' | 'success' | 'error'): void;
  playSound(sound: SoundType): void;
  vibrate?(pattern: number[]): void;
  showOverlay?(content: React.ReactNode, position: OverlayPosition): void;
}

enum SoundType {
  WhisperReceived = 'whisper_received',
  CallConnected = 'call_connected',
  CallEnded = 'call_ended',
  Error = 'error'
}
```

**Platform Implementations:**

| Platform | Visual Feedback | Audio Feedback | Haptic Feedback |
|----------|----------------|----------------|-----------------|
| **Web** | Toast notifications | Audio element | N/A (web has limited haptics) |
| **iOS/Android** | Push notifications, in-app alerts | System sounds | Vibration API |
| **Meta Ray-Ban** | N/A (no screen) | Bone conduction audio cues | N/A |
| **Vision Pro** | Spatial UI overlays | Spatial audio | N/A |
| **Android XR** | AR overlay notifications | 3D positioned audio | Device vibration (if supported) |
| **Apple Watch** | Haptic tap patterns | Watch speaker | Taptic Engine |
| **Desktop** | OS notifications (Electron) | System sounds | N/A |

**VS-1 Action:** Implement basic visual (toast) and audio feedback for web.

#### 4. StorageInterface
**Purpose:** Platform-agnostic data persistence (call logs, transcripts, settings).

```typescript
// packages/shared/interfaces/storage.ts
interface StorageInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

**Platform Implementations:**

| Platform | Storage Backend | Sync Support |
|----------|----------------|--------------|
| **Web** | LocalStorage (small data), IndexedDB (transcripts) | N/A (browser-local) |
| **iOS** | AsyncStorage + iCloud (if enabled) | ✅ iCloud sync |
| **Android** | AsyncStorage + Google Drive (optional) | ✅ Google Drive sync |
| **Vision Pro** | AsyncStorage + iCloud | ✅ iCloud sync |
| **Android XR** | AsyncStorage + Google Drive | ✅ Google Drive sync |
| **Desktop** | Electron store (local files) | Manual export/import |
| **CLI** | JSON files (~/.celato/) | Git-based sync (user manages) |

**VS-1 Action:** Use LocalStorage for web, plan for AsyncStorage in VS-2.

#### 5. NetworkInterface
**Purpose:** Connection quality monitoring, offline resilience.

```typescript
// packages/shared/interfaces/network.ts
interface NetworkInterface {
  isOnline(): boolean;
  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline';
  onConnectionChange(callback: (quality: string) => void): void;
}
```

**Platform Implementations:**

| Platform | Detection Method | Offline Handling |
|----------|-----------------|------------------|
| **Web** | `navigator.onLine` + ping API | Queue whispers, retry on reconnect |
| **iOS/Android** | `@react-native-community/netinfo` | Queue whispers, background sync |
| **AR Glasses** | Device network APIs (often spotty) | **Critical:** Queue whispers aggressively |
| **Apple Watch** | WatchKit network monitor (often offline) | **Critical:** Queue whispers, sync when phone nearby |
| **CarPlay** | iOS device connection (usually stable) | Queue whispers during tunnel/dead zones |

**VS-2 Action:** Implement whisper queue for offline resilience (critical for AR glasses and watches).

#### 6. WebSocketInterface
**Purpose:** Platform-agnostic WebSocket client with reconnection logic.

```typescript
// packages/shared/interfaces/websocket.ts
interface WebSocketInterface {
  connect(url: string): Promise<void>;
  disconnect(): void;
  send(message: string | ArrayBuffer): void;
  onMessage(callback: (message: string) => void): void;
  onConnectionChange(callback: (connected: boolean) => void): void;
  isConnected(): boolean;
}
```

**Platform Implementations:**

| Platform | Implementation | Reconnection Strategy |
|----------|---------------|----------------------|
| **Web** | Native WebSocket API | Exponential backoff |
| **iOS/Android** | `react-native-ws` or native WebSocket | Exponential backoff + background retry |
| **AR Glasses** | Platform native WebSocket | Aggressive reconnection (spotty networks) |
| **Desktop** | Electron WebSocket (Node.js) | Standard retry |
| **CLI** | `ws` npm package | Manual retry |

**VS-1 Action:** Implement WebSocket client in `packages/shared/api-client` with reconnection logic.

---

### Future Platform Readiness Checklist

**VS-1/VS-2 Actions to Support Future Platforms:**

| Action | VS | Why It Matters |
|--------|----|--------------:|
| **Define AudioInterface** | VS-1 | Enables AR glasses (audio-only like Meta Ray-Ban) |
| **Define InputInterface** | VS-1 | Enables voice assistants, CarPlay (voice-first) |
| **Voice Command Parser** | VS-2 | Enables hands-free operation (AR, watches, CarPlay) |
| **Offline Whisper Queue** | VS-2 | Critical for AR glasses/watches (spotty connectivity) |
| **Test UI at 200px width** | VS-2+ | Ensures AR overlay/watch UI works |
| **Headless API Client** | VS-2 | Enables CLI, voice assistants (no UI platforms) |
| **Responsive Layout** | VS-1 | Mobile browsers → easy adapt to small AR displays |

**What NOT to do (over-engineering):**
- ❌ Don't implement AR glasses support now
- ❌ Don't build platform-specific UIs before they're needed
- ❌ Don't add abstraction layers that have only one implementation

**What TO do (smart planning):**
- ✅ Define interfaces that reflect actual platform differences
- ✅ Implement web + mobile versions (validates interface design)
- ✅ Extract business logic to `packages/shared` (works with interfaces)
- ✅ Test edge cases (offline, poor network) that future platforms will face

---

### AR Glasses Technical Notes

**Why AR glasses are compelling for Celato:**
- Hands-free operation (no phone in hand during conversation)
- Always-available whisper (quick tap or voice command)
- Spatial transcript overlay (see conversation in real-time)
- Natural use case: walking into a business, AR shows transcript while you talk

**Platform-Specific Details:**

#### Xreal Air (formerly Nreal Air) — **RECOMMENDED FIRST AR PLATFORM** ⭐
- **Platform Status:** ✅ **OPEN** (Public SDK, standard Android dev)
- **Hardware:** 1080p micro-OLED displays, 3DOF/6DOF tracking, USB-C/wireless connection
- **SDK:** Xreal SDK (Android) - works as external display + spatial computing features
- **Deployment:** Standard Android app on Play Store (detects Xreal glasses when connected)
- **UI:** Extends phone screen as floating AR windows (like external monitor with spatial anchors)
- **Whisper Input:** Voice command or phone tap (app runs on phone, not glasses)
- **Agent Output:** Spatial audio positioned in 3D space
- **Business Interaction:** User speaks directly, spatial transcript overlay shows conversation
- **Development Effort:** Low (extends VS-2 Android app with Xreal SDK)
- **Price:** ~$400 (consumer accessible)
- **Feasibility:** **High** (open SDK, standard Android development, extends existing mobile app)

**Why Xreal Air is the best first AR platform:**
- ✅ Open SDK (no partnership required)
- ✅ Extends existing Android app (minimal additional work)
- ✅ Consumer-priced hardware ($400 vs $3500 for Vision Pro)
- ✅ Works as display for any phone (broad compatibility)
- ✅ Proven developer ecosystem (Xreal has active developer community)

#### Apple Vision Pro (Spatial AR)
- **Platform Status:** ✅ **OPEN** (visionOS SDK, App Store distribution)
- **Hardware:** Eye tracking, hand gestures, spatial audio, outward-facing cameras
- **SDK:** visionOS SDK (SwiftUI + RealityKit)
- **Deployment:** App Store (standard Apple review process)
- **UI:** Spatial windows (floating transcript panel with eye+hand interaction)
- **Whisper Input:** Eye gaze + pinch gesture → voice whisper
- **Agent Output:** Spatial audio positioned in 3D space
- **Business Interaction:** User speaks directly, transcript overlay shows conversation
- **Development Effort:** High (requires new Swift/visionOS codebase, similar to iOS app)
- **Price:** ~$3500 (early adopter market)
- **Feasibility:** **High** (well-documented, iOS-like development, but requires new codebase)

#### Android XR (Samsung Moohan, Google XR)
- **Platform Status:** 🟡 **EMERGING** (SDK announced Dec 2024, devices shipping 2025-2026)
- **Hardware:** Hand tracking, 6DOF controllers, cameras, spatial audio
- **SDK:** Android XR SDK (Jetpack Compose + ARCore extensions)
- **Deployment:** Play Store (once devices available)
- **UI:** AR overlay (transparent transcript window)
- **Whisper Input:** Hand gesture (pinch) → voice whisper
- **Agent Output:** 3D positioned audio
- **Business Interaction:** User speaks directly, AR shows transcript
- **Development Effort:** Medium (extends VS-2 Android app, similar to Xreal Air)
- **Feasibility:** **High once mature** (Android-like development, but blocked by hardware availability)

#### Meta Ray-Ban Stories / Meta View
- **Platform Status:** ❌ **CLOSED** (No public SDK, proprietary Meta View app)
- **Hardware:** Bone conduction speakers, frame microphone, tap sensor, cameras
- **SDK:** Not available to third-party developers
- **Deployment:** Not possible without Meta business partnership
- **Reality Check:** Meta does not provide SDK access for Ray-Ban glasses. All functionality is controlled through Meta's proprietary companion app.
- **Feasibility:** **Low** (requires Meta partnership or platform policy change)
- **Monitor for:** Future platform opening announcements

**Common Requirements Across Open AR Platforms:**
- Voice command support (hands-free)
- Offline whisper queue (AR glasses often have poor connectivity)
- Small UI footprint (test at 200px width for overlay compatibility)
- Spatial audio positioning (agent voice positioned in 3D space)

**Updated Recommendation:** Xreal Air is the easiest first AR platform (open SDK, extends Android app, consumer pricing, proven developer ecosystem).

---

---

## Components

### 1. Frontend (Platform-Specific)

**Hybrid Architecture:** Separate codebases for web and mobile, shared business logic.

#### 1a. Web Frontend (VS-1)
**Stack:** Next.js 14 (React for web)

**Platforms:**
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)

**Whisper Input:**
- Text-based (keyboard/spacebar)
- No audio transcription needed

**Audio API:**
- Web Audio API (`navigator.mediaDevices.getUserMedia()`)
- For monitoring/playback only (business audio handled by Retell)

**Deployment:**
- Vercel (static export or serverless)
- CDN distribution for fast global load

**Responsibilities:**
- Phone number input, call initiation
- Real-time transcript display
- Text whisper input (spacebar interaction)
- Cost tracking display
- Persona mode selection

#### 1b. Mobile Frontend (VS-2)
**Stack:** Expo (React Native)

**Platforms:**
- iOS (App Store distribution)
- Android (Play Store distribution)

**Whisper Input:**
- Audio-based (microphone)
- Deepgram transcription (server-side)

**Audio API:**
- `expo-audio` (native mobile audio)
- VoIP integration (`react-native-voip-push-notification`)

**Deployment:**
- EAS Build (Expo Application Services)
- Binary distribution via app stores

**Responsibilities:**
- Same as web (phone input, transcript, cost display)
- **Plus:** Native VoIP, background audio, push notifications
- **Audio whisper:** Microphone → Deepgram → LLM transformation

### 2. Celato Orchestrator (Backend)
**Stack:** Node.js 22 (TypeScript) + Fastify

**Deployment:** Railway (persistent WebSocket support — Vercel doesn't support long-lived connections)

**Responsibilities:**
- **Session Management:** Linking user's web/mobile session to Retell call (via `call_id`)
- **WebSocket Routing:**
  - `/ws` — User app connection (control commands, whisper input, transcript output)
  - `/llm-websocket/:call_id` — Retell AI Custom LLM connection (text-only protocol)
- **Whisper Processing:**
  - Receives whisper text from user (hidden from business)
  - Stores in conversation context
  - Transforms via LLM into natural agent speech
  - Sends only LLM output to Retell (business hears this)
- **LLM Context Management:** System prompts (persona mode), conversation history, whisper injections
- **Cost Tracking:** Retell minutes + LLM token usage

### 3. Telephony & Audio (Retell AI)
**Stack:** Retell AI Custom LLM mode (text-based WebSocket)

**Why Retell AI:**
- Built-in ASR (Speech-to-Text via Deepgram/Whisper)
- Built-in TTS (Text-to-Speech via ElevenLabs/Azure)
- Built-in VAD (Voice Activity Detection)
- Interruption handling and turn-taking logic out of the box
- "Custom LLM" WebSocket allows us to control agent intelligence
- **Handles all audio processing** — we only work with text

**What Retell Does:**
1. Answers phone call (or makes outbound call)
2. Business speaks → Retell transcribes to text
3. Sends text to our orchestrator via WebSocket
4. Our orchestrator sends text response
5. Retell synthesizes to speech → plays to business

**What We Do:**
- Receive text transcripts from Retell
- Process with LLM (inject whispers, apply persona)
- Return text responses to Retell

**Alternative:** Twilio (raw audio streams, requires building ASR/TTS/VAD ourselves — much more complex)

### 4. Intelligence (Text-Based LLM)
**Primary Model:** GPT-4o-mini (text-based chat completion)

**Why GPT-4o-mini (not OpenAI Realtime API):**
- Retell Custom LLM is **text-only** — audio routing not possible
- GPT-4o-mini: $0.15/1M input, $0.60/1M output (cheaper than Realtime API $0.20/min)
- Fast text generation: 200-400ms typical latency
- Handles multi-turn context naturally
- Streaming support for low time-to-first-sentence

**Responsibilities:**
- Transform whisper instructions into natural agent speech
- Generate contextual responses based on conversation history
- Apply persona mode (transparent vs proxy)
- Handle edge cases (silence, interruptions, errors)

**Future Optimization:** Could use cheaper models (GPT-3.5-turbo, Llama) for simple confirmations

### 5. Database (Supabase)
**Schema:**
- **Users:** Auth & preferences
- **Contacts:** Saved business numbers with context (e.g., "Mario's Pizza - usually order pepperoni")
- **Calls:** Call logs, transcripts, cost tracking
- **Prompts:** Custom system prompts for different scenarios (Restaurant, Support, Emergency)

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
