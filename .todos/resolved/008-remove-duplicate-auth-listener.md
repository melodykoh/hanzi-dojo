# Remove Duplicate Auth State Listener in FeedbackTab

**Status:** Pending (Ready to pick up)
**Severity:** 🔵 P3 Nice-to-have
**Category:** Performance / Resource Management
**Estimated Effort:** Small (10 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

FeedbackTab creates its own auth state listener even though the parent Dashboard component already maintains an auth state listener. This creates two active subscriptions to Supabase auth events, consuming unnecessary memory and potentially causing race conditions.

This is the same issue as #4 (Duplicate Auth State Management) but focused on the performance/resource impact.

## Location

- `src/components/FeedbackTab.tsx:9-21` - Auth listener setup in FeedbackTab
- `src/components/Dashboard.tsx:142-154` - Auth listener setup in Dashboard

## Problem Scenario

1. Dashboard mounts → creates auth listener subscription #1
2. User navigates to Feedback tab
3. FeedbackTab mounts → creates auth listener subscription #2
4. Auth event fires (token refresh, sign out, etc.)
5. Both listeners trigger simultaneously
6. Two separate state updates queued
7. Potential race condition if updates conflict
8. Memory overhead from duplicate subscription
9. When FeedbackTab unmounts, only one subscription cleaned up

## Proposed Solution

Pass session as prop from Dashboard instead of managing auth state independently:

### Step 1: Update Dashboard.tsx

```typescript
// Around line 425
{activeTab === 'feedback' && <FeedbackTab session={session} />}
```

### Step 2: Update FeedbackTab.tsx

```typescript
import { useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';

interface FeedbackTabProps {
  session: Session | null;
}

export function FeedbackTab({ session }: FeedbackTabProps) {
  // Remove all auth state management (lines 6-21)

  // Use session prop directly in useMemo
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
    <div className="max-w-4xl mx-auto p-6">
      {/* ... rest of component */}
    </div>
  );
}
```

### Step 3: Update FeedbackTab.test.tsx

```typescript
// Update tests to pass session prop
it('renders feedback tab with title', async () => {
  render(<FeedbackTab session={null} />);
  await waitFor(() => {
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});

// For authenticated user tests, create mock session:
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com'
  }
} as Session;

it('renders with authenticated user', async () => {
  render(<FeedbackTab session={mockSession} />);
  // ... assertions
});
```

## Benefits

This eliminates:
- ✅ 13 lines of duplicate auth code
- ✅ One active Supabase subscription
- ✅ Potential race conditions
- ✅ Memory overhead
- ✅ State synchronization complexity

## Verification Steps

1. Update Dashboard to pass `session` prop
2. Update FeedbackTab to accept `session` prop
3. Remove auth state management from FeedbackTab (useState, useEffect)
4. Update component to use `session` prop in useMemo
5. Update all tests to pass session prop
6. Run `npm test` to verify tests pass
7. Test form with:
   - Demo user (session=null)
   - Authenticated user
   - Sign in while on Feedback tab
   - Sign out while on Feedback tab
8. Verify form URL updates correctly in all scenarios

## Additional Context

This refactor aligns with React best practices: lift state up to the parent component and pass it down as props. It also matches the pattern used for other Dashboard tabs that need auth context (e.g., EntryCatalog receives `kidId` prop).
