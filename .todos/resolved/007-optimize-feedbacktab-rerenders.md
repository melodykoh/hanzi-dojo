# Optimize FeedbackTab Re-renders with useMemo

**Status:** Pending (Ready to pick up)
**Severity:** 🔵 P3 Nice-to-have
**Category:** Performance
**Estimated Effort:** Small (10 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

The `useEffect` hook that builds the form URL runs on every `session` change, but the URL construction logic includes values that don't depend on session state (page, timestamp, viewport, browser). This causes unnecessary URL rebuilds even when these values haven't changed.

Additionally, creating a new `URLSearchParams` object and calling `toString()` on every session change creates unnecessary object allocations.

## Location

- `src/components/FeedbackTab.tsx:24-39` - Form URL construction useEffect

## Problem Scenario

1. Component mounts, session loads, URL built
2. Auth token refreshes (common with Supabase)
3. Session object updates (same user, new token)
4. useEffect triggers again, rebuilds identical URL
5. Unnecessary re-render of iframe (src attribute changes)
6. Browser may reload iframe content unnecessarily
7. Poor UX if user is mid-typing in form

## Proposed Solution

Use `useMemo` to memoize the form URL and only rebuild when relevant values change:

```typescript
import { useState, useEffect, useMemo } from 'react';

export function FeedbackTab() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Memoize form URL - only rebuild when user email/ID changes
  const formUrl = useMemo(() => {
    const user = session?.user;
    const formId = 'VLL59J';

    const params = new URLSearchParams({
      email: user?.email || '',
      user_id: user?.id || 'anonymous',
      user_type: user ? 'authenticated' : 'demo',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    });

    return `https://tally.so/embed/${formId}?${params.toString()}`;
  }, [session?.user?.email, session?.user?.id]);

  return (
    // ... rest of component
  );
}
```

## Alternative Approach

If timestamp/viewport should update on every render, separate static and dynamic params:

```typescript
const baseParams = useMemo(() => ({
  email: session?.user?.email || '',
  user_id: session?.user?.id || 'anonymous',
  user_type: session?.user ? 'authenticated' : 'demo',
}), [session?.user?.email, session?.user?.id]);

const formUrl = useMemo(() => {
  const params = new URLSearchParams({
    ...baseParams,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    browser: navigator.userAgent
  });
  return `https://tally.so/embed/VLL59J?${params.toString()}`;
}, [baseParams]);
```

## Verification Steps

1. Replace `useState` + `useEffect` with `useMemo` for formUrl
2. Add `useMemo` import from React
3. Remove the second `useEffect` that was building the URL
4. Test that form still loads correctly
5. Test that form URL updates when user signs in/out
6. Use React DevTools Profiler to verify reduced re-renders
7. Check that tests still pass

## Additional Context

This optimization follows the pattern already used in `DashboardMetrics.tsx` where expensive calculations are memoized to prevent unnecessary re-renders. The change removes one `useEffect` hook and replaces it with a more efficient `useMemo` hook.
