# Backlog

Ideas, future work, and nice-to-haves not yet assigned to a milestone.
When an item gets promoted to a milestone, move it there and create a feature spec if needed.

---

## Ideas

| ID | Priority | Idea | Notes | Added |
|----|----------|------|-------|-------|
| BL-001-LOC | 🟡 Medium | Local "Face-to-Face" Mode | In-person translation at restaurants, hotels (competitive with Google Translate but with agency) | 2026-02-12 |
| BL-002-ENT | 🟢 Low | Enterprise API | Let businesses use Celato agents for their own outbound calls (role reversal) | 2026-02-12 |
| BL-003-VOI | 🟡 Medium | Voice Clone | Let user train the agent to sound like them for more natural conversations | 2026-02-12 |
| BL-004-CTX | 🟡 Medium | Context Library | Pre-built conversation templates (Doctor Visit, Job Interview, Tech Support, etc.) | 2026-02-12 |
| BL-015-SPG | 🟢 Low | Speculative Response Generation | Pre-generate 2-3 likely responses in parallel while agent speaking. Use if conversation goes that direction (near-zero latency). Trade-off: 2-3x LLM cost, ~40-60% hit rate for simple confirmations. Best for Negotiator mode. | 2026-02-16 |

_Example IDs: BL-008-DRK (Dark mode), BL-015-SPG (SPeculative Generation)_

---

## Future Platforms

**Prerequisites:** Abstract audio interfaces (VS-1), voice commands (VS-2), offline queue (VS-2)

| ID | Priority | Platform | Use Case | Technical Notes | Added |
|----|----------|----------|----------|-----------------|-------|
| BL-005-XRL | 🟡 Medium | **AR Glasses: Xreal Air** (formerly Nreal) | Spatial transcript overlay, external display mode, 3DOF/6DOF tracking | **OPEN PLATFORM**: Xreal SDK (Android). Works as USB-C/wireless display extension. Extends VS-2 Android app with spatial features. ~$400 hardware. **Medium-High feasibility** (standard Android dev + Xreal SDK). | 2026-02-16 |
| BL-006-ARV | 🟡 Medium | **AR Glasses: Apple Vision Pro** | Spatial transcript overlay, hands-free whisper, eye+hand tracking, Siri integration | **OPEN PLATFORM**: visionOS SDK (Swift), App Store distribution. Requires new Swift/visionOS codebase (similar effort to iOS app). ~$3500 hardware. **High feasibility** (well-documented, iOS-like). | 2026-02-16 |
| BL-007-ARX | 🟢 Low | **AR Glasses: Android XR** (Samsung Moohan, Google XR) | AR transcript overlay, hands-free operation, Google Assistant | **EMERGING PLATFORM**: Android XR SDK announced Dec 2024, devices shipping 2025-2026. Jetpack Compose + ARCore extensions. Extends VS-2 Android app. **High feasibility once mature** (Android-like). Blocked by hardware availability. | 2026-02-16 |
| BL-008-RBN | 🟢 Low | **AR Glasses: Meta Ray-Ban** | Audio-only whisper (if platform opens) | **CLOSED PLATFORM**: No public SDK. Meta View app is proprietary. Would require Meta business partnership or platform opening. **Low feasibility** (not accessible to indie devs). Monitor for policy changes. | 2026-02-16 |
| BL-009-DSK | 🟡 Medium | **Desktop Apps** (Windows/macOS/Linux) | System tray, better mic access, desktop notifications | Electron (reuses Next.js web), Tauri (smaller bundles), or native (.NET/Swift). Low cost (wraps web UI). | 2026-02-16 |
| BL-010-EXT | 🟡 Medium | **Browser Extension** (Chrome/Firefox/Safari) | Quick dial from any page, right-click phone numbers | Manifest V3, reuses `packages/shared`. Popup UI = React components. Low cost. | 2026-02-16 |
| BL-011-CAR | 🟡 Medium | **CarPlay + Android Auto** | Voice-first calling while driving, hands-free whisper | Requires native apps (VS-2). Limited UI (voice-driven). High relevance for on-the-go use. Medium cost. | 2026-02-16 |
| BL-012-WCH | 🟢 Low | **Apple Watch + Wear OS** | Ultra-quick dial from wrist, voice whisper | Requires native apps (VS-2). Tiny screen (minimal UI). Battery concerns. Medium-high cost. | 2026-02-16 |
| BL-013-VOI | 🟢 Low | **Voice Assistants** (Alexa/Google/Siri) | "Alexa, ask Celato to call restaurant" | Platform-specific integrations. Privacy concern (hard to whisper on speaker). Medium cost. | 2026-02-16 |
| BL-014-CLI | 🟢 Low | **CLI** (Command-line interface) | Power users, testing, automation | Simple Node.js CLI wrapping `packages/shared/api-client`. Low cost (1-2 days). | 2026-02-16 |

## Someday / Maybe
Items with no timeline. Revisit periodically.

| ID | Idea | Notes | Added |
|----|------|-------|-------|
| | | | |
