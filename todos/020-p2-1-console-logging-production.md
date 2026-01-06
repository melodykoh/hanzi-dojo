# P2-1: Console Logging in Production

**Status:** Pending
**Priority:** P2 (Medium)
**Source:** PR #21 Code Review (Session 17)
**Created:** 2025-12-06

## Issue

Console.error and console.warn statements in `practiceQueueService.ts` log potentially sensitive data (entry IDs, pronunciation arrays) to the browser console in production.

## Files Affected

- `src/lib/practiceQueueService.ts:103-108, 116-120, 130-134, 143-149`

## Recommendation

Add environment check or rate limiting to prevent console spam in production:

```typescript
const isDev = import.meta.env.DEV

if (isDev) {
  console.error('[practiceQueueService] Invalid primary pronunciation:', {...})
}
```

Alternatively, implement a structured logging utility that:
- Suppresses verbose logs in production
- Allows enabling debug mode via localStorage flag
- Sends critical errors to a monitoring service

## Acceptance Criteria

- [ ] Console logs only appear in development mode
- [ ] Critical errors still logged (but without sensitive data exposure)
- [ ] Optional: localStorage flag to enable debug logging in production
