# Migration 013 Deployment Instructions

## Overview
This migration fixes dictionary RLS policies to allow public access for demo mode users.

## Pre-Deployment Checklist
- [x] Migration file created: `supabase/migrations/013_fix_dictionary_public_access.sql`
- [x] Migration documented with security analysis
- [x] Migration reviewed for security impact (LOW - only reference data exposed)
- [ ] Ready to apply to production database

## Deployment Steps

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/bsugsidntevtenadkkin
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/013_fix_dictionary_public_access.sql`
4. Copy the SQL content (lines 24-39):
   ```sql
   DROP POLICY IF EXISTS dictionary_entries_read_policy ON dictionary_entries;
   DROP POLICY IF EXISTS dictionary_confusions_read_policy ON dictionary_confusions;

   CREATE POLICY dictionary_entries_public_read ON dictionary_entries
     FOR SELECT USING (true);

   CREATE POLICY dictionary_confusions_public_read ON dictionary_confusions
     FOR SELECT USING (true);
   ```
5. Paste into SQL Editor and run
6. Verify success (should see "Success. No rows returned")

### Option 2: Via Supabase CLI (Requires Setup)
```bash
# Link project (one-time setup)
npx supabase link --project-ref bsugsidntevtenadkkin

# Push migration
npx supabase db push --linked

# Verify
npx supabase db remote status
```

## Post-Deployment Verification

### 1. Check Policies in Supabase Dashboard
```sql
-- Run this query in SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('dictionary_entries', 'dictionary_confusions');
```

**Expected Results:**
| tablename | policyname | cmd | qual |
|-----------|------------|-----|------|
| dictionary_entries | dictionary_entries_public_read | SELECT | true |
| dictionary_confusions | dictionary_confusions_public_read | SELECT | true |

### 2. Test Demo Mode Dictionary Lookup
1. Open https://hanzi-dojo.vercel.app in **incognito/private window**
2. DO NOT sign in (test as anonymous user)
3. Navigate to **Dictionary** tab
4. Search for character: "学"
5. **Expected:** Dictionary results appear with Zhuyin, Traditional, etc.
6. **Failure:** Empty results or "No results found"

### 3. Test Authenticated User Access
1. Sign in to the app (regular browser)
2. Navigate to **Dictionary** tab
3. Search for character: "学"
4. **Expected:** Dictionary results appear (same as demo mode)

### 4. Verify User Data Protection
```sql
-- Run this query to confirm user tables still protected
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('kids', 'entries', 'practice_state', 'practice_events')
ORDER BY tablename, policyname;
```

**Expected:** All user tables should have policies requiring `auth.uid()`

## Rollback Plan (If Needed)

If issues arise, restore original restrictive policies:

```sql
-- Rollback migration 013
DROP POLICY IF EXISTS dictionary_entries_public_read ON dictionary_entries;
DROP POLICY IF EXISTS dictionary_confusions_public_read ON dictionary_confusions;

-- Restore original policies
CREATE POLICY dictionary_entries_read_policy ON dictionary_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY dictionary_confusions_read_policy ON dictionary_confusions
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

## Security Validation

**Before marking complete, verify:**
- [ ] Demo mode dictionary lookup works (unauthenticated)
- [ ] Authenticated dictionary lookup works
- [ ] User tables remain protected (kids, entries, practice_state, practice_events)
- [ ] No errors in Supabase logs
- [ ] No unexpected public access to user data

## Deployment Log

### Date: _______________
**Deployed By:** _______________

**Deployment Method:** [ ] Supabase Dashboard  [ ] Supabase CLI

**Verification Results:**
- [ ] Policies updated successfully
- [ ] Demo mode dictionary works
- [ ] Authenticated access works
- [ ] User data protected
- [ ] No errors in logs

**Notes:**
_____________________________________
_____________________________________

**Status:** [ ] Complete  [ ] Issues Found  [ ] Rolled Back

---

**Related Files:**
- Migration: `/supabase/migrations/013_fix_dictionary_public_access.sql`
- Todo: `/todos/002-ready-p1-dictionary-rls-public-access.md`
- Original Issue: PR #11 Code Review (Security Audit)
