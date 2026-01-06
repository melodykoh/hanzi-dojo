# P2-2: Type Safety - Use `unknown` Instead of `any`

**Status:** Pending
**Priority:** P2 (Medium)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

Validation functions use `any` type for parameters instead of `unknown`, which bypasses TypeScript's type checking.

## Files Affected

- `src/lib/practiceQueueService.ts:49, 66`

## Current Code

```typescript
function validateZhuyinSyllable(syllable: any): syllable is ZhuyinSyllable
function validatePronunciation(pronunciation: any): pronunciation is ZhuyinSyllable[]
```

## Recommended Fix

```typescript
function validateZhuyinSyllable(syllable: unknown): syllable is ZhuyinSyllable
function validatePronunciation(pronunciation: unknown): pronunciation is ZhuyinSyllable[]
```

## Rationale

Using `unknown` forces explicit type checking before property access, preventing accidental runtime errors from untyped values. This is TypeScript best practice for type guard functions.

## Acceptance Criteria

- [ ] Change `any` to `unknown` in both validation functions
- [ ] Verify existing tests still pass
- [ ] No type errors introduced elsewhere
