# Learnings

Project-specific lessons learned. Unlike AI memory (which is per-user and per-tool),
this file is committed and shared, serving as institutional knowledge for the project.

---

## Technical Learnings

| ID | Severity | Date | Learning | Context | Related |
|----|----------|------|----------|---------|---------|
| L-001 | | | | | |

### Severity Levels
- 🔴 **Critical**: Will cause bugs/outages if ignored
- 🟡 **High**: Significant impact on correctness or performance
- 🟢 **Medium**: Good to know, prevents wasted time
- ⚪ **Low**: Nice-to-know, minor optimization

### Learning Detail Template

For important learnings, expand with bad/good patterns:

```markdown
### L-001: [One-line summary]
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
```

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
