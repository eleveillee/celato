# Bugs

Known bugs with reproduction steps and status. Each bug has an ID for cross-referencing.

---

## Open Bugs

| ID | Severity | Bug | Repro Steps | Found | Related |
|----|----------|-----|-------------|-------|---------|
| B-001-DUP | 🔴 Critical | Retell Custom LLM WebSocket 404 — doubled call_id path | Start web call → Retell tries `/llm-websocket/call_xxx/call_xxx` → 404 → call dies after ~6s | 2026-03-10 | F-005-RET |

### B-001-DUP: Retell Custom LLM WebSocket doubled call_id path
**Severity:** 🔴 Critical
**Repro:** Start a web call via the Celato web UI. Call connects (Retell SDK `call_started` fires) but dies after ~6 seconds with `disconnection_reason: error_llm_websocket_open`.
**Expected:** Retell connects to `/llm-websocket/call_xxx` → WebSocket upgrade → agent responds.
**Actual:** Retell connects to `/llm-websocket/call_xxx/call_xxx` → 404 → call terminates.
**Root Cause:** Retell automatically appends `/{call_id}` to the Custom LLM WebSocket URL. The dashboard URL contained `{{call_id}}` as a template variable, which Retell ALSO replaces — resulting in the call_id appearing twice in the path.

**Fix:** Change Retell dashboard Custom LLM URL from:
`wss://<host>/llm-websocket/{{call_id}}` → `wss://<host>/llm-websocket`

**Success Condition — bug is FIXED when:**
1. ngrok logs show `GET /llm-websocket/call_xxx` with status 101 (WebSocket upgrade), not 404
2. API logs show "Retell WebSocket upgrade accepted" with correct call_id
3. Call stays connected beyond 6 seconds and agent responds to speech

### Severity Levels
- 🔴 **Critical**: Blocks usage, data loss, security vulnerability
- 🟡 **Major**: Significant functionality broken, workaround exists
- 🟢 **Minor**: Cosmetic, edge case, low impact

### Bug Detail Template

For non-trivial bugs, expand below the table:

```markdown
### B-###-TAG: [Short description]
**Severity:** 🔴 Critical / 🟡 Major / 🟢 Minor
**Repro:** Steps to reproduce.
**Expected:** What should happen.
**Actual:** What happens instead.
**Root Cause:** (fill after investigation)

**Success Condition — bug is FIXED when:**
1. [Observable outcome that proves the fix works]
2. [Edge case that must also pass]
3. [Regression test added and passing]

_Example IDs: B-003-LTO (Login TimeOut), B-012-CRS (CRaSh on startup)_
```

## Resolved Bugs

| ID | Bug | Root Cause | Fix | Resolved |
|----|-----|-----------|-----|----------|
| | | | | |
