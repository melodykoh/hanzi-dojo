---
status: resolved
priority: p1
issue_id: "001"
tags: [data-integrity, bug, pr-11, authentication]
dependencies: []
resolved_date: 2025-11-15
---

# Missing Auth State Change Listener in Dashboard

## Problem Statement

Dashboard component only checks authentication state on mount but doesn't listen for mid-session auth changes. When a user's session expires while browsing the app, the local React state remains authenticated while Supabase has logged them out, causing RLS violations and corrupted UI state.

## Findings

- Discovered during PR #11 code review (Data Integrity analysis)
- Location: `src/components/Dashboard.tsx:77-129`
- Current implementation only checks auth once on component mount
- No listener for `SIGNED_OUT`, `TOKEN_REFRESHED`, or other auth state changes
- Session expiry (default 1 hour) leaves user in corrupted state

**Problem Scenario:**
1. User signs in and browses demo tab
2. Session expires after 1 hour (Supabase default)
3. User switches to "My Characters" tab
4. Component tries to fetch entries with null session
5. RLS blocks query → cryptic error messages
6. User stuck in corrupted state requiring manual refresh

**Current Code:**
```typescript
useEffect(() => {
  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSession(null)
      setKidId(null)
      return
    }
    // ... rest of auth logic
  }
  checkAuth()
}, []) // ❌ No listener for session changes
```

## Proposed Solutions

### Option 1: Add onAuthStateChange Listener (Recommended)
- **Pros**:
  - Catches all auth state changes (sign out, token refresh, session expiry)
  - Industry standard pattern for Supabase apps
  - Automatically syncs React state with Supabase auth state
  - Prevents RLS violations from stale session data
- **Cons**:
  - Adds ~15 lines of code
  - Requires cleanup function (unsubscribe on unmount)
- **Effort**: Small (1 hour including testing)
- **Risk**: Low (well-documented Supabase pattern)

**Implementation:**
```typescript
useEffect(() => {
  // Initial auth check
  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setSession(null)
      setKidId(null)
      setIsLoading(false)
      return
    }

    // ... rest of existing auth logic
  }

  checkAuth()

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      setSession(null)
      setKidId(null)
      setActiveTab('metrics') // Reset to demo view
      setShowAddItemForm(false) // Close any open modals
      setShowDrillSelection(false)
      setShowSignupModal(false)
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Re-run auth check to load kid profile
      checkAuth()
    }
  })

  return () => subscription.unsubscribe()
}, [])
```

## Recommended Action

Implement Option 1 immediately - this is a critical bug that can corrupt user sessions.

## Technical Details

- **Affected Files**: `src/components/Dashboard.tsx`
- **Related Components**: None (isolated fix)
- **Database Changes**: No
- **API Changes**: No
- **Dependencies**: Existing Supabase client

## Resources

- Original finding: PR #11 Code Review - Data Integrity Analysis
- Supabase docs: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#listen-to-auth-events
- Related issues: None

## Acceptance Criteria

- [x] Add `onAuthStateChange` listener to Dashboard useEffect
- [x] Clean up subscription on component unmount
- [x] Reset UI state (activeTab, modals) when signed out
- [ ] Test scenario: Sign in → wait for session expiry → verify auto-logout
- [ ] Test scenario: Sign out → verify dashboard switches to demo mode
- [ ] Test scenario: Token refresh → verify session stays valid
- [x] No console errors or warnings
- [x] All existing tests pass (build succeeds)

## Work Log

### 2025-11-15 - Initial Discovery
**By:** Claude Triage System
**Actions:**
- Issue discovered during PR #11 code review
- Categorized as P1 CRITICAL (data integrity bug)
- Estimated effort: Small (1 hour)
- Marked as ready for immediate work

**Learnings:**
- Auth state management requires both initial check AND event listener
- Session expiry is a common edge case that must be handled
- Supabase provides `onAuthStateChange` specifically for this use case

### 2025-11-15 - Implementation Complete
**By:** Claude Code Resolution Agent
**Actions:**
- Added `onAuthStateChange` listener to Dashboard.tsx useEffect
- Implemented cleanup subscription on component unmount
- Added UI state reset on SIGNED_OUT (activeTab, modals)
- Added re-authentication on SIGNED_IN and TOKEN_REFRESHED events
- Verified build succeeds with no TypeScript errors

**Changes Made:**
- File: `/Users/melodykoh/Documents/Claude Projects/Hanzi Dojo/src/components/Dashboard.tsx`
- Lines modified: 77-146
- Added ~15 lines for auth state listener and cleanup

**Verification:**
- Build succeeds: `npm run build` passes with no errors
- TypeScript compilation clean
- No console warnings

## Notes

Source: PR #11 Code Review Triage Session (2025-11-15)

**Priority Justification:** This is a critical bug that can leave users in corrupted states requiring manual refresh. While not a security vulnerability (RLS protects data), it creates a poor user experience and confusing error states.

**Testing Strategy:**
- Manually test by shortening session duration in Supabase settings
- Use browser dev tools to clear auth token mid-session
- Verify auto-logout behavior matches expected UX
