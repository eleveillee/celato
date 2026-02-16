# VS-002-MVP: Mobile Native Apps

## Status: ⬚ Not Started

## Philosophy

VS-2 extends Celato to native mobile platforms (iOS + Android). The web prototype (VS-1) validated the whisper interaction works. Now we make it truly mobile: audio whisper, VoIP integration, offline resilience, hands-free operation.

**Key principle:** Reuse VS-1 architecture. Same API orchestrator, same Retell integration, same whisper loop. Only the frontend changes (React Native instead of Next.js).

---

## Goal

Native iOS and Android apps with audio whisper support, enabling hands-free operation and offline resilience.

---

## Success Criteria

VS-002 is DONE when:

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | iOS app launches via Expo Go | Scan QR code → app displays call UI |
| 2 | Android app launches via Expo Go | Same as iOS |
| 3 | Audio whisper works | Hold "Whisper" button → speak → transcribed → agent responds naturally |
| 4 | Voice commands work | "Hey Celato, hang up" → call ends |
| 5 | Offline queue works | Disconnect WiFi → whisper → reconnect → whisper sent automatically |
| 6 | VoIP integration works (iOS) | CallKit shows incoming/outgoing calls, background audio |
| 7 | VoIP integration works (Android) | ConnectionService shows calls, background audio |
| 8 | Push notifications work | App backgrounded → call status change → notification appears |
| 9 | Same cost tracking as VS-1 | Real-time cost display during active call |
| 10 | Same transcript export as VS-1 | "Copy" button → full conversation in clipboard |
| 11 | EAS Build succeeds | `eas build --platform all` → installable iOS + Android binaries |
| 12 | App Store-ready build | App passes TestFlight review (iOS), internal testing (Android) |

**Test scenario:**
```
1. Launch app on iPhone
2. Set persona to "Transparent mode"
3. Call local business (e.g., restaurant)
4. Agent: "Hello, I'm an AI assistant calling on behalf of Eric..."
5. Business: Responds
6. Hold "Whisper" button, speak: "Ask if they deliver to ZIP 12345"
7. Agent: "Do you deliver to ZIP code 12345?" (natural phrasing)
8. Background app mid-call → call continues, notification shows status
9. Hang up → transcript copied to clipboard
10. Verify: Full audio whisper flow worked, <2s latency
```

---

## Key Differences from VS-1

| Feature | VS-1 (Web) | VS-2 (Mobile) |
|---------|-----------|---------------|
| **Whisper Input** | Text (keyboard/spacebar) | Audio (microphone → Deepgram) |
| **UI Framework** | Next.js (React for web) | Expo (React Native) |
| **Audio API** | Web Audio API | `expo-audio` + native VoIP |
| **Deployment** | Vercel (static/serverless) | EAS Build → App Store + Play Store |
| **Voice Commands** | ❌ Not available | ✅ "Hey Celato, hang up" |
| **Offline Queue** | ❌ Assumed online | ✅ Queue whispers, sync on reconnect |
| **Background Audio** | ❌ Tab must stay open | ✅ CallKit (iOS), ConnectionService (Android) |
| **Push Notifications** | ❌ Not applicable | ✅ VoIP push for call status |

---

## Features

### F-013-EXP: Expo React Native Setup
Expo monorepo package for iOS + Android apps.

**What's new:**
- `packages/mobile` — React Native app (reuses `packages/shared`)
- Expo SDK 52, React Native 0.76
- EAS Build configuration
- App icons, splash screens

### F-014-MUI: Mobile UI
React Native UI for call control and transcript display.

**What's new:**
- Director UI (three-panel layout: Business, Agent, User controls)
- Touch-optimized buttons (larger tap targets than web)
- Native navigation (React Navigation)
- Platform-specific UI (iOS Human Interface Guidelines, Material Design)

**Reuses from VS-1:**
- Same WebSocket protocol
- Same conversation state management
- Same cost tracking logic

### F-015-AUD: Audio Whisper
Microphone → Deepgram transcription → API → LLM transformation.

**What's new:**
- `expo-audio` for recording
- Send audio to API orchestrator (not Retell!)
- API calls Deepgram API for transcription
- Transcribed text processed like VS-1 text whispers

**Flow:**
```
1. User holds "Whisper" button
2. App starts recording (expo-audio)
3. User speaks: "Tell them I'm running late"
4. User releases button → recording stops
5. App → API: { type: "whisper", audioData: ArrayBuffer }
6. API → Deepgram: transcribe audio
7. Deepgram → API: "Tell them I'm running late"
8. API: Stores in conversation context (same as VS-1)
9. LLM transforms → agent speaks naturally
✅ Business never heard the audio whisper
```

### F-016-VCP: Voice Command Parser
"Hey Celato, hang up" → app executes command.

**What's new:**
- Wake word detection (optional: "Hey Celato" or always-listening)
- Command recognition: `hangUp`, `whisperMode`, `pause`, `resume`
- Integrates with InputInterface (enables future AR glasses, CarPlay)

**Commands:**
- "Hey Celato, hang up" → ends call
- "Hey Celato, whisper mode" → activates whisper (hands-free)
- "Hey Celato, pause" → mutes agent
- "Celato, resume" → unmutes agent

**Implementation:** Simple keyword matching (VS-2), more sophisticated NLP later (VS-3+).

### F-017-OFQ: Offline Whisper Queue
Queue whispers when offline, auto-sync when connection restored.

**What's new:**
- `@react-native-community/netinfo` for connection monitoring
- `AsyncStorage` for persistent queue
- Background sync when connection restored

**Platforms:**
- **Mobile:** ✅ Background sync (app can sync when backgrounded)
- **Web:** ✅ Queue while tab open (implemented via same `NetworkInterface`)

**Why critical:** Mobile connectivity is unreliable (tunnels, poor signal, airplane mode transitions). Queueing prevents lost whispers.

### F-018-VIP: VoIP Integration
Native phone call integration (CallKit, ConnectionService).

**iOS (CallKit):**
- Incoming call screen (iOS native UI)
- "Celato calling..." with contact photo
- Background audio (call continues when app backgrounded)
- Lock screen controls

**Android (ConnectionService):**
- Incoming call screen (Android native UI)
- "Celato calling..." notification
- Background audio
- Notification controls

**Why:** Makes Celato feel like a native phone app, not just an app that happens to make calls.

### F-019-PSH: Push Notifications
VoIP push notifications for call status changes.

**iOS:** APNs (Apple Push Notification service) with VoIP push
**Android:** FCM (Firebase Cloud Messaging) with high-priority delivery

**Use cases:**
- Call started while app backgrounded → wake app
- Call ended → notify user
- Whisper queued → show "Offline, whisper will send when online"

### F-020-PLT: Platform Interface Implementations
Implement mobile versions of all 6 platform abstraction interfaces.

**What's new:**
- `MobileAudioInterface` (implements `AudioInterface`)
- `MobileInputInterface` (implements `InputInterface`)
- `MobileNotificationInterface` (implements `NotificationInterface`)
- `MobileStorageInterface` (implements `StorageInterface`)
- `MobileNetworkInterface` (implements `NetworkInterface`)
- `MobileWebSocketClient` (implements `WebSocketInterface`)

**Validates:** Interface design works for 2+ platforms (web + mobile).

---

## System Design (Light)

### Mobile-Specific Architecture

**Audio Whisper Flow:**
```
User speaks whisper
    ↓
expo-audio records (Opus codec)
    ↓
Send to API orchestrator (WebSocket, binary frame)
    ↓
API → Deepgram API (transcription)
    ↓
Deepgram → API: "Tell them I'm running late" (text)
    ↓
[Same whisper loop as VS-1 from here]
```

**Why not transcribe on-device?**
- Deepgram API is more accurate than iOS/Android speech recognition
- Consistent with future platforms (AR glasses will also use server-side transcription)
- Enables centralized cost tracking

### Voice Command Parser Design

**Simple keyword matching (VS-2):**
```typescript
const COMMANDS = {
  hangUp: ['hang up', 'end call', 'goodbye'],
  whisperMode: ['whisper', 'whisper mode'],
  pause: ['pause', 'hold', 'wait'],
  resume: ['resume', 'continue', 'unpause']
};

function parseCommand(text: string): Command | null {
  const lowercased = text.toLowerCase();

  for (const [command, keywords] of Object.entries(COMMANDS)) {
    if (keywords.some(kw => lowercased.includes(kw))) {
      return command as Command;
    }
  }

  return null;
}
```

**Future (VS-3+):** Use LLM for intent recognition (more flexible, handles variations).

### Offline Queue Implementation

```typescript
// packages/shared/offline-queue.ts
export class WhisperQueue {
  constructor(
    private storage: StorageInterface,
    private network: NetworkInterface,
    private websocket: WebSocketInterface
  ) {
    // Auto-sync when connection restored
    network.onConnectionChange((quality) => {
      if (quality !== 'offline') {
        this.syncQueue();
      }
    });
  }

  async add(whisper: Whisper) {
    if (this.network.isOnline()) {
      // Send immediately
      await this.websocket.send(JSON.stringify(whisper));
    } else {
      // Queue for later
      const queue = await this.storage.get<Whisper[]>('whisper_queue') || [];
      queue.push(whisper);
      await this.storage.set('whisper_queue', queue);
    }
  }

  private async syncQueue() {
    const queue = await this.storage.get<Whisper[]>('whisper_queue') || [];
    if (queue.length === 0) return;

    for (const whisper of queue) {
      try {
        await this.websocket.send(JSON.stringify(whisper));
      } catch (error) {
        // Keep in queue if send fails
        return;
      }
    }

    // Clear queue after successful sync
    await this.storage.set('whisper_queue', []);
  }
}
```

---

## Deployment

### EAS Build (Expo Application Services)

**Build configuration:**
```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "buildType": "app-store",
        "bundleIdentifier": "com.celato.app"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

**Commands:**
- `eas build --platform ios` → iOS binary (submit to App Store)
- `eas build --platform android` → Android APK (submit to Play Store)
- `eas build --platform all` → Both platforms

### App Store Distribution

**iOS (App Store):**
1. EAS Build → `.ipa` file
2. Submit to TestFlight (Apple's beta testing)
3. Internal testing (up to 100 devices)
4. App Store review → public release

**Android (Play Store):**
1. EAS Build → `.apk` or `.aab` (Android App Bundle)
2. Upload to Play Console
3. Internal testing track
4. Play Store review → public release

---

## Blocking Decisions

| ID | Question | Recommendation | Status |
|----|----------|----------------|--------|
| D-007-DPG | Deepgram vs built-in speech recognition | Deepgram (more accurate, consistent with web) | ⬚ To be resolved in VS-2 Phase 1 |
| D-008-WKW | Wake word: "Hey Celato" or always-listening | Always-listening (simpler MVP, add wake word in VS-3+) | ⬚ To be resolved in VS-2 Phase 1 |
| D-009-BKG | Background audio strategy (iOS restrictions) | VoIP audio category (required for CallKit) | ⬚ To be resolved in VS-2 Phase 2 |

_Note: These decisions will be expanded in [decisions.md](../decisions.md) when VS-2 implementation begins._

---

## Transition Checklist

Before moving to VS-003:

- [ ] All features ✅ or explicitly deferred
- [ ] All blocking decisions resolved
- [ ] VS-2 tested on real iOS and Android devices
- [ ] EAS Build succeeds for both platforms
- [ ] Learnings documented (audio whisper latency, VoIP integration gotchas)
- [ ] Platform abstraction interfaces validated (2 platforms working proves design)
