# Quality Assurance Status

> **Philosophy**: Output (Code) ≠ Outcome (Working Feature).
> We only mark features "Green" when we have verified the *Success Condition*.

## 🟢 Confirmed Working
*Features manually tested and verified against specific success conditions.*

| Feature | Verified Date | Success Condition / Proof |
|---------|---------------|---------------------------|
| Monorepo Setup | 2026-02-12 | pnpm install completes, all packages build without errors, 8 tests passing |
| TypeScript Compilation | 2026-02-12 | All packages (shared, api) build with strict mode, no errors |
| Test Suite | 2026-02-12 | Vitest runs successfully, 8/8 tests pass (6 in shared, 2 in API) |
| API Health Check | 2026-02-16 | `curl localhost:4000/health` returns `{"status":"ok","service":"celato-api","version":"0.1.0"}` |
| WebSocket Connection | 2026-02-16 | `wscat -c ws://localhost:4000/ws` connects successfully, server accepts messages |
| Message Exchange | 2026-02-16 | Client sends "test message" → Server responds `{"type":"ack","timestamp":...}` with Zod-validated structure |
| Zod Schema Validation | 2026-02-16 | Server validates outgoing ack messages via AckMessageSchema before sending |

## 🟡 Partial / Degraded
*Features that work but have known non-blocking issues.*

| Feature | Issue | Success Condition |
|---------|-------|-------------------|
| *None currently tracked* | - | - |

## 🔴 Known Broken
*Features currently unusable.*

| Feature | Issue | Success Condition |
|---------|-------|-------------------|
| *None currently tracked* | - | - |

## ⚪ Needs Verification
*Implemented but requires proof of success.*

| Feature | Condition | Context |
|---------|-----------|---------|
| Mobile App Launch | Scan Expo QR code, verify app displays without errors | Code complete, Expo web has Metro bundler issue (Hermes on web), native testing deferred to VS-1 |
| Mobile E2E WebSocket | Full mobile → API WebSocket flow via Expo Go | Core WebSocket verified via wscat; mobile UI testing optional for VS-0 |

---

## Guidelines

### When to Mark 🟢 Confirmed Working
- Feature has been **manually tested** (not just "code runs without errors")
- **Success condition is specific** (e.g., "User can log in with Google OAuth and session persists after refresh")
- **Proof exists** (screenshot, test log, or clear reproduction steps)

### When to Use 🟡 Partial / Degraded
- Feature works for primary use case but has known edge cases
- Non-critical bug that doesn't block usage
- Performance is degraded but acceptable

### When to Mark 🔴 Known Broken
- Feature is completely unusable
- Critical bug that blocks primary workflow
- Move to 🟢 only after fix is verified, not just deployed

### When to Use ⚪ Needs Verification
- Code is merged but hasn't been manually tested
- Feature works in dev but not tested in production-like environment
- Success condition is unclear or needs definition

---

## Success Condition Examples

### ❌ Vague (Don't do this)
| Feature | Success Condition |
|---------|-------------------|
| Login | Login works |
| API | Endpoint responds |
| Dashboard | Shows data |

**Problem:** These don't tell you what to test or when to consider it "working."

### ✅ Specific (Do this)
| Feature | Success Condition |
|---------|-------------------|
| User Authentication | User can sign up with email, receive verification email, click link, and log in. Session persists across browser restarts. Test user: test@example.com completed full flow on 2026-02-12. |
| Payment Processing | User can add credit card, complete test purchase ($1.00), receive confirmation email, and see transaction in dashboard. Stripe test mode successful with card 4242424242424242. |
| Real-time Notifications | User A sends message, User B receives notification within 2 seconds without refresh. WebSocket connection maintained for 5+ minutes. Tested with 2 concurrent users. |
| Data Export | User clicks "Export CSV", file downloads within 3 seconds, opens in Excel without errors, contains all 1,000 test records with correct headers. File size: 45KB. |

**Why these work:**
- **Observable outcomes**: "receive email", "see transaction", "downloads within 3 seconds"
- **Verification steps**: How to reproduce the test
- **Proof**: Test accounts, test data, file sizes, timing measurements
- **Edge cases considered**: "persists across browser restarts", "5+ minutes", "1,000 records"
