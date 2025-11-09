# Epic 5 Testing Setup - Proper Auth Approach

## Overview
Instead of hacking RLS policies and foreign keys, we'll use a **real test account** through Supabase Auth.

---

## Setup Steps (5 minutes)

### 1. Enable Email Auth in Supabase
1. Go to your Supabase project → **Authentication** → **Providers**
2. Enable **Email** provider
3. **Disable email confirmation** (for testing only):
   - Go to **Authentication** → **Settings** → **Auth Confirmation**
   - Uncheck "Enable email confirmations"

### 2. Create Test Account via Supabase Dashboard
1. Go to **Authentication** → **Users** → **Add user**
2. **Email:** `test@hanzidojo.local`
3. **Password:** `testpassword123`
4. **Auto confirm user:** ✅ (checked)
5. Click **Create user**
6. **Copy the user UUID** from the users list

### 3. Create Test Kid Record
1. Go to **SQL Editor** → New query
2. Run this (replace `YOUR_USER_UUID` with the UUID from step 2):
   ```sql
   INSERT INTO kids (owner_id, name, belt_rank)
   VALUES (
     'YOUR_USER_UUID'::uuid,  -- Replace with actual user UUID
     'Test Kid',
     'white'
   );
   ```
3. Verify: Go to **Table Editor** → `kids` table - should see 1 record

---

## Update Frontend to Use Test Account

### 4. Add Simple Login Form to Dashboard

Instead of hardcoded TEST_KID_ID, we'll implement a minimal login flow.

**Option A: Automatic login (fastest for testing)**
Add this to `Dashboard.tsx`:

```typescript
useEffect(() => {
  async function autoLogin() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Auto-login with test credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@hanzidojo.local',
        password: 'testpassword123'
      })
      
      if (error) {
        console.error('Auto-login failed:', error)
        return
      }
    }
    
    // Load kid from authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: kids } = await supabase
        .from('kids')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
      
      if (kids && kids.length > 0) {
        setKidId(kids[0].id)
      }
    }
  }
  
  autoLogin()
}, [])
```

**Option B: Manual login form (more realistic)**
Create a simple login screen that appears when not authenticated.

---

## Why This Approach is Better

✅ **No database hacks** - Uses Supabase Auth as designed
✅ **RLS works properly** - No policy modifications needed
✅ **Clean migration path** - Same auth flow works in Epic 6
✅ **Testable** - Can create multiple test accounts easily
✅ **No cleanup needed** - Just delete test user when done

---

## Testing Checklist

- [ ] Supabase Email auth enabled
- [ ] Email confirmation disabled (testing only)
- [ ] Test user created: `test@hanzidojo.local`
- [ ] Test kid record created and linked to test user
- [ ] Dashboard auto-logs in with test credentials
- [ ] Add Item form works without modifications
- [ ] Can add characters and see them in practice queue
- [ ] Dashboard metrics display correctly

---

## Cleanup for Epic 6

When implementing real auth in Epic 6:
1. Remove auto-login code from Dashboard
2. Delete test user from Supabase Auth
3. Re-enable email confirmations
4. Implement proper signup/login UI

**Much simpler than the RLS/FK hack approach!**
