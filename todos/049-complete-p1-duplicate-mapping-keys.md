---
status: complete
priority: p1
issue_id: "049"
tags: [data-integrity, migration-safety, sql]
dependencies: []
---

# Duplicate Mapping Keys Will Cause Scalar Subquery Runtime Error

## Problem Statement
Three duplicate `simp` keys exist in the Step 1 word_mappings CTE: `转运` (lines 340, 353), `财会` (lines 155, 481), and `当时` (lines 68, 188). Step 1's scalar subquery `SELECT wm.trad FROM word_mappings wm WHERE wm.simp = cw_text` returns multiple rows for duplicate keys, causing Postgres error: "more than one row returned by a subquery used as an expression."

## Findings
- Location: `supabase/migrations/20260216000001_fix_simplified_context_words.sql:68,155,188,340,353,481`
- Duplicate entries: `转运/轉運`, `财会/財會`, `当时/當時` — each appears twice under different comment sections
- Step 1 scalar subquery will hard-fail on any row containing these words
- Step 2 LEFT JOIN would silently duplicate array entries
- Migration was already deployed successfully — either no rows contained these words, or deployed SQL differed

## Proposed Solutions

### Option 1: Deduplicate VALUES list in both CTEs
- **Pros**: Minimal change, fixes the bug
- **Cons**: Still has ~500 lines of duplicated CTE between Step 1 and Step 2
- **Effort**: Small (< 30 minutes)
- **Risk**: Low

## Recommended Action
Remove duplicate entries from both Step 1 and Step 2 CTEs. Run a uniqueness check across the full VALUES list to catch any additional duplicates beyond the 3 identified.

## Technical Details
- **Affected Files**: `supabase/migrations/20260216000001_fix_simplified_context_words.sql`
- **Related Components**: dictionary_entries, readings tables
- **Database Changes**: Yes — migration file correction (already deployed, this is for repo record)

## Resources
- Original finding: PR #52 review — data-integrity-guardian, data-migration-expert, kieran-typescript-reviewer (3 agents converged)
- Related issues: #36

## Acceptance Criteria
- [ ] No duplicate `simp` keys in Step 1 CTE
- [ ] No duplicate `simp` keys in Step 2 CTE
- [ ] Full uniqueness check run against VALUES list
- [ ] Migration file is safe to re-run (idempotent)

## Work Log

### 2026-02-17 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status changed from pending → ready
- Ready to be picked up and worked on

**Learnings:**
- 3 of 5 review agents independently found the same duplicate-key bug — high confidence finding
- Migration already deployed, so this is a repo-record fix

## Notes
Source: Triage session on 2026-02-17 (PR #52 simple-pr-review)
