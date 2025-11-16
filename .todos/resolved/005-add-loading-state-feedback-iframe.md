# Add Loading State for Feedback Form Iframe

**Status:** Pending (Ready to pick up)
**Severity:** 🔵 P3 Nice-to-have
**Category:** UX / User Experience
**Estimated Effort:** Small (10 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

The Tally form iframe has no loading indicator while the form URL is being constructed or the iframe content is loading. Users see an empty white box until the form fully loads, which can take 1-3 seconds depending on network conditions. This creates uncertainty about whether the feature is working.

## Location

- `src/components/FeedbackTab.tsx:55-69` - Iframe rendering with conditional `{formUrl && ...}`

## Problem Scenario

1. User clicks "Feedback" tab
2. Component mounts and starts building form URL (depends on auth session)
3. URL construction completes, iframe starts loading Tally content
4. User sees empty white box for 1-3 seconds
5. No visual feedback that something is loading
6. User might think the feature is broken or click away

## Proposed Solution

Add a loading skeleton or spinner while iframe loads:

```typescript
export function FeedbackTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [formUrl, setFormUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // ... existing useEffect hooks ...

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      {/* ... */}

      {/* Embedded Tally Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative min-h-[700px]">
        {!formUrl || isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-spin">⚔️</div>
              <p className="text-gray-600">Loading feedback form...</p>
            </div>
          </div>
        ) : null}
        {formUrl && (
          <iframe
            src={formUrl}
            width="100%"
            height="700"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Feedback Form"
            onLoad={() => setIsLoading(false)}
            style={{
              border: 'none',
              minHeight: '700px',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s'
            }}
          />
        )}
      </div>

      {/* Privacy Notice */}
      {/* ... */}
    </div>
  );
}
```

## Verification Steps

1. Add `isLoading` state to component
2. Add loading spinner UI with absolute positioning
3. Add `onLoad` handler to iframe to set `isLoading` to false
4. Add opacity transition for smooth reveal
5. Test by throttling network in DevTools (Slow 3G)
6. Verify loading state shows and disappears when form loads
7. Update tests if needed (may need to mock iframe onLoad)

## Additional Context

The loading indicator uses the same ⚔️ emoji and styling as other loading states in the app (e.g., Dashboard auth loading), maintaining consistency with the Ninjago dojo theme.
