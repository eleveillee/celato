# Review Rules

## Review Categorization
When reviewing code, milestones, or any work output, ALWAYS split findings into three categories:

### 🔴 Obvious Fixes (No Question Asked)
Issues that are clearly wrong and should be fixed immediately:
- Bugs, typos, syntax errors
- Security vulnerabilities
- Broken imports or references
- Failing tests
- Violations of established project conventions

### 🟡 Needs Attention (Requires Decision)
Issues that need the user's input or immediate thought:
- Architecture decisions with trade-offs
- Performance concerns that may affect UX
- Ambiguous requirements that could go either way
- Breaking changes that affect other parts of the system

### 🟢 Can Postpone (Nice to Have)
Improvements that are valid but not urgent:
- Code style preferences beyond conventions
- Minor optimizations
- Additional test coverage for edge cases
- Documentation improvements
- Refactoring opportunities

## Review Format
```markdown
## 🔴 Obvious Fixes
1. **[file:line]** Description of issue → fix applied / recommended fix

## 🟡 Needs Attention
1. **[file:line]** Description of concern
   - Option A: ...
   - Option B: ...
   - Recommended: ...

## 🟢 Can Postpone
1. **[file:line]** Description of improvement opportunity
```

## Code Review Checklist
- Does it follow the project's coding standards?
- Are there any security concerns?
- Is error handling appropriate (not excessive, not missing)?
- Are there tests for new/changed logic?
- Is the code modular and readable?
- Any unnecessary complexity or over-engineering?
