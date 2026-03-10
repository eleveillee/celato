# Learnings

Project-specific lessons learned. Unlike AI memory (which is per-user and per-tool),
this file is committed and shared, serving as institutional knowledge for the project.

---

## Technical Learnings

| ID | Severity | Date | Learning | Context | Related |
|----|----------|------|----------|---------|---------|
| L-001-RWS | 🔴 Critical | 2026-03-10 | Retell auto-appends `/{call_id}` to Custom LLM WebSocket URL — do NOT include `{{call_id}}` in the dashboard URL | Web calls died after 6s with 404. Retell replaces `{{call_id}}` AND appends it, doubling the path. | B-001-DUP, F-005-RET |
| L-002-EPT | 🟢 Medium | 2026-03-10 | `exactOptionalPropertyTypes` causes `undefined` to be rejected in optional params — use explicit types instead of inferred return types that include `undefined` | Anthropic SDK `system` param rejected `string \| TextBlockParam[] \| undefined` because `exactOptionalPropertyTypes` treats optional and `undefined` differently. Fixed by returning `TextBlockParam[]` explicitly. | |
| L-003-NGA | 🟡 High | 2026-03-10 | ngrok free tier stores request data as base64 — use the ngrok inspect UI (localhost:4040) or decode manually to read URIs | Raw field in ngrok API responses is base64-encoded, not plaintext. Browser UI at localhost:4040 is easier for debugging. | |

### Severity Levels
- 🔴 **Critical**: Will cause bugs/outages if ignored
- 🟡 **High**: Significant impact on correctness or performance
- 🟢 **Medium**: Good to know, prevents wasted time
- ⚪ **Low**: Nice-to-know, minor optimization

### Learning Detail Template

For important learnings, expand with bad/good patterns:

```markdown
### L-###-TAG: [One-line summary]
**Severity:** 🔴 Critical
**Context:** How this was discovered.

**Bad pattern:**
\`\`\`ts
// What NOT to do
const data = cache.get(key); // stale after hot-reload
\`\`\`

**Good pattern:**
\`\`\`ts
// What TO do instead
const data = fetchFresh(key); // always current
\`\`\`

**Insight:** One-line takeaway for quick scanning.

_Example IDs: L-003-RUL (Rules gotcha), L-012-PRS (Prisma v7 issue)_
```

### L-001-RWS: Retell auto-appends call_id to Custom LLM WebSocket URL
**Severity:** 🔴 Critical
**Context:** Web calls connected via Retell Web SDK but died after ~6s. ngrok logs showed all requests hitting `/llm-websocket/call_xxx/call_xxx` (doubled) → 404. The Retell dashboard URL was set to `wss://host/llm-websocket/{{call_id}}`.

**Bad pattern:**
```
# Retell Dashboard → Custom LLM WebSocket URL
wss://host/llm-websocket/{{call_id}}
# Retell replaces template AND appends → /llm-websocket/call_xxx/call_xxx → 404
```

**Good pattern:**
```
# Retell Dashboard → Custom LLM WebSocket URL
wss://host/llm-websocket
# Retell appends call_id → /llm-websocket/call_xxx → matches route ✅
```

**Insight:** Retell's `{{call_id}}` template is for documentation/reference only. The SDK always appends `/{call_id}` to whatever base URL you provide. Including it in the URL doubles it.

---

## Process Learnings

| ID | Date | Learning | Context |
|----|------|----------|---------|
| | | | |

## What Worked Well

| Approach | Why It Worked | When to Reuse |
|----------|--------------|---------------|
| | | |

## What Didn't Work

| Approach | Why It Failed | What to Do Instead |
|----------|--------------|-------------------|
| | | |
