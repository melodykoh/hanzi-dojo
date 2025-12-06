---
status: ready
priority: p3
issue_id: "011"
tags: [deployment, database, migration, pr-19]
dependencies: ["009", "010"]
---

# Run Migration 014 in Supabase After PR Merge

## Problem Statement
Migration 014 adds the missing 4th tone pronunciation for 处/處. The migration file is approved and production-ready, but must be manually executed in Supabase SQL Editor after PR #19 merges.

## Findings
- **Location:** `supabase/migrations/014_chu_multi_pronunciation.sql`
- **Status:** Migration file reviewed and approved by Data Integrity Guardian
- **Content:** Adds zhuyin_variants with both chǔ (3rd tone) and chù (4th tone)
- **Safety:** Transaction-wrapped, has safety checks and rollback script

## Proposed Solutions

### Option 1: Manual execution in Supabase SQL Editor (Recommended)
1. Open Supabase Dashboard > SQL Editor
2. Copy contents of `014_chu_multi_pronunciation.sql`
3. Execute the migration
4. Verify success with query below

- **Pros**: Standard deployment process, verified approach
- **Cons**: Manual step required
- **Effort**: Small (< 5 minutes)
- **Risk**: Low (migration has safety checks)

## Recommended Action
After PR #19 merges:
1. Run migration 014 in Supabase SQL Editor
2. Verify with: `SELECT simp, zhuyin_variants FROM dictionary_entries WHERE simp = '处';`
3. Test Drill A accepts both chǔ and chù for 处

## Technical Details
- **Affected Files**: `supabase/migrations/014_chu_multi_pronunciation.sql`
- **Related Components**: dictionary_entries table, Drill A
- **Database Changes**: Yes - updates zhuyin_variants for 处/處

## Verification Query
```sql
SELECT
  simp,
  trad,
  zhuyin_variants,
  jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE simp = '处' AND trad = '處';
```

Expected result: `variant_count = 2` (chǔ and chù)

## Resources
- Migration file: `supabase/migrations/014_chu_multi_pronunciation.sql`
- PR #19: https://github.com/melodykoh/hanzi-dojo/pull/19
- Issue #18: Missing 4th tone for 处

## Acceptance Criteria
- [ ] Migration 014 executed successfully in Supabase
- [ ] Verification query shows 2 variants for 处
- [ ] Drill A accepts both chǔ and chù pronunciations
- [ ] No errors in Supabase logs

## Work Log

### 2025-12-06 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Migration reviewed and approved during PR #19 code review
- Marked as post-merge deployment task
- Depends on PR merge (issues 009, 010)

**Learnings:**
- Always run migrations after code deployment
- Verify database changes with SELECT query

## Notes
Source: Triage session on 2025-12-06
PR: #19 (fix/issue18-chu-pronunciation)
Execute AFTER PR merges to main
