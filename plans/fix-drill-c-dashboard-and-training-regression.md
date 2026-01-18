# Investigate: Drill C Dashboard and Training Regression

**Issue:** GitHub Issue #40 (to be created)
**Type:** Bug Investigation (Critical Regression)
**Priority:** P0 - Production is broken
**Introduced:** Session 25 commit `255d45e` (Jan 17, 2026)

---

## 🐛 Problem Summary

After merging PR #39 ("Require char1 to be learned for Drill C word pairs"), two issues appeared:

1. **Drill C disappeared** from Dashboard Drill Proficiency Overview
2. **Training modal shows "No items available"** - ALL drills unavailable (not just Drill C)

---

## 🔬 Hypotheses to Validate

### Hypothesis A: Insufficient Word Pairs
The char1-required filter returns fewer than 5 eligible word pairs, causing Drill C to be hidden.

**User's skepticism:** With 159 learned characters (Drill A count), there should be enough word pairs where char1 is a known character.

### Hypothesis B: Cascading Error
The `get_eligible_word_pairs` RPC is throwing an error (not just returning empty), and this error cascades to break the entire DrillSelectionModal, hiding ALL drills.

**Evidence:** Screenshot shows "No items available for practice" even though Drill A has 159 items and Drill B has 42 items visible on the Dashboard.

---

## 📋 Validation Plan

### Step 1: Check RPC Directly in Supabase

Run diagnostic SQL queries directly in Supabase SQL Editor to isolate database vs frontend issues.

```sql
-- Query 1: Get the kid_id for the active user
SELECT k.id as kid_id, k.name, p.email
FROM kids k
JOIN profiles p ON k.owner_id = p.id
LIMIT 5;
```

```sql
-- Query 2: Count learned characters (should match Dashboard's 159)
SELECT COUNT(*) as learned_count
FROM entries
WHERE kid_id = 'YOUR_KID_ID_HERE';
```

```sql
-- Query 3: Test the RPC function directly (as service role)
-- This bypasses auth to test the SQL logic
SELECT COUNT(*) as eligible_pairs
FROM word_pairs wp
JOIN dictionary_entries d1 ON d1.trad = wp.char1
JOIN dictionary_entries d2 ON d2.trad = wp.char2
WHERE EXISTS (
  SELECT 1 FROM entries e
  LEFT JOIN readings r ON r.id = e.locked_reading_id
  WHERE e.kid_id = 'YOUR_KID_ID_HERE'
  AND e.trad = wp.char1  -- char1-only filter
  AND (
    e.locked_reading_id IS NULL
    OR r.context_words IS NULL
    OR wp.word = ANY(r.context_words)
  )
);
```

```sql
-- Query 4: Compare with original OR logic
SELECT COUNT(*) as eligible_pairs_or_logic
FROM word_pairs wp
JOIN dictionary_entries d1 ON d1.trad = wp.char1
JOIN dictionary_entries d2 ON d2.trad = wp.char2
WHERE EXISTS (
  SELECT 1 FROM entries e
  LEFT JOIN readings r ON r.id = e.locked_reading_id
  WHERE e.kid_id = 'YOUR_KID_ID_HERE'
  AND (e.trad = wp.char1 OR e.trad = wp.char2)  -- original OR logic
  AND (
    e.locked_reading_id IS NULL
    OR r.context_words IS NULL
    OR wp.word = ANY(r.context_words)
  )
);
```

**Expected Results:**
- Query 2 ≈ 159 (matches Dashboard)
- Query 3: If > 5, Hypothesis A is FALSE
- Query 3: If = 0, Hypothesis A is TRUE
- Query 4: Should be significantly higher than Query 3

### Step 2: Check Browser Console for Errors

1. Open production app: https://hanzi-dojo.vercel.app
2. Open DevTools → Console
3. Navigate to Dashboard
4. Click "Train" button
5. Look for:
   - Any red error messages
   - `[DrillSelectionModal]` or `[wordPairService]` log entries
   - Network tab: Check if `get_eligible_word_pairs` RPC returns error or empty

**If error found:** Hypothesis B is TRUE - cascading error
**If no error but empty result:** Hypothesis A is TRUE - data issue

### Step 3: Test RPC via Browser Console

In the browser console while logged in:

```javascript
// Get current user's kid_id from app state
// Then test RPC directly
const { data, error } = await supabase.rpc('get_eligible_word_pairs', {
  p_kid_id: 'YOUR_KID_ID_HERE'
});
console.log('Data:', data);
console.log('Error:', error);
console.log('Count:', data?.length);
```

**If error is not null:** RPC is failing (Hypothesis B)
**If data is empty array:** RPC succeeds but returns 0 (Hypothesis A)

### Step 4: Analyze char1 Distribution

If Hypothesis A is validated (insufficient pairs), understand why:

```sql
-- Which learned characters appear as char1 in word_pairs?
SELECT e.trad, COUNT(wp.id) as char1_word_pairs
FROM entries e
LEFT JOIN word_pairs wp ON wp.char1 = e.trad
WHERE e.kid_id = 'YOUR_KID_ID_HERE'
GROUP BY e.trad
ORDER BY char1_word_pairs DESC
LIMIT 20;
```

```sql
-- Total word_pairs in database
SELECT COUNT(*) FROM word_pairs;
```

```sql
-- How many unique char1 values exist in word_pairs?
SELECT COUNT(DISTINCT char1) FROM word_pairs;
```

---

## 🎯 Decision Tree Based on Findings

### If Hypothesis A is TRUE (Insufficient Pairs)

**Root cause:** char1-only filter is too restrictive for current word_pairs data

**Options:**
1. **Expand word_pairs table** - Add more pairs where common learned chars appear as char1
2. **Smart fallback** - If char1-only < 5, fall back to OR logic
3. **Lower threshold** - Reduce MIN_PAIRS_FOR_ROUND from 5 to 3
4. **Revert** - Go back to OR logic (loses UX improvement)

### If Hypothesis B is TRUE (Cascading Error)

**Root cause:** Error in word pair fetch breaks entire modal

**Fix:** Add error isolation in `DrillSelectionModal.tsx`:
```tsx
let wordPairCount = 0
try {
  const eligiblePairs = await fetchEligibleWordPairs(kidId)
  wordPairCount = eligiblePairs.length
} catch (error) {
  console.error('[DrillSelectionModal] Word pair fetch failed:', error)
  // Continue - Drill A/B should still work
}
```

### If BOTH are TRUE

Fix error isolation first, then address data sufficiency.

---

## ✅ Validation Checklist

- [ ] Run Query 1: Get kid_id
- [ ] Run Query 2: Verify learned count (expect ~159)
- [ ] Run Query 3: Count eligible pairs with char1-only (KEY FINDING)
- [ ] Run Query 4: Count eligible pairs with OR logic (comparison)
- [ ] Check browser console for errors when clicking Train
- [ ] Check Network tab for RPC response
- [ ] Test RPC via browser console
- [ ] Document findings before proposing fix

---

## 📝 Expected Findings Template

After validation, document:

```
## Findings

### Query Results
- Learned characters count: ___
- Eligible pairs (char1-only): ___
- Eligible pairs (OR logic): ___
- Total word_pairs in database: ___

### Browser Console
- Error messages: [yes/no]
- Error content: ___
- RPC response: [success/error]

### Root Cause Confirmed
- [ ] Hypothesis A: Insufficient pairs
- [ ] Hypothesis B: Cascading error
- [ ] Both
- [ ] Neither (different root cause: ___)

### Recommended Fix
[Based on findings]
```

---

## ✅ RESOLVED - Findings

### Query Results (via Supabase MCP)
- Learned characters count: **159** (matches Dashboard)
- Eligible pairs (char1-only filter): **201** (way above minimum of 5)
- Eligible pairs (OR logic): **271**
- Total word_pairs in database: **512**

**Hypothesis A (Insufficient Pairs): FALSE** - The data is fine.

### RPC Function Test
```sql
SELECT * FROM get_eligible_word_pairs('37d19840-...') LIMIT 5;
-- ERROR: 42702: column reference "id" is ambiguous
-- DETAIL: It could refer to either a PL/pgSQL variable or a table column.
```

**Hypothesis B (Cascading Error): TRUE** - The RPC was throwing an error!

### Root Cause
Migration `20260117000001_drill_c_char1_required.sql` re-introduced a bug that was previously fixed in `20260112000002_fix_rpc_ambiguous_column.sql`.

The auth check used `WHERE id = p_kid_id` but the function's RETURNS TABLE includes `id uuid`, creating an ambiguous reference. PostgreSQL couldn't determine if `id` meant the `kids.id` column or the OUT parameter `id`.

### Fix Applied
Migration `20260118000001_fix_rpc_ambiguous_column_again.sql`:
- Changed `WHERE id = p_kid_id` to `WHERE k.id = p_kid_id` (with table alias)
- Added explicit column aliases in SELECT (`wp.id AS id`, etc.)
- Preserved the char1-only filter logic from Issue #37

### Verification
- User confirmed fix works in production
- Dashboard shows Drill C
- Training modal shows all three drills

### Lesson Learned
When modifying RPC functions that return tables, always use explicit table aliases to avoid ambiguity between OUT parameters and table columns.
