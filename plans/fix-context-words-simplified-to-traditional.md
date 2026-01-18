# Fix: Convert context_words from Simplified to Traditional Chinese

**GitHub Issue:** [#36](https://github.com/melodykoh/hanzi-dojo/issues/36)
**Type:** Bug fix (data quality)
**Priority:** Medium
**Severity:** Low (false negatives only, no incorrect behavior)

---

## Overview

Some `readings.context_words` and `dictionary_entries.zhuyin_variants[].context_words` are stored in simplified Chinese while `word_pairs.word` uses traditional Chinese. This causes the pronunciation filtering in Drill C to incorrectly exclude valid word pairs.

**Example failure:**
```sql
-- RPC comparison that fails:
wp.word = ANY(r.context_words)

-- When:
-- wp.word = '到處' (traditional)
-- r.context_words contains '到处' (simplified)
-- Result: '到處' ≠ '到处' → valid pair excluded
```

---

## Approach: Hardcoded Word-Level Mapping

**Key insight from review:** This is a "fix ~50 known values" problem, not a "build a conversion system" problem.

| Original Approach | Simplified Approach |
|-------------------|---------------------|
| Character-by-character conversion function | Hardcoded word mapping |
| Backup tables | Trust transaction + Supabase PITR |
| Pre-flight validation | Unnecessary (known mappings) |
| Complex JSONB manipulation | Cast-replace-cast pattern |
| ~100 lines SQL | ~30 lines SQL |

---

## Phase 1: Discovery (Run Before Writing Migration)

Run these queries to get the **exact list of words** that need conversion:

```sql
-- Find simplified words in dictionary_entries.zhuyin_variants[].context_words
SELECT DISTINCT cw as simplified_word
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) as v,
     jsonb_array_elements_text(v->'context_words') as cw
WHERE zhuyin_variants IS NOT NULL
  AND cw ~ '处|着|说|为|与|当|传|车|辆|这|么|学|东|书|买|卖|开|关|长|张|发|变|边|过|还|进|远|运|达|选|连|让|认|请|读|课|谁|谈|论|许|设|试|该|语|话|误|调|证|词'
ORDER BY cw;

-- Find simplified words in readings.context_words
SELECT DISTINCT word as simplified_word
FROM readings r,
     unnest(r.context_words) as word
WHERE context_words IS NOT NULL
  AND word ~ '处|着|说|为|与|当|传|车|辆|这|么|学|东|书|买|卖|开|关|长|张|发|变|边|过|还|进|远|运|达|选|连|让|认|请|读|课|谁|谈|论|许|设|试|该|语|话|误|调|证|词'
ORDER BY word;
```

Use these results to populate the `WORD_MAPPINGS` CTE below.

---

## Phase 2: Migration

**File:** `supabase/migrations/20260118000001_fix_simplified_context_words.sql`

```sql
-- Migration: Fix Simplified Context Words
-- Issue: #36
-- Converts known simplified context_words to traditional Chinese
-- using hardcoded word-level mapping (not character-by-character)

-- ============================================
-- STEP 1: Define known word mappings
-- Populated from Phase 1 discovery queries
-- ============================================

WITH word_mappings(simp, trad) AS (VALUES
  -- 处/處 words
  ('处理', '處理'),
  ('处所', '處所'),
  ('处于', '處於'),
  ('到处', '到處'),
  ('办事处', '辦事處'),
  ('相处', '相處'),

  -- 着/著 words
  ('着急', '著急'),
  ('着迷', '著迷'),
  ('着凉', '著涼'),
  ('着落', '著落'),
  ('着重', '著重'),
  ('着手', '著手'),

  -- 说/說 words
  ('说话', '說話'),
  ('说客', '說客'),
  ('游说', '遊說'),
  ('说辞', '說辭'),

  -- 为/為 words
  ('为什么', '為什麼'),
  ('因为', '因為'),
  ('为了', '為了'),
  ('作为', '作為'),
  ('认为', '認為'),

  -- 当/當 words
  ('当场', '當場'),
  ('当今', '當今'),
  ('当时', '當時'),
  ('当年', '當年'),

  -- 与/與 words
  ('与其', '與其'),
  ('参与', '參與'),

  -- 传/傳 words
  ('传说', '傳說'),
  ('传统', '傳統'),

  -- 车/車 words
  ('车马', '車馬'),
  ('车辆', '車輛'),

  -- 教 words (already trad char, but compound may have simplified)
  ('教学', '教學'),
  ('教书', '教書')

  -- ADD MORE FROM PHASE 1 DISCOVERY
)

-- ============================================
-- STEP 2: Update readings table (TEXT[] column)
-- ============================================

UPDATE readings r
SET context_words = (
  SELECT ARRAY(
    SELECT COALESCE(wm.trad, w)
    FROM unnest(r.context_words) AS w
    LEFT JOIN word_mappings wm ON wm.simp = w
  )
)
WHERE context_words IS NOT NULL
  AND array_length(context_words, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(r.context_words) AS w
    WHERE w IN (SELECT simp FROM word_mappings)
  );

-- ============================================
-- STEP 3: Update dictionary_entries (JSONB)
-- Using cast-replace-cast pattern for simplicity
-- ============================================

UPDATE dictionary_entries
SET zhuyin_variants = (
  SELECT zhuyin_variants::TEXT
)::JSONB
FROM (
  SELECT de.id,
         -- Chain REPLACE calls for each mapping
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
         REPLACE(
           de.zhuyin_variants::TEXT,
           '处理', '處理'),
           '处所', '處所'),
           '到处', '到處'),
           '着急', '著急'),
           '着迷', '著迷'),
           '着凉', '著涼'),
           '说话', '說話'),
           '说客', '說客'),
           '游说', '遊說'),
           '为什么', '為什麼'),
           '因为', '因為'),
           '为了', '為了'),
           '作为', '作為'),
           '认为', '認為'),
           '当场', '當場'),
           '当时', '當時'),
           '传说', '傳說'),
           '教学', '教學'),
           '车辆', '車輛'),
           '参与', '參與') AS converted
  FROM dictionary_entries de
  WHERE zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) > 0
    AND zhuyin_variants::TEXT ~ '处理|处所|到处|着急|着迷|着凉|说话|说客|游说|为什么|因为|为了|作为|认为|当场|当时|传说|教学|车辆|参与'
) AS conversions
WHERE dictionary_entries.id = conversions.id;

-- Note: The REPLACE chain is ugly but:
-- 1. Obvious what it does
-- 2. Easy to debug
-- 3. No functions to clean up
-- 4. One-time migration, not production code
```

---

## Phase 3: Verification

Run after migration to confirm success:

```sql
-- Check for any remaining simplified words in dictionary_entries
SELECT de.simp, de.trad,
       jsonb_array_elements_text(v->'context_words') as context_word
FROM dictionary_entries de,
     jsonb_array_elements(de.zhuyin_variants) as v
WHERE zhuyin_variants IS NOT NULL
  AND v->'context_words' IS NOT NULL
  AND jsonb_array_elements_text(v->'context_words') ~ '处|着|说|为|与|当|传|车'
LIMIT 20;

-- Check for any remaining simplified words in readings
SELECT e.trad, r.context_words
FROM readings r
JOIN entries e ON r.entry_id = e.id
WHERE r.context_words IS NOT NULL
  AND array_to_string(r.context_words, ',') ~ '处|着|说|为|与|当|传|车'
LIMIT 20;

-- Both queries should return 0 rows
```

---

## Phase 4: Manual QA

1. **Test Drill C with affected characters:**
   - Add character 處 with locked pronunciation
   - Verify word pairs appear (到處, 處理, etc.)
   - Add character 著 with locked pronunciation
   - Verify word pairs appear (著急, 著迷, etc.)

2. **Verify no regressions:**
   - Existing word pairs still work
   - No duplicate word pairs created

---

## Acceptance Criteria

- [ ] Phase 1 discovery queries run and mappings populated
- [ ] All simplified words in `dictionary_entries.zhuyin_variants[].context_words` converted
- [ ] All simplified words in `readings.context_words` converted
- [ ] Verification queries return 0 rows
- [ ] Drill C displays word pairs for 處/著/說 characters
- [ ] No regressions in existing functionality

---

## Why This Approach

| Decision | Rationale |
|----------|-----------|
| Hardcoded word mapping | We know exactly which words need fixing from migration history |
| No backup tables | Supabase has point-in-time recovery; transaction rolls back on failure |
| No pre-flight validation | Hardcoded mappings can't fail; nothing to validate |
| Cast-replace-cast for JSONB | Ugly but obvious, debuggable, no functions to clean up |
| Word-level not char-level | Avoids circular dependency on dictionary_entries |
| Simple verification query | Human reviews output; no need for EXCEPTION on one-time fix |

---

## Rollback

If issues discovered post-migration:

1. **Option A:** Supabase Dashboard → Point-in-time recovery to before migration
2. **Option B:** Write reverse migration swapping trad→simp in the same REPLACE pattern

No backup tables needed - Supabase PITR is sufficient for a migration of this scope.

---

## References

- Issue: [#36](https://github.com/melodykoh/hanzi-dojo/issues/36)
- PR #35: Pronunciation filtering for Drill C
- Migration 014: Source of some simplified context_words
- Migration 015c: Previous partial fix attempt

---

## Review Feedback Applied

| Reviewer | Feedback | Applied |
|----------|----------|---------|
| DHH | "Ship the boring solution" - hardcode mappings | ✅ Word-level mapping |
| DHH | Cast-replace-cast for JSONB | ✅ REPLACE chain |
| Kieran | Empty JSONB array → NULL bug | ✅ Added `jsonb_array_length > 0` check |
| Kieran | Row count verification | ✅ Simple SELECT verification |
| Simplicity | Remove backup tables | ✅ Trust Supabase PITR |
| Simplicity | Remove pre-flight validation | ✅ Hardcoded = guaranteed |
| All | 75% LOC reduction | ✅ ~30 lines vs ~100 |
