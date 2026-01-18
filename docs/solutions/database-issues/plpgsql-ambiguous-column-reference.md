---
title: "PL/pgSQL Ambiguous Column Reference in RETURNS TABLE Functions"
slug: plpgsql-ambiguous-column-reference
category: database-issues
tags:
  - supabase
  - rpc
  - plpgsql
  - postgres
  - ambiguous-column
  - drill-c
severity: critical
component: get_eligible_word_pairs RPC
date_solved: 2026-01-18
related_issues:
  - "#37"
  - "#39"
  - "#40"
related_migrations:
  - "20260112000002_fix_rpc_ambiguous_column.sql"
  - "20260117000001_drill_c_char1_required.sql"
  - "20260118000001_fix_rpc_ambiguous_column_again.sql"
---

# PL/pgSQL Ambiguous Column Reference in RETURNS TABLE Functions

## Problem Symptom

**Observable Behavior:**
- Drill C completely disappeared from Dashboard Drill Proficiency Overview
- Training modal showed "No items available for practice" for ALL drills
- Dashboard still showed correct counts (159 items Drill A, 42 items Drill B)

**Error Message (from RPC call):**
```
ERROR: 42702: column reference "id" is ambiguous
DETAIL: It could refer to either a PL/pgSQL variable or a table column.
QUERY: NOT EXISTS (
    SELECT 1 FROM kids
    WHERE id = p_kid_id
    AND owner_id = auth.uid()
  )
CONTEXT: PL/pgSQL function get_eligible_word_pairs(uuid) line 4 at IF
```

## Investigation Steps

### Initial Hypothesis (Disproven)
Suspected the char1-only filter (PR #39) was too restrictive, resulting in fewer than 5 eligible word pairs.

**Why it seemed plausible:** The migration changed filter from `(char1 OR char2)` to just `char1`.

**Why user pushed back:** With 159 learned characters, there should be plenty of word pairs where char1 is known.

### Diagnostic Queries (via Supabase MCP)

```sql
-- Query 1: Verify learned character count
SELECT COUNT(*) FROM entries WHERE kid_id = 'xxx';
-- Result: 159 ✓

-- Query 2: Count eligible pairs with char1-only filter
SELECT COUNT(*) as eligible_pairs FROM word_pairs wp
JOIN dictionary_entries d1 ON d1.trad = wp.char1
JOIN dictionary_entries d2 ON d2.trad = wp.char2
WHERE EXISTS (
  SELECT 1 FROM entries e
  WHERE e.kid_id = 'xxx' AND e.trad = wp.char1
);
-- Result: 201 (way above 5 minimum) ✓

-- Query 3: Test actual RPC function
SELECT * FROM get_eligible_word_pairs('xxx') LIMIT 5;
-- Result: ERROR: column reference "id" is ambiguous ✗
```

**Conclusion:** Data was fine. The RPC function itself was throwing an error.

## Root Cause

Migration `20260117000001_drill_c_char1_required.sql` re-introduced a bug that was previously fixed in `20260112000002_fix_rpc_ambiguous_column.sql`.

### The Ambiguity Problem

In PL/pgSQL functions with `RETURNS TABLE`, the OUT parameter names become variables in the function scope:

```sql
CREATE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
RETURNS TABLE (
  id uuid,           -- ← This creates a variable named 'id'
  word text,
  ...
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM kids
    WHERE id = p_kid_id  -- ← Is this 'kids.id' or the OUT param 'id'?
  )
```

PostgreSQL cannot determine if `id` refers to:
1. The `kids.id` table column
2. The `id` OUT parameter from `RETURNS TABLE`

### Why This Broke Everything

The frontend's `DrillSelectionModal` uses `Promise.all`:

```typescript
const [rec, eligiblePairs] = await Promise.all([
  recommendDrill(kidId),
  fetchEligibleWordPairs(kidId)  // ← This throws
])
```

When `fetchEligibleWordPairs` throws, the entire Promise.all fails, and the catch block only logs the error without setting any drill info. Result: "No items available" for ALL drills.

## Solution

### Fix Migration: Use Explicit Table Aliases

```sql
-- Before (buggy)
IF NOT EXISTS (
  SELECT 1 FROM kids
  WHERE id = p_kid_id
  AND owner_id = auth.uid()
)

-- After (fixed)
IF NOT EXISTS (
  SELECT 1 FROM kids k
  WHERE k.id = p_kid_id
  AND k.owner_id = auth.uid()
)
```

### Also Use Explicit Column Aliases in SELECT

```sql
-- Before
SELECT DISTINCT
  wp.id,
  wp.word,
  ...

-- After
SELECT DISTINCT
  wp.id AS id,
  wp.word AS word,
  ...
```

## Prevention Strategies

### 1. SQL Migration Checklist
When writing PL/pgSQL functions that use `RETURNS TABLE`:
- [ ] Use explicit table aliases in ALL queries (e.g., `k.id` not `id`)
- [ ] Use explicit column aliases in SELECT (e.g., `wp.id AS id`)
- [ ] Test the function directly in Supabase SQL Editor before deploying

### 2. Code Review Pattern to Watch For

```sql
-- RED FLAG: Bare column name in RETURNS TABLE function
WHERE id = p_kid_id

-- GREEN: Explicit table alias
WHERE k.id = p_kid_id
```

### 3. Testing Protocol
Before deploying any RPC migration:
```sql
-- Always test with a real kid_id
SELECT * FROM function_name('actual-uuid') LIMIT 1;
```

### 4. Consider Linting
Future enhancement: Add a pre-commit hook or CI check to lint SQL migrations for bare column names in PL/pgSQL functions.

## Code Examples

### Complete Fixed Function

```sql
CREATE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
RETURNS TABLE (
  id uuid,
  word text,
  char1 text,
  char1_zhuyin jsonb,
  char2 text,
  char2_zhuyin jsonb,
  category text
) AS $$
BEGIN
  -- Use table alias 'k' to avoid ambiguity with OUT param 'id'
  IF NOT EXISTS (
    SELECT 1 FROM kids k
    WHERE k.id = p_kid_id
    AND k.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: kid not owned by caller';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    wp.id AS id,          -- Explicit alias
    wp.word AS word,
    wp.char1 AS char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2 AS char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category AS category
  FROM word_pairs wp
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND e.trad = wp.char1
    AND (
      e.locked_reading_id IS NULL
      OR r.context_words IS NULL
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
```

## Related Documentation

- [PostgreSQL PL/pgSQL Variable Substitution](https://www.postgresql.org/docs/current/plpgsql-implementation.html#PLPGSQL-VAR-SUBST)
- Migration `20260112000002`: First fix for this bug
- Migration `20260118000001`: Second fix (this incident)
- PR #40: https://github.com/melodykoh/hanzi-dojo/pull/40

## Lesson Learned

**This bug was fixed once before and re-introduced.**

When modifying existing RPC functions, review the entire function for patterns that were intentionally added. The explicit `k.` alias wasn't accidental - it was a fix for a known PostgreSQL ambiguity issue.

Consider adding a comment explaining non-obvious patterns:
```sql
-- IMPORTANT: Use table alias 'k.id' not bare 'id' to avoid
-- ambiguity with RETURNS TABLE OUT parameter. See Issue #40.
```
