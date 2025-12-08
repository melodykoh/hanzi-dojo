---
status: complete
priority: p1
issue_id: "028"
tags: [code-review, data-integrity, migration, pr-24]
dependencies: []
---

# P1: GET DIAGNOSTICS Returns Wrong Row Count in Migration 011e

## Problem Statement

Migration 011e has a critical bug where `GET DIAGNOSTICS ROW_COUNT` captures the result of the wrong statement. The diagnostic reports 0 readings updated regardless of actual changes, preventing operators from verifying the migration succeeded.

**Why it matters:** Silent data modification without proper verification. Operators won't know if user data was actually modified, making post-migration validation impossible.

## Findings

**Location:** `supabase/migrations/011e_fix_malformed_zhuyin.sql` (Lines 348-350)

**Current Code:**
```sql
DO $$
DECLARE
  remaining_malformed INT;
  readings_updated INT;
BEGIN
  SELECT COUNT(*) INTO remaining_malformed  -- ← This becomes ROW_COUNT
  FROM dictionary_entries
  WHERE length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  GET DIAGNOSTICS readings_updated = ROW_COUNT;  -- ← Gets COUNT result, NOT UPDATE result!
  RAISE NOTICE 'Updated % user readings...', readings_updated;
END $$;
```

**Problem:** `GET DIAGNOSTICS ROW_COUNT` captures the row count from the **last executed statement**, which is the `SELECT COUNT(*)`, not the `UPDATE readings` statement executed earlier (lines 314-326).

**Agent:** data-integrity-guardian

## Proposed Solutions

### Option 1: Move GET DIAGNOSTICS immediately after UPDATE (Recommended)
**Pros:** Direct fix, clear causality
**Cons:** Requires restructuring DO block
**Effort:** Small (15 min)
**Risk:** Low

```sql
-- Execute UPDATE
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp
WHERE r.entry_id = e.id
  AND e.simp IN (...);

-- Capture row count IMMEDIATELY after UPDATE
DO $$
DECLARE
  readings_updated INT;
BEGIN
  GET DIAGNOSTICS readings_updated = ROW_COUNT;
  RAISE NOTICE 'Updated % user readings to use new primary pronunciations', readings_updated;
END $$;

-- THEN do the malformed verification separately
DO $$
DECLARE
  remaining_malformed INT;
BEGIN
  SELECT COUNT(*) INTO remaining_malformed
  FROM dictionary_entries
  WHERE length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

  IF remaining_malformed > 0 THEN
    RAISE WARNING 'Still have % malformed entries', remaining_malformed;
  ELSE
    RAISE NOTICE 'SUCCESS: All malformed entries fixed';
  END IF;
END $$;
```

### Option 2: Use RETURNING clause with count
**Pros:** Single statement captures count
**Cons:** More complex SQL
**Effort:** Medium (30 min)
**Risk:** Low

## Recommended Action

Use Option 1: Move GET DIAGNOSTICS immediately after UPDATE statement, before the verification DO block. This is a direct fix with minimal risk.

## Technical Details

**Affected Files:**
- `supabase/migrations/011e_fix_malformed_zhuyin.sql`

**Components Affected:**
- Migration verification logic
- Production deployment readiness

**Database Changes:**
- No schema changes, only migration script fix

## Acceptance Criteria

- [ ] GET DIAGNOSTICS captures actual UPDATE row count
- [ ] RAISE NOTICE shows correct number of updated readings
- [ ] Migration can be verified via output logs
- [ ] Test with local Supabase before production deployment

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | data-integrity-guardian identified bug |
| 2025-12-07 | **Approved for work** | Triage approved - P1 critical, must fix before merge |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Issue #23: https://github.com/melodykoh/hanzi-dojo/issues/23
- PostgreSQL GET DIAGNOSTICS: https://www.postgresql.org/docs/current/plpgsql-statements.html#PLPGSQL-STATEMENTS-DIAGNOSTICS
