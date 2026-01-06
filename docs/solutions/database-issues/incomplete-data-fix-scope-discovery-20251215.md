---
date: 2025-12-15
problem_type: database_issue
component: migration
symptoms:
  - "CHECK constraint violation when running migration"
  - "Initial investigation found 11 malformed entries, actual count was 68"
  - "Document-based research missed majority of affected data"
root_cause: investigation_methodology
severity: moderate
tags: [migration, data-integrity, investigation-methodology, check-constraint]
related_issues:
  - "Issue #20: Original malformed zhuyin bug report"
  - "PR #24: Previous fix that addressed only 43 characters"
  - "PR #30: Complete fix for all 68 characters"
---

# Incomplete Data Fix Scope Discovery

## Problem Summary

When fixing malformed `zhuyin` data in `dictionary_entries`, initial investigation identified only 11 affected characters. Running the migration with a CHECK constraint revealed the actual scope was **68 characters** — a 6x undercount.

## Observable Symptoms

1. **Migration failure:**
   ```
   Error: check constraint "single_char_single_pronunciation" of relation
   "dictionary_entries" is violated by some row
   ```

2. **User-visible bug:** Drill A showed merged pronunciations like "ㄎㄜˇ ㄎㄜˋ" instead of single "ㄎㄜˇ"

## Investigation Steps

### What Was Done (Incorrect Approach)

1. Read Issue #20 description for reported characters
2. Read PR #24 description listing characters claimed to be fixed
3. Compared PR description to actual Migration 011e SQL
4. Found 11 characters in docs but missing from SQL
5. Wrote migration to fix those 11 characters
6. Added CHECK constraint for data integrity

### Why It Failed

The CHECK constraint attempted to enforce:
```sql
CHECK (char_length(simp) > 1 OR jsonb_array_length(zhuyin) = 1)
```

This revealed 68 rows violating the constraint, not 11.

**Root cause of undercount:** Document-based research only captured characters that were *explicitly mentioned* in issues and PRs. The actual bug (Migration 009 storing all pronunciations in main array) affected ALL multi-pronunciation characters imported from CC-CEDICT.

## Root Cause Analysis

**Primary issue:** Relying on documentation instead of querying actual data.

**Technical explanation:**
- Migration 009 processed all multi-pronunciation characters from CC-CEDICT
- It stored every pronunciation variant in the main `zhuyin` array
- Migration 011e fixed only 43 of these characters
- The remaining 68 characters were never mentioned in any issue or PR

**The investigation assumed:** Characters mentioned in docs = all affected characters

**Reality:** Docs only mentioned characters users reported or developers noticed

## Working Solution

### Correct Diagnostic Query (Should Have Run First)

```sql
SELECT simp, trad, zhuyin
FROM dictionary_entries
WHERE char_length(simp) = 1
  AND jsonb_array_length(zhuyin) > 1;
```

This query identifies ALL single-character entries with multiple syllables — the complete scope of the problem.

### Migration Fix

Updated Migration 016 to fix all 68 characters:
- 68 UPDATE statements (primary pronunciation by HSK frequency)
- Backup tables for safety
- Cascade fix to user `readings` table
- CHECK constraint to prevent future malformed data
- Self-verification query

**File:** `supabase/migrations/016_fix_remaining_malformed_zhuyin.sql`

## Prevention Strategies

### 1. Query Before Writing Fixes

**Rule:** For any data fix, run a diagnostic query to determine full scope BEFORE writing the migration.

```sql
-- Generic pattern: count all rows that would violate the constraint you plan to add
SELECT COUNT(*) FROM [table]
WHERE [condition that defines "malformed"];
```

### 2. Test Constraints Before Applying

Add constraints in a separate transaction to validate they pass:

```sql
-- Dry run: will fail if any rows violate
BEGIN;
ALTER TABLE dictionary_entries
ADD CONSTRAINT test_constraint
CHECK (char_length(simp) > 1 OR jsonb_array_length(zhuyin) = 1);
ROLLBACK;  -- See if it fails without committing
```

### 3. Don't Trust Documentation Alone

Documentation captures what was discussed, not what exists. For data integrity issues:
- Documentation = starting point for understanding
- Database queries = source of truth for scope

## Key Insight

> **Verify assumptions against real data, not documentation.**
>
> Documentation tells you what people noticed.
> Database queries tell you what actually exists.

The CHECK constraint accidentally became the diagnostic tool it should have been from the start. Design migrations with constraints that reveal problems rather than assuming you know the full scope.

## Cross-References

- **Migration 016:** Complete fix for 68 characters
- **Migration 011e:** Previous partial fix (43 characters)
- **Migration 009:** Original source of malformed data
- **PR #30:** https://github.com/melodykoh/hanzi-dojo/pull/30

## Characters Affected

Full list of 68 characters with malformed zhuyin:

化, 匙, 区, 占, 卡, 压, 句, 可, 台, 各, 合, 否, 吧, 呀, 咖, 咳, 填, 夫, 奇, 妻, 孙, 底, 度, 弄, 思, 愉, 戏, 打, 择, 拾, 排, 散, 景, 服, 条, 查, 校, 椅, 汗, 汤, 沙, 济, 父, 片, 甚, 疑, 研, 硕, 票, 禁, 稍, 约, 肚, 胳, 膏, 苹, 被, 观, 论, 语, 谁, 责, 赚, 趟, 趣, 跳, 钢
