# P3-4: Fix Pre-existing Test Failures in practiceQueueService.test.ts

**Status:** Pending
**Priority:** P3 (Low)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

17 tests in `practiceQueueService.test.ts` are failing due to a type mismatch. Tests expect functions to return `number` but they now return `object` (e.g., `{ priority: number, reason: string }`).

This is a pre-existing issue, not introduced by PR #21.

## File Affected

- `src/lib/practiceQueueService.test.ts`

## Root Cause

The `calculatePriority` function signature was changed at some point to return an object instead of a number:

```typescript
// Old signature (what tests expect)
function calculatePriority(state: PracticeState | null): number

// Current signature
function calculatePriority(state: PracticeState | null): { priority: number, reason: string }
```

## Recommended Fix

Update all test assertions to use the new return type:

```typescript
// Before
expect(calculatePriority(state)).toBe(1000)

// After
expect(calculatePriority(state).priority).toBe(1000)
// Or
expect(calculatePriority(state)).toEqual({ priority: 1000, reason: 'Never practiced' })
```

## Acceptance Criteria

- [ ] Update all 17 failing test assertions
- [ ] Verify tests pass with `npm run test:run`
- [ ] Consider adding tests for the `reason` field
