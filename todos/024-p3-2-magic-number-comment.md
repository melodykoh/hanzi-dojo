# P3-2: Magic Number in Detection Logic - Add Comment

**Status:** Pending
**Priority:** P3 (Low)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

The condition `charCount === 1 && syllableCount > 1` uses implicit knowledge that single characters should have exactly one syllable in standard Mandarin.

## File Affected

- `src/lib/practiceQueueService.ts:128`

## Current Code

```typescript
if (charCount === 1 && syllableCount > 1) {
  // Malformed Migration 009 data: single character with multiple syllables merged
```

## Recommended Fix

Add explanatory comment:

```typescript
// HEURISTIC: In standard Mandarin, a single character (charCount === 1) maps to
// exactly one syllable. If we see multiple syllables, this indicates Migration 009
// incorrectly merged multiple pronunciations into the zhuyin array instead of
// storing them separately in zhuyin_variants.
if (charCount === 1 && syllableCount > 1) {
```

## Acceptance Criteria

- [ ] Add comment explaining the linguistic heuristic
- [ ] Reference Migration 009 as the source of the malformed data
