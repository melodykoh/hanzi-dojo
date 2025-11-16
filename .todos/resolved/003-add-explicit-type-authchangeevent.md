# Add Explicit Type for AuthChangeEvent in FeedbackTab

**Status:** Pending (Ready to pick up)
**Severity:** 🟡 P2 Important
**Category:** Type Safety / Code Quality
**Estimated Effort:** Small (2 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

The `onAuthStateChange` callback parameter `_event` uses an implicit `any` type instead of the proper `AuthChangeEvent` type from Supabase. While the variable is intentionally unused (prefixed with `_`), it should still have an explicit type for TypeScript safety and IDE autocomplete.

## Location

- `src/components/FeedbackTab.tsx:16` - `(_event, session) => { ... }`

## Problem Scenario

1. Developer reviews TypeScript code with strict mode enabled
2. Sees implicit `any` type warning
3. Reduces confidence in type safety across the codebase
4. If developer needs to use the event in future, they don't know what type it should be
5. IDE cannot provide autocomplete suggestions for the event parameter

## Proposed Solution

Add explicit type annotation:

```typescript
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

// Later in useEffect:
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
  setSession(session);
});
```

## Verification Steps

1. Update import statement at top of file to include `AuthChangeEvent`
2. Add type annotation to `_event` parameter
3. Run `npm run build` to verify TypeScript compilation succeeds
4. Check that no new type errors appear
5. Verify tests still pass with `npm test`

## Additional Context

This follows the same pattern used throughout the codebase for Supabase auth state listeners. The underscore prefix `_event` correctly indicates the parameter is intentionally unused, but it should still have an explicit type.
