# Quality Assurance Status

> **Philosophy**: Output (Code) ≠ Outcome (Working Feature).
> We only mark features "Green" when we have verified the *Success Condition*.

## 🟢 Confirmed Working
*Features manually tested and verified against specific success conditions.*

| Feature | Verified Date | Success Condition / Proof |
|---------|---------------|---------------------------|
| *None yet* | - | - |

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
| *None currently tracked* | - | - |

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
