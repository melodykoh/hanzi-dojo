---
status: complete
priority: p2
issue_id: "046"
tags: [operations, documentation, migrations, disaster-recovery]
dependencies: []
---

# No Rollback Documentation for Migration 016

## Problem Statement
Migration 016 has no documented rollback procedure. Backup tables exist but no instructions on how to use them for recovery. Migration 011e included rollback guidance but 016 does not.

## Findings
- Location: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql` (missing section)
- Backup tables created: `dictionary_entries_backup_016`, `readings_backup_016`
- No documented procedure to restore from backups
- Comparison: Migration 011e footer includes "ROLLBACK: If needed, restore from backup"

## Proposed Solutions

### Option 1: Add Rollback Section to Migration Footer
- **Pros**: Self-documenting, found with migration file
- **Cons**: Migration already deployed (would need new migration or doc update)
- **Effort**: Small (30 minutes)
- **Risk**: Low

### Option 2: Document in DICTIONARY_MIGRATION_GUIDE.md
- **Pros**: Centralized operations docs, applies to all migrations
- **Cons**: Separate from migration file
- **Effort**: Small (30 minutes)
- **Risk**: Low

Rollback procedure:
```sql
-- 1. Drop the constraint first
ALTER TABLE dictionary_entries DROP CONSTRAINT IF EXISTS single_char_single_pronunciation;

-- 2. Restore dictionary entries from backup
DELETE FROM dictionary_entries WHERE simp IN (SELECT simp FROM dictionary_entries_backup_016);
INSERT INTO dictionary_entries SELECT * FROM dictionary_entries_backup_016;

-- 3. Restore readings from backup
UPDATE readings r
SET zhuyin = b.zhuyin
FROM readings_backup_016 b
WHERE r.id = b.id;

-- 4. Verify rollback
SELECT COUNT(*) FROM dictionary_entries WHERE char_length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;
-- Should return 68 (original malformed count)
```

## Recommended Action
Add rollback procedure to `/docs/operational/DICTIONARY_MIGRATION_GUIDE.md` under a new "Rollback Procedures" section.

## Technical Details
- **Affected Files**: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`
- **Related Components**: Supabase migrations
- **Database Changes**: No (documentation only)

## Resources
- Original finding: PR #30 Code Review (pattern-recognition-specialist)
- Reference: Migration 011e rollback pattern

## Acceptance Criteria
- [x] Rollback procedure documented
- [x] Includes all 4 steps: drop constraint, restore dictionary, restore readings, verify
- [x] Added to DICTIONARY_MIGRATION_GUIDE.md

## Work Log

### 2025-12-15 - Resolved
**By:** Claude Code
**Actions:**
- Added "Rollback Procedures" section to DICTIONARY_MIGRATION_GUIDE.md
- Documented Migration 016 specific rollback steps
- Added general rollback template for future migrations
- Updated "Future Improvements" to mark rollback strategy as done

**Files Changed:**
- `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` (updated)

### 2025-12-15 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready

**Learnings:**
- All data migrations should include rollback procedures
- Backup tables are useless without documented recovery steps

## Notes
Source: PR #30 Code Review Triage - 2025-12-15
