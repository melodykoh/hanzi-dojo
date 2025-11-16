# Fix Test `act()` Warnings in FeedbackTab Tests

**Status:** Pending (Ready to pick up)
**Severity:** 🟡 P2 Important
**Category:** Testing / Code Quality
**Estimated Effort:** Small (5 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

Three tests in `FeedbackTab.test.tsx` produce React warnings about state updates not being wrapped in `act()`. This happens because the `useEffect` hooks in FeedbackTab trigger async state updates (auth session check, form URL construction) that occur after the component renders during tests.

## Location

- `src/components/FeedbackTab.test.tsx:18-21` - "renders feedback tab with title"
- `src/components/FeedbackTab.test.tsx:23-26` - "renders intro text"
- `src/components/FeedbackTab.test.tsx:40-44` - "displays privacy notice"

## Problem Scenario

1. Test renders `<FeedbackTab />`
2. Component mounts and triggers two `useEffect` hooks
3. First effect calls `supabase.auth.getSession()` (async)
4. Second effect builds form URL and calls `setFormUrl()` (depends on session state)
5. State updates happen after test assertions complete
6. React warns: "An update to FeedbackTab inside a test was not wrapped in act(...)"
7. Console pollution makes it harder to spot real test failures

## Proposed Solution

Wrap assertions in `waitFor()` to allow async state updates to complete:

```typescript
it('renders feedback tab with title', async () => {
  render(<FeedbackTab />);
  await waitFor(() => {
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});

it('renders intro text', async () => {
  render(<FeedbackTab />);
  await waitFor(() => {
    expect(screen.getByText(/We'd love to hear from you/i)).toBeInTheDocument();
  });
});

it('displays privacy notice', async () => {
  render(<FeedbackTab />);
  await waitFor(() => {
    expect(screen.getByText(/Privacy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your feedback is confidential/i)).toBeInTheDocument();
  });
});
```

## Verification Steps

1. Run `npm test` and check for `act()` warnings in console
2. Apply the fixes above
3. Run `npm test` again
4. Verify all warnings are gone
5. Verify all 4 tests still pass

## Additional Context

One test ("renders embedded Tally iframe with form URL") already uses `waitFor` correctly and doesn't produce warnings. This demonstrates the correct pattern to follow.
