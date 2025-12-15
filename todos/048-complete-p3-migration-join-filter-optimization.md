---
status: complete
priority: p3
issue_id: "048"
tags: [performance, migrations, best-practices, sql]
dependencies: []
---

# Performance - Missing Filter in Cascade JOIN

## Problem Statement
The cascade UPDATE in Migration 016 joins on dictionary_entries without filtering by `char_length(d.simp) = 1`. Adding this filter reduces join candidates from 1000 to 600 rows (~40% improvement).

## Findings
- Location: `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql:248-253`
- Current JOIN scans all 1000 dictionary entries
- Only 600 are single-character entries (relevant to this migration)
- Missing filter causes unnecessary comparisons
- Impact: ~20ms savings (50ms → 30ms) - minor but good practice

## Proposed Solutions

### Option 1: Document Best Practice for Future Migrations
- **Pros**: Improves future migration performance
- **Cons**: Current migration already run (no fix needed)
- **Effort**: Small (15 minutes)
- **Risk**: Low

Pattern to document:
```sql
-- When updating readings based on dictionary changes,
-- filter BOTH sides of the JOIN for better performance

UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp AND e.trad = d.trad
WHERE r.entry_id = e.id
  AND char_length(e.simp) = 1     -- Filter on entries
  AND char_length(d.simp) = 1;    -- Filter on dictionary (ADD THIS)
```

## Recommended Action
Add to DICTIONARY_MIGRATION_GUIDE.md under performance tips. Note: Current migration already executed successfully.

## Technical Details
- **Affected Files**: `docs/operational/DICTIONARY_MIGRATION_GUIDE.md`
- **Related Components**: Future cascade UPDATE migrations
- **Database Changes**: No

## Resources
- Original finding: PR #30 Code Review (performance-oracle)

## Acceptance Criteria
- [x] Performance tip documented in DICTIONARY_MIGRATION_GUIDE.md
- [x] Example SQL shows both-side filtering pattern

## Work Log

### 2025-12-15 - Resolved
**By:** Claude Code
**Actions:**
- Added "JOIN Filter Optimization" section to DICTIONARY_MIGRATION_GUIDE.md
- Documented pattern with SQL example showing both-side filtering
- Noted ~40% performance improvement (1000 → 600 rows)

**Files Changed:**
- `docs/operational/DICTIONARY_MIGRATION_GUIDE.md` (updated)

### 2025-12-15 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready

**Learnings:**
- Filter both sides of JOINs when possible to reduce scan candidates

## Notes
Source: PR #30 Code Review Triage - 2025-12-15
