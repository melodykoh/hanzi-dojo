# Security Action Plan - Implementation Guide

**Generated:** November 14, 2025
**Target Completion:** December 2025
**Total Estimated Effort:** 27 hours over 3 weeks

---

## 📅 Phase 1: Critical Fixes (Week 1)

**Goal:** Address HIGH severity vulnerabilities
**Total Time:** 3 hours

---

### Task 1.1: Strengthen Password Policy

**Priority:** 🔴 HIGH
**File:** `/src/components/AuthScreen.tsx`
**Estimated Time:** 1 hour
**Story Points:** 1

#### Current Code (Line 138)
```tsx
<input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  minLength={6}  // ❌ Too weak
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
  placeholder="••••••••"
  disabled={loading}
/>
```

#### Updated Code
```tsx
<input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  minLength={12}  // ✅ Stronger minimum
  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$"
  title="Password must be at least 12 characters and include uppercase, lowercase, number, and special character"
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
  placeholder="••••••••"
  disabled={loading}
/>
```

#### Also Update Help Text (Line 144)
```tsx
{mode === 'signup' && (
  <p className="text-xs text-gray-500 mt-1">
    Password must be at least 12 characters with uppercase, lowercase, number, and special character
  </p>
)}
```

#### Testing
- [ ] Try signup with 6-char password (should reject)
- [ ] Try password without uppercase (should reject)
- [ ] Try password without number (should reject)
- [ ] Try valid 12-char complex password (should accept)

---

### Task 1.2: Enhance Database Trigger Security

**Priority:** 🔴 HIGH
**File:** `/supabase/migrations/012_auto_create_kid_profile.sql`
**Estimated Time:** 2 hours
**Story Points:** 2

#### Current Code
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default kid profile for new user
  INSERT INTO public.kids (owner_id, name, belt_rank)
  VALUES (NEW.id, 'My Student', 'white');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Enhanced Code (Create new migration: 012a)
```sql
-- Migration 012a: Enhanced trigger with error handling
-- Created: 2025-11-14
-- Purpose: Add error handling and logging to profile creation trigger

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create enhanced trigger function with error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_error_msg TEXT;
BEGIN
  -- Validate input
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Check if profile already exists (idempotency)
  IF EXISTS (SELECT 1 FROM public.kids WHERE owner_id = NEW.id) THEN
    RAISE NOTICE 'Kid profile already exists for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Create default kid profile
  BEGIN
    INSERT INTO public.kids (owner_id, name, belt_rank)
    VALUES (NEW.id, 'My Student', 'white');

    RAISE NOTICE 'Created kid profile for user %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block user creation
      GET STACKED DIAGNOSTICS v_error_msg = MESSAGE_TEXT;
      RAISE WARNING 'Failed to create kid profile for user %: %', NEW.id, v_error_msg;
      -- Don't re-raise - allow user creation to succeed
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set explicit search path for security
ALTER FUNCTION handle_new_user() SET search_path = public, auth;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS
  'Automatically creates a default kid profile when a new user signs up.
   Enhanced with error handling to prevent blocking user creation on failure.
   Created: 2025-11-14, Enhanced: 2025-11-14';
```

#### Rollback Instructions
```sql
-- If this migration causes issues:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Then reapply original Migration 012
```

#### Testing
- [ ] Create new user account (should auto-create profile)
- [ ] Check Supabase logs for success notice
- [ ] Try creating user with duplicate profile (should handle gracefully)
- [ ] Test rollback procedure
- [ ] Verify existing users not affected

---

## 📅 Phase 2: Security Headers (Week 2)

**Goal:** Implement comprehensive security headers
**Total Time:** 3 hours

---

### Task 2.1: Configure Security Headers

**Priority:** 🟡 MEDIUM
**File:** `vercel.json` (root directory)
**Estimated Time:** 3 hours
**Story Points:** 3

#### Current vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Enhanced vercel.json with Security Headers
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.supabase.in; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

#### Testing
1. **Deploy to Vercel** with updated configuration
2. **Check headers** using browser DevTools:
   ```bash
   # Or via curl
   curl -I https://hanzi-dojo.vercel.app
   ```
3. **Verify CSP** - No console errors about blocked resources
4. **Test functionality** - Ensure app works normally
5. **Use securityheaders.com** - Scan for missing headers

#### Common CSP Issues & Fixes
- **Google Fonts blocked?** Already included in `font-src` and `style-src`
- **Supabase blocked?** Already included in `connect-src`
- **Inline styles blocked?** `'unsafe-inline'` added (safe for this app)

---

## 📅 Phase 3: Authentication Enhancements (Week 3)

**Goal:** Add password reset and session timeout
**Total Time:** 10 hours

---

### Task 3.1: Implement Password Reset Flow

**Priority:** 🟡 MEDIUM
**File:** `/src/components/AuthScreen.tsx`
**Estimated Time:** 4 hours
**Story Points:** 3

#### Step 1: Add State for Password Reset Mode
```tsx
// Add after existing state (line 16)
const [showPasswordReset, setShowPasswordReset] = useState(false)
const [resetEmail, setResetEmail] = useState('')
const [resetSent, setResetSent] = useState(false)
```

#### Step 2: Add Password Reset Handler
```tsx
// Add before handleSubmit function
const handlePasswordReset = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    })

    if (error) throw error

    setResetSent(true)
    setSuccessMessage('Password reset link sent! Check your email.')
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message)
    }
  } finally {
    setLoading(false)
  }
}
```

#### Step 3: Add Password Reset UI
```tsx
// Add after existing form, before footer
{showPasswordReset ? (
  /* Password Reset Form */
  <form onSubmit={handlePasswordReset} className="space-y-6">
    <div>
      <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-2">
        Email Address
      </label>
      <input
        id="reset-email"
        type="email"
        value={resetEmail}
        onChange={(e) => setResetEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
        placeholder="you@example.com"
        disabled={loading || resetSent}
      />
    </div>

    {error && (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )}

    {successMessage && (
      <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
        <p className="text-sm text-green-800">{successMessage}</p>
      </div>
    )}

    <button
      type="submit"
      disabled={loading || resetSent}
      className="w-full px-6 py-4 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Sending...' : resetSent ? 'Reset Link Sent' : 'Send Reset Link'}
    </button>

    <button
      type="button"
      onClick={() => {
        setShowPasswordReset(false)
        setResetEmail('')
        setResetSent(false)
        setError(null)
        setSuccessMessage(null)
      }}
      className="w-full text-sm text-gray-600 hover:text-gray-900"
    >
      ← Back to login
    </button>
  </form>
) : (
  /* Existing login/signup form */
  // ... keep existing form
)}
```

#### Step 4: Add "Forgot Password" Link
```tsx
// Add after password input (around line 148)
{mode === 'login' && (
  <div className="text-right">
    <button
      type="button"
      onClick={() => setShowPasswordReset(true)}
      className="text-sm text-red-600 hover:text-red-700 font-semibold"
    >
      Forgot password?
    </button>
  </div>
)}
```

#### Testing
- [ ] Click "Forgot password" link
- [ ] Enter email and submit
- [ ] Check email for reset link
- [ ] Click link and set new password
- [ ] Login with new password
- [ ] Test with invalid email (should show error)

---

### Task 3.2: Implement Session Timeout

**Priority:** 🟡 MEDIUM
**File:** `/src/components/Dashboard.tsx` (and create new hook)
**Estimated Time:** 6 hours
**Story Points:** 5

#### Step 1: Create Idle Timeout Hook

**New File:** `/src/hooks/useIdleTimeout.ts`
```typescript
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_TIME_MS = 5 * 60 * 1000   // Show warning 5 min before timeout

export function useIdleTimeout() {
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    // Set warning timer (show modal 5 min before logout)
    warningRef.current = setTimeout(() => {
      // TODO: Show warning modal
      console.log('Session expiring in 5 minutes')
    }, IDLE_TIMEOUT_MS - WARNING_TIME_MS)

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/auth')
    }, IDLE_TIMEOUT_MS)
  }

  useEffect(() => {
    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Initial timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [])

  return { resetTimer }
}
```

#### Step 2: Use Hook in Dashboard
```tsx
// Add to Dashboard.tsx imports
import { useIdleTimeout } from '../hooks/useIdleTimeout'

// Add inside Dashboard component
export function Dashboard() {
  useIdleTimeout() // Activate idle timeout

  // ... rest of component
}
```

#### Step 3: Add Warning Modal (Optional)

**New Component:** `/src/components/IdleWarningModal.tsx`
```tsx
interface IdleWarningModalProps {
  show: boolean
  onContinue: () => void
  secondsRemaining: number
}

export function IdleWarningModal({ show, onContinue, secondsRemaining }: IdleWarningModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ⏱️ Session Expiring Soon
        </h2>
        <p className="text-gray-700 mb-6">
          You'll be logged out in {Math.ceil(secondsRemaining / 60)} minutes due to inactivity.
        </p>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
        >
          Continue Session
        </button>
      </div>
    </div>
  )
}
```

#### Testing
- [ ] Let app sit idle for 25 minutes (should show warning)
- [ ] Click "Continue Session" (timer resets)
- [ ] Let app sit idle for 30 minutes (should logout)
- [ ] Move mouse during idle (timer resets)
- [ ] Test across browser tabs

---

## 📅 Phase 4: Input Validation (Week 4)

**Goal:** Add Chinese character validation
**Total Time:** 2 hours

---

### Task 4.1: Add Chinese Character Input Validation

**Priority:** 🟢 LOW
**File:** `/src/components/AddItemForm.tsx`
**Estimated Time:** 2 hours
**Story Points:** 2

#### Add Validation Function
```tsx
// Add after imports (around line 28)
const CHINESE_CHAR_REGEX = /^[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+$/

function validateChineseInput(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'Input cannot be empty' }
  }

  if (input.length > 10) {
    return { valid: false, error: 'Input too long (max 10 characters)' }
  }

  if (!CHINESE_CHAR_REGEX.test(input)) {
    return { valid: false, error: 'Only Chinese characters allowed (no emoji, punctuation, or English)' }
  }

  return { valid: true }
}
```

#### Update Input Handler
```tsx
// Modify setInput handler (around line 479)
<input
  type="text"
  value={input}
  onChange={(e) => {
    const newValue = e.target.value
    setInput(newValue)

    // Real-time validation feedback
    if (newValue.length > 0) {
      const validation = validateChineseInput(newValue)
      if (!validation.valid) {
        setErrors([validation.error!])
      } else {
        setErrors([])
      }
    }
  }}
  maxLength={10}
  placeholder="Enter Chinese character or word..."
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-2xl"
  autoFocus
/>
```

#### Add Validation to Submit
```tsx
// In handleSubmit, before checkDuplicate (around line 332)
const inputValidation = validateChineseInput(input)
if (!inputValidation.valid) {
  setErrors([inputValidation.error!])
  setIsSubmitting(false)
  return
}
```

#### Testing
- [ ] Try entering English letters (should reject)
- [ ] Try entering emoji (should reject)
- [ ] Try entering 11+ characters (should reject)
- [ ] Try valid Chinese characters (should accept)
- [ ] Test with traditional and simplified characters

---

## 📅 Phase 5: Operational Security (Ongoing)

**Goal:** Configure monitoring and backups
**Total Time:** 1 hour

---

### Task 5.1: Configure Supabase Backups

**Priority:** 🟡 MEDIUM
**Location:** Supabase Dashboard
**Estimated Time:** 1 hour
**Story Points:** 1

#### Steps
1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select Hanzi Dojo project

2. **Enable Daily Backups**
   - Navigate to Settings → Database
   - Enable automatic backups
   - Set retention: 7 days minimum
   - Configure point-in-time recovery

3. **Test Backup Restoration**
   - Create test backup
   - Restore to staging environment
   - Verify data integrity

4. **Document Backup Procedures**
   - Create `/docs/operational/BACKUP_PROCEDURES.md`
   - Include restoration steps
   - Add to runbook

#### Testing
- [ ] Verify backups run daily
- [ ] Test restoration procedure
- [ ] Document recovery time objective (RTO)

---

## 📊 Progress Tracking

### Week 1 (Critical)
- [ ] Task 1.1: Password policy (1h)
- [ ] Task 1.2: Trigger security (2h)
- [ ] **Week 1 Total:** 3 hours

### Week 2 (Security Headers)
- [ ] Task 2.1: Configure headers (3h)
- [ ] **Week 2 Total:** 3 hours

### Week 3 (Auth Enhancements)
- [ ] Task 3.1: Password reset (4h)
- [ ] Task 3.2: Session timeout (6h)
- [ ] **Week 3 Total:** 10 hours

### Week 4+ (Polish)
- [ ] Task 4.1: Chinese validation (2h)
- [ ] Task 5.1: Backup config (1h)
- [ ] **Week 4+ Total:** 3 hours

### Overall Progress
- **Total Effort:** 19 hours over 4 weeks
- **Story Points:** 17 points
- **Sprint Velocity:** ~4-5 points/week

---

## 🧪 Testing Strategy

### Security Regression Tests
After each phase, run full security test suite:

1. **Authentication Tests**
   - Login/logout functionality
   - Password strength validation
   - Session persistence
   - Password reset flow (after Phase 3)

2. **Authorization Tests**
   - RLS policy enforcement
   - Cross-user data access attempts
   - Profile creation trigger

3. **Input Validation Tests**
   - XSS injection attempts
   - SQL injection attempts
   - Chinese character validation (after Phase 4)

4. **Header Verification**
   - CSP compliance (after Phase 2)
   - Frame protection
   - Content type sniffing

### Automated Testing
Consider adding to test suite:
```bash
# Run security-focused tests
npm run test:security

# Check for known vulnerabilities
npm audit

# Verify headers in staging
curl -I https://hanzi-dojo-staging.vercel.app
```

---

## 📈 Success Metrics

### Security KPIs
- [ ] Zero critical/high vulnerabilities in npm audit
- [ ] 100% RLS policy coverage maintained
- [ ] A+ rating on securityheaders.com
- [ ] Password strength increased to 12+ characters
- [ ] Session timeout implemented (30 min)
- [ ] Backup recovery tested successfully

### User Impact Metrics
- [ ] No increase in login failures (after password change)
- [ ] Password reset usage tracked
- [ ] Session timeout warnings tracked
- [ ] Zero data breaches

---

## 🚨 Rollback Plan

If any phase causes issues:

### Phase 1 Rollback
```bash
# Revert password policy
git revert <commit-hash>

# Rollback trigger migration
psql -h <host> -U <user> -d <db> -f supabase/migrations/012a_rollback.sql
```

### Phase 2 Rollback
```bash
# Remove security headers from vercel.json
git checkout HEAD~1 -- vercel.json
vercel --prod
```

### Phase 3 Rollback
```bash
# Disable password reset/timeout features
git revert <commit-hash>
```

---

## 📚 Additional Resources

### Documentation
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth/security)
- [Content Security Policy Guide](https://content-security-policy.com/)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Security Headers Scanner](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

### Support
- **Supabase:** support@supabase.io
- **Vercel:** support@vercel.com
- **OWASP:** owasp.org/slack

---

**Document Owner:** Development Team
**Last Updated:** November 14, 2025
**Next Review:** After each phase completion
