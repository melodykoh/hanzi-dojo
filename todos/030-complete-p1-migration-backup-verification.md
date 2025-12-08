---
status: complete
priority: p1
issue_id: "030"
tags: [code-review, data-integrity, migration, pr-24]
dependencies: []
---

# P1: No Pre-Migration Backup Verification

## Problem Statement

Migration 011e modifies both `dictionary_entries` (43 rows) and `readings` (user data) but has no verification that backups exist before proceeding. Operators might run the migration without taking backups, losing the ability to rollback if issues arise.

**Why it matters:** Irreversible data modification. The migration comment states "This migration cannot be easily rolled back" but doesn't enforce backup existence.

## Findings

**Location:** `supabase/migrations/011e_fix_malformed_zhuyin.sql` (Lines 1-22, 359-362)

**Current State:**
```sql
BEGIN;

-- No backup verification here - migration proceeds immediately

-- ... 350 lines of updates ...

COMMIT;

-- ROLLBACK: If needed, restore from backup (data/backups/)
-- This migration cannot be easily rolled back as it modifies dictionary data.
-- Recommend taking a backup before running: pg_dump -t dictionary_entries
```

**Problems:**
1. No enforcement of backup existence
2. Rollback comment only mentions `dictionary_entries`, not `readings`
3. No documented rollback procedure for user data

**Agent:** data-integrity-guardian

## Proposed Solutions

### Option 1: Add backup verification check (Recommended)
**Pros:** Prevents accidental data loss, enforces operational discipline
**Cons:** Requires operator to create backup tables first
**Effort:** Small (15 min)
**Risk:** Low

```sql
BEGIN;

-- ============================================================================
-- SAFETY CHECK: Verify backup exists before proceeding
-- ============================================================================
DO $$
DECLARE
  has_dict_backup BOOLEAN;
  has_readings_backup BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'dictionary_entries_backup_011e'
  ) INTO has_dict_backup;

  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'readings_backup_011e'
  ) INTO has_readings_backup;

  IF NOT has_dict_backup OR NOT has_readings_backup THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Backups not found. Create them first:
      CREATE TABLE dictionary_entries_backup_011e AS SELECT * FROM dictionary_entries;
      CREATE TABLE readings_backup_011e AS SELECT * FROM readings;';
  ELSE
    RAISE NOTICE 'Backups verified - proceeding with migration';
  END IF;
END $$;

-- ... rest of migration ...
```

### Option 2: Add comprehensive rollback script
**Pros:** Provides recovery path if issues arise
**Cons:** Still doesn't prevent running without backup
**Effort:** Medium (30 min)
**Risk:** Low

```sql
-- At end of migration file, add:
/*
ROLLBACK SCRIPT (run ONLY if migration needs to be reverted):

-- Step 1: Restore dictionary entries
DROP TABLE IF EXISTS dictionary_entries;
ALTER TABLE dictionary_entries_backup_011e RENAME TO dictionary_entries;

-- Step 2: Restore user readings
UPDATE readings r
SET zhuyin = backup.zhuyin
FROM readings_backup_011e backup
WHERE r.id = backup.id;

-- Step 3: Verify restoration
SELECT COUNT(*) FROM readings r
JOIN readings_backup_011e b ON r.id = b.id
WHERE r.zhuyin::text != b.zhuyin::text;
-- Expected: 0 rows (all readings restored)

-- Step 4: Cleanup
DROP TABLE IF EXISTS readings_backup_011e;
*/
```

### Option 3: Document pre-migration checklist in file header
**Pros:** Clear operator guidance
**Cons:** Not enforced programmatically
**Effort:** Small (10 min)
**Risk:** Medium (operator might skip)

## Recommended Action

Use Option 1: Add backup verification DO block at the start of migration. Also add Option 2's rollback script as a comment at the end for documentation.

## Technical Details

**Affected Files:**
- `supabase/migrations/011e_fix_malformed_zhuyin.sql`

**Components Affected:**
- Migration deployment process
- Disaster recovery procedures

**Pre-Migration Commands:**
```sql
-- Operator must run before migration:
CREATE TABLE dictionary_entries_backup_011e AS SELECT * FROM dictionary_entries;
CREATE TABLE readings_backup_011e AS SELECT * FROM readings;
```

## Acceptance Criteria

- [ ] Migration verifies backup tables exist before proceeding
- [ ] Error message provides exact CREATE TABLE commands
- [ ] Rollback script documented for both dictionary and readings
- [ ] docs/operational/DICTIONARY_MIGRATION_GUIDE.md updated with backup requirements

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-12-07 | Created from PR #24 code review | data-integrity-guardian identified missing safeguard |
| 2025-12-07 | **Approved for work** | Triage approved - P1 critical, must fix before merge |

## Resources

- PR #24: https://github.com/melodykoh/hanzi-dojo/pull/24
- Migration guide: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`
- Supabase backup docs: https://supabase.com/docs/guides/platform/backups
