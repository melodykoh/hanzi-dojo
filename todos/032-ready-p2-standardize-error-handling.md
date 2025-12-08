---
status: ready
priority: p2
issue_id: "032"
tags: [code-review, architecture, error-handling, pr-24]
dependencies: []
---

# P2: Standardize Error Handling Pattern

## Problem Statement

Three different error patterns coexist in the codebase:
1. `PronunciationValidationError` class (defined but never thrown)
2. `logValidationError()` function (logs to console in dev)
3. Standard `console.error()` (used elsewhere)

This inconsistency makes error handling unpredictable and debugging difficult.

**Why it matters:** Code quality and debugging. Without a consistent pattern, developers don't know when to throw vs log, and error tracking tools can't aggregate issues.

## Findings

**Current Patterns:**

```typescript
// Pattern 1: Custom error class (NEVER USED)
// src/lib/errors.ts
export class PronunciationValidationError extends Error { ... }

// Pattern 2: Dev-only logging (CURRENT APPROACH)
// src/lib/errors.ts
export function logValidationError(...) {
  if (import.meta.env.DEV) {
    console.error(...)
  }
}

// Pattern 3: Standard console (OTHER SERVICES)
// src/lib/dictionaryClient.ts:42
console.error('[Dictionary] RPC error:', error)
```

**Problems:**
1. `PronunciationValidationError` defined but never thrown (dead code)
2. No user-facing error messages when validation fails
3. Production errors are silent (dev-only logging)
4. Inconsistent error surfacing across services

**Agents:** architecture-strategist, pattern-recognition-specialist

## Proposed Solutions

### Option 1: Log and continue (Current, with cleanup)
**Pros:** Resilient, doesn't break on partial data corruption
**Cons:** Silent failures may mask issues
**Effort:** Small (remove unused error class)
**Risk:** Low

Keep current logging approach, delete unused `PronunciationValidationError` class.

### Option 2: Throw at validation boundary (Recommended for critical paths)
**Pros:** Fail-fast, errors visible in production monitoring
**Cons:** May break if data is corrupted
**Effort:** Medium (add try/catch, error boundaries)
**Risk:** Medium

```typescript
// At validation boundary
if (!validatePronunciation(data)) {
  throw new PronunciationValidationError(
    entryId, 'primary', data, 'Malformed syllable structure'
  )
}

// At component boundary (React error boundary)
try {
  const queue = await fetchPracticeQueue(kidId, drill)
} catch (error) {
  if (error instanceof PronunciationValidationError) {
    showErrorToast('We found an issue with this character')
    logToSentry(error) // Production tracking
  }
}
```

### Option 3: Hybrid approach
**Pros:** Best of both worlds
**Cons:** More complex
**Effort:** Medium-Large
**Risk:** Medium

- Log and continue for non-critical validation
- Throw for critical paths (e.g., migration verification)

## Recommended Action

Use Option 1: Keep log-and-continue approach for resilience. Remove unused `PronunciationValidationError` class. Document the pattern in CLAUDE.md.

## Technical Details

**Affected Files:**
- `src/lib/errors.ts` (standardize or remove)
- `src/lib/practiceQueueService.ts` (update error handling)
- `src/lib/dictionaryClient.ts` (align with pattern)
- React components (add error boundaries if throwing)

**Components Affected:**
- All services using validation
- React components consuming services

## Acceptance Criteria

- [ ] Single documented error handling pattern
- [ ] Dead code removed (unused error class if not throwing)
- [ ] ADR created documenting the decision
- [ ] All services follow the same pattern

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | pattern-recognition-specialist identified inconsistency |
| 2025-12-07 | **Approved for work** | Triage approved - P2 important, defer to post-merge cleanup |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Todo #027: Structured error types (related)
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
