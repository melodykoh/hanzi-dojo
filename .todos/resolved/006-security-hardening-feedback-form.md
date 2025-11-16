# Security Hardening for Feedback Form

**Status:** Pending (Ready to pick up)
**Severity:** 🟡 P2 Important
**Category:** Security
**Estimated Effort:** Medium (30 minutes)
**Created:** 2025-11-16
**Source:** PR #12 Code Review (Session 14)

---

## Description

The FeedbackTab component exposes several security considerations that should be addressed before handling user data at scale:

1. **No input validation** - URL parameters are constructed from session data without sanitization
2. **Missing CSP headers** - No Content-Security-Policy to restrict iframe sources
3. **Excessive fingerprinting** - Collects browser/viewport data that may not be necessary

## Location

- `src/components/FeedbackTab.tsx:28-36` - URL parameter construction
- Project root - Missing security headers configuration
- `src/components/FeedbackTab.tsx:34-35` - Fingerprinting data collection

## Problem Scenarios

### Issue 8a: Input Validation
1. Malicious user manipulates session data (XSS in email field)
2. Component builds URL with unsanitized data
3. URL parameter injection risk if Tally.so doesn't sanitize
4. Potential for breaking iframe or exposing data

### Issue 8b: CSP Headers
1. Attacker finds XSS vulnerability elsewhere in app
2. Can inject malicious iframes from any domain
3. No CSP policy restricts iframe sources to tally.so
4. User data could be sent to attacker-controlled domain

### Issue 8c: Fingerprinting
1. Browser user agent and viewport size collected
2. Data may not be necessary for bug reports
3. Increases privacy surface area
4. Could be used to track users across sessions

## Proposed Solutions

### 8a: Add Input Validation

Create sanitization functions for URL parameters:

```typescript
const params = new URLSearchParams({
  email: sanitizeEmail(user?.email || ''),
  user_id: sanitizeUserId(user?.id || 'anonymous'),
  user_type: user ? 'authenticated' : 'demo',
  page: sanitizePath(window.location.pathname),
  timestamp: new Date().toISOString(),
});

function sanitizeEmail(email: string): string {
  // Only allow valid email characters
  return email.replace(/[^\w@.\-+]/g, '');
}

function sanitizeUserId(id: string): string {
  // Only allow alphanumeric and hyphens
  return id.replace(/[^\w\-]/g, '');
}

function sanitizePath(path: string): string {
  // Only allow valid path characters
  return path.replace(/[^\/\w\-]/g, '');
}
```

### 8b: Add CSP Headers

Create `vercel.json` at project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-src 'self' https://tally.so"
        }
      ]
    }
  ]
}
```

### 8c: Reduce Fingerprinting

Remove viewport and browser data:

```typescript
const params = new URLSearchParams({
  email: user?.email || '',
  user_id: user?.id || 'anonymous',
  user_type: user ? 'authenticated' : 'demo',
  page: window.location.pathname,
  timestamp: new Date().toISOString(),
  // REMOVED: viewport and browser
});
```

## Verification Steps

1. **Input Validation:**
   - Add sanitization functions to FeedbackTab.tsx
   - Test with special characters in email (e.g., `test<script>@example.com`)
   - Verify URL parameters are cleaned
   - Check form still receives data correctly

2. **CSP Headers:**
   - Create `vercel.json` with CSP configuration
   - Deploy to preview environment
   - Use browser DevTools → Network → Headers to verify CSP header present
   - Test that Tally iframe still loads
   - Test that other iframes from different domains are blocked

3. **Fingerprinting:**
   - Remove viewport and browser params from URL construction
   - Verify form still submits successfully
   - Check Tally dashboard to confirm reduced data collection

4. **Regression Testing:**
   - Run `npm test` to ensure no test breakage
   - Manually test feedback form submission
   - Verify both authenticated and demo users can submit

## Additional Context

These security improvements follow defense-in-depth principles:
- **Input validation** protects against injection attacks
- **CSP headers** limit blast radius of potential XSS vulnerabilities
- **Reduced fingerprinting** minimizes privacy exposure

While Tally.so likely has its own sanitization, we shouldn't rely solely on third-party validation for security.
