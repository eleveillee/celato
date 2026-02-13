# Codex Patterns

## Quality Assurance (qa.md)

**Pattern:** Track feature health separately from implementation status.

**Why:** "Code deployed" ≠ "Feature works". QA tracking prevents premature victory declarations.

**Files:**
- `spec/tracking/qa.md` - Health dashboard
- `spec/tracking/bugs.md` - Repair queue

**States:**
- 🟢 Confirmed Working - Manually verified with proof
- 🟡 Partial / Degraded - Works but has known issues
- 🔴 Known Broken - Unusable
- ⚪ Needs Verification - Code done, testing pending

**Example Success Condition:**
```
Feature: User Authentication
Success Condition: User can sign up with email, receive verification email,
click link, and log in. Session persists across browser restarts.
Verified: 2026-02-12
Proof: test-user@example.com successfully completed flow
```

**Adopted from:** Shabti (2026-02-12)
