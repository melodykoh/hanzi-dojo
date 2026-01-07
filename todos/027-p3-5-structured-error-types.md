# P3-5: Consider Structured Error Types

**Status:** Pending
**Priority:** P3 (Low)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

Error handling uses console.error with inline objects. This works but lacks structure for debugging and monitoring at scale.

## Files Affected

- `src/lib/practiceQueueService.ts:103-108, 116-120, 130-134, 143-149`

## Current Pattern

```typescript
console.error('[practiceQueueService] Invalid primary pronunciation:', {
  primary,
  entryId: row?.entry_id,
  reason: 'Failed validation - malformed syllable structure or invalid tone marker'
})
```

## Recommended Pattern

Create structured error types:

```typescript
// src/lib/errors.ts
export class PronunciationValidationError extends Error {
  constructor(
    public readonly entryId: string | undefined,
    public readonly field: 'primary' | 'manual' | 'dictionary' | 'variant',
    public readonly data: unknown,
    public readonly reason: string
  ) {
    super(`[PronunciationValidation] ${field}: ${reason}`)
    this.name = 'PronunciationValidationError'
  }
}

// Usage
throw new PronunciationValidationError(
  row?.entry_id,
  'primary',
  primary,
  'Malformed syllable structure or invalid tone marker'
)
```

## Benefits

- Consistent error format across codebase
- Easier to catch and handle specific error types
- Better integration with error monitoring services (Sentry, etc.)
- TypeScript type safety for error properties

## Acceptance Criteria

- [ ] Create `src/lib/errors.ts` with error classes
- [ ] Replace inline console.error with structured errors
- [ ] Decide: throw vs log (depends on error severity)
- [ ] Update P2-1 (console logging) to use structured logging utility
