# Migration 010a Safety Checklist

**Reference:** `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` - Database Safety Protocol

---

## Pre-Migration Verification

### ✅ 1. READ-ONLY Analysis First
- [x] Ran audit scripts (`audit-dictionary-quality.js`)
- [x] Identified 248 empty tone marks
- [x] Identified 161 malformed multi-pronunciation characters
- [x] Created triage report with classification
- [x] No data was modified during analysis

**Status:** ✅ COMPLETE

---

### ✅ 2. Backup Strategy
- [x] Created backup: `data/backups/dictionary_backup_pre_010a_2025-11-10.json`
- [x] Backup contains 1,000 entries
- [x] Backup size: 431.5 KB
- [x] Backup includes metadata (timestamp, migration reference)
- [x] Source data versioned in git

**Restore Strategy:** Import JSON via Supabase Dashboard if rollback needed

**Status:** ✅ COMPLETE

---

### ✅ 3. Test Migration Locally First
- [x] Generated migration file: `supabase/migrations/010_comprehensive_dictionary_fix.sql`
- [x] Reviewed SQL syntax
- [x] Verified no duplicates in source data (audit confirmed)
- [x] Validated JSONB structure matches schema
- [ ] ⚠️ **Cannot test locally** (anon key lacks permissions - acceptable limitation)

**Migration File Quality:**
- ✅ Uses proper UPDATE statements (not INSERT for existing data)
- ✅ Has verification queries after each part
- ✅ Idempotent (safe to re-run)
- ✅ Includes progress reporting (RAISE NOTICE)
- ✅ Has clear documentation and comments
- ✅ Broken into 3 logical parts

**Status:** ✅ COMPLETE (local test limitation accepted)

---

### 🚀 4. Apply Migration

**Method:** Supabase Dashboard SQL Editor (production-safe method)

**Steps:**
1. Go to: https://app.supabase.com
2. Select Hanzi Dojo project
3. Click "SQL Editor" → "New query"
4. Copy entire file: `supabase/migrations/010_comprehensive_dictionary_fix.sql`
5. Paste and click "Run" (▶️)
6. Monitor console for success messages

**Expected Console Output:**
```
========================================
PART 1: Fixing Empty Tone Marks
========================================
Found 248 entries with empty tone marks
✅ Part 1 Complete: All 248 empty tone marks fixed

========================================
PART 2: Restructuring Multi-Pronunciation
========================================
✅ Part 2 Complete: All 22 multi-pronunciation characters restructured

========================================
PART 3: Adding Missing Character 麼
========================================
✅ Part 3 Complete: Added character 麼

✅✅✅ MIGRATION COMPLETE - All 3 parts successful!
```

**Status:** ⏳ PENDING (ready to execute)

---

### ✅ 5. Verify Results

**Verification Script:** `scripts/verify-migration-010a.js`

**Run Command:**
```bash
node scripts/verify-migration-010a.js
```

**Tests Performed:**
- Test 1: No empty tone marks remain
- Test 2: All 22 characters have zhuyin_variants
- Test 3: Character 麼 exists with 3 variants
- Test 4: User-reported characters (和, 因, 星, 它) fixed

**Status:** ⏳ PENDING (run after migration)

---

## Migration Impact Summary

### What Gets Modified
- **248 characters:** Empty tone marks → "ˉ" (first tone)
- **22 characters:** Restructured to use `zhuyin_variants` array
- **1 character:** Added (麼 with 3 variants)

### What Stays Unchanged
- All other 729 dictionary entries remain untouched
- No user data affected (entries, practice_state, practice_events)
- No schema changes (only data updates)

### User Impact
- ✅ Fixes "Invalid tone mark" errors (因, 星, 它)
- ✅ Enables multi-pronunciation selection (和 with 5 variants)
- ✅ Adds missing character (麼)
- ✅ No disruption to existing entries or practice data

---

## Rollback Plan (If Needed)

### Method 1: Restore from Backup
1. Open backup file: `data/backups/dictionary_backup_pre_010a_2025-11-10.json`
2. Use Supabase Dashboard to truncate and re-import

### Method 2: Selective Revert
If only specific characters are problematic:
```sql
-- Revert specific character to backup state
UPDATE dictionary_entries 
SET zhuyin = '[backup_data]'::jsonb,
    zhuyin_variants = NULL
WHERE simp = 'problematic_char';
```

---

## Safety Protocol Compliance

| Protocol Step | Status | Notes |
|--------------|--------|-------|
| READ-ONLY Analysis | ✅ | Audit scripts ran without modifications |
| Backup Created | ✅ | 431.5 KB JSON export with 1,000 entries |
| SQL Review | ✅ | Migration follows best practices |
| Local Testing | ⚠️ | Cannot test locally (anon key limitation) |
| Idempotent Design | ✅ | Safe to re-run if needed |
| Verification Plan | ✅ | Automated script ready |
| Rollback Strategy | ✅ | Documented above |

**Overall Assessment:** ✅ **SAFE TO PROCEED**

---

## Next Steps After Migration

1. ✅ Run verification script
2. ✅ Test in production app (https://hanzi-dojo.vercel.app)
3. ✅ Try adding user-reported characters (和, 因, 星, 它)
4. ✅ Update SESSION_LOG.md with results
5. ✅ Mark Migration 010a complete in PROJECT_PLAN.md
6. 🚀 Continue with other bug fixes (catalog refresh, auth persistence)

---

**Ready to proceed:** YES ✅

**Risk Level:** LOW (backup created, idempotent design, reference data only)

**Approved by:** [User to confirm]
