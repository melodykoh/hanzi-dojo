# P2-4: Missing Input Validation Edge Case

**Status:** Pending
**Priority:** P2 (Medium)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

The defensive logic for malformed Migration 009 data assumes `row.simp` is always available. If undefined, it defaults to `charCount = 1`, which could incorrectly trigger the malformed data path.

## File Affected

- `src/lib/practiceQueueService.ts:126-136`

## Current Code

```typescript
const charCount = row.simp ? [...row.simp].length : 1
```

## Recommended Fix

Add explicit handling when `simp` is missing:

```typescript
if (!row.simp) {
  // Cannot determine character count - use standard validation path
  if (validatePronunciation(row.dictionary_zhuyin)) {
    collected.push(row.dictionary_zhuyin)
  }
} else {
  const charCount = [...row.simp].length
  // ... existing logic
}
```

## Acceptance Criteria

- [ ] Add explicit undefined/empty check for `row.simp`
- [ ] Fall back to standard validation when character count cannot be determined
- [ ] Add test case for undefined simp scenario
