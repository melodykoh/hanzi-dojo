---
status: complete
priority: p2
issue_id: "051"
tags: [code-simplicity, migration-safety, sql]
dependencies: ["049", "050"]
---

# ~500 Lines of Duplicated CTE VALUES Between Step 1 and Step 2

## Problem Statement
The entire `word_mappings` CTE (~500 lines of VALUES) is copy-pasted verbatim for Step 2 because CTEs in separate SQL statements can't share definitions. If a mapping needs correction, both copies must stay in sync. The duplicate-key bug (#049) already demonstrated this is error-prone.

## Findings
- Location: `supabase/migrations/20260216000001_fix_simplified_context_words.sql:580+`
- Step 2 CTE is a verbatim copy of Step 1 CTE (~500 lines)
- Comment at line 663 acknowledges: "Same mapping as Step 1 (duplicated for separate CTE scope)"
- Estimated 65% file size reduction by consolidating
- Duplicate keys (#049) were introduced precisely because of this duplication

## Proposed Solutions

### Option 1: Replace both CTEs with a single temp table
- **Pros**: Single source of truth, eliminates ~500 lines, both steps atomic in one transaction
- **Cons**: Slightly different SQL pattern (temp table vs CTE)
- **Effort**: Small (< 1 hour)
- **Risk**: Low — migrations already run with BEGIN/COMMIT in Supabase SQL Editor

```sql
BEGIN;
CREATE TEMP TABLE word_mappings(simp TEXT, trad TEXT) ON COMMIT DROP;
INSERT INTO word_mappings(simp, trad) VALUES ...;
-- Step 1 UPDATE using word_mappings ...
-- Step 2 UPDATE using word_mappings ...
COMMIT;
```

## Recommended Action
Consolidate into temp table approach. Do this in the same pass as #049 (dedup) and #050 (ordering) since all three touch the same migration file.

## Technical Details
- **Affected Files**: `supabase/migrations/20260216000001_fix_simplified_context_words.sql`
- **Related Components**: dictionary_entries, readings tables
- **Database Changes**: Yes — migration file restructure (already deployed, repo record fix)

## Resources
- Original finding: PR #52 review — code-simplicity-reviewer, kieran-typescript-reviewer
- Related issues: #36, #049, #050

## Acceptance Criteria
- [ ] Single word_mappings definition (temp table or equivalent)
- [ ] Both Step 1 and Step 2 reference the same mapping source
- [ ] File size reduced by ~500 lines
- [ ] BEGIN/COMMIT wrapper included in file
- [ ] Migration still idempotent and safe to re-run

## Work Log

### 2026-02-17 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: ready
- Depends on #049 and #050 (all three should be done in one pass)

**Learnings:**
- CTE duplication directly caused the duplicate-key bug in #049
- Temp table pattern is natural fit for Supabase SQL Editor workflow

## Notes
Source: Triage session on 2026-02-17 (PR #52 simple-pr-review)
