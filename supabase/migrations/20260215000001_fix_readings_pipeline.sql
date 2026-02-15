-- Migration: Fix Readings Pipeline (Issues #36, #46, #34)
-- Date: 2026-02-15
-- PR: Cluster A holistic fix
--
-- This migration fixes the entire context_words data flow:
--   Step 1: SKIPPED — Discovery found 0 simplified context_words (migrations 015c, 021b fixed all)
--   Step 2: Backfill context_words from dictionary for readings that have NULL
--   Step 3: Unset locked_reading_id for single-pronunciation characters (no variants in dictionary)
--   Step 4: Convert remaining NULL context_words to empty arrays for locked readings
--   Step 5: Update RPC to properly handle empty arrays (#46)
--
-- IMPORTANT: Steps must execute in this exact order.
-- IMPORTANT: Run via `supabase db push` or `supabase migration up` ONLY.
--            Do NOT paste into the SQL Editor (no implicit transaction there).
-- Read docs/solutions/database-issues/ before modifying.


-- ============================================================
-- Step 2: Backfill context_words from dictionary
-- ============================================================
-- For readings where context_words IS NULL and a locked pronunciation exists,
-- populate context_words from the matching dictionary variant.
--
-- Two matching strategies:
--   A) Exact JSONB zhuyin match (e.g., 不, 個, 傳, 拉, 為, 風, 色)
--   B) First-variant match for chars with format mismatch (有, 羊, 要, 雨)
--      where reading stores [["ㄧ","ㄤ","ˊ"]] but dict has [["","ㄧㄤ","ˊ"]]
--
-- Uses tone mark (position 2) as tiebreaker when exact match fails.
-- Pre-check confirmed 0 zhuyin collisions, so LIMIT 1 is safe.

UPDATE readings r
SET context_words = matched_context.cw_array
FROM (
  SELECT r2.id AS reading_id,
    (SELECT ARRAY(
      SELECT jsonb_array_elements_text(v.val->'context_words')
      FROM jsonb_array_elements(de.zhuyin_variants) AS v(val)
      WHERE (
        -- Strategy A: Exact JSONB match
        v.val->'zhuyin' = r2.zhuyin
        -- Strategy B: Tone-mark match (position 2 of inner array)
        OR (
          v.val->'zhuyin'->0->2 = r2.zhuyin->0->2
          AND v.val->'zhuyin'->0->2 IS NOT NULL
        )
      )
      AND jsonb_array_length(COALESCE(v.val->'context_words', '[]'::jsonb)) > 0
      ORDER BY
        -- Prefer exact match over tone-only match
        CASE WHEN v.val->'zhuyin' = r2.zhuyin THEN 0 ELSE 1 END
      LIMIT 1
    )) AS cw_array
  FROM readings r2
  JOIN entries e ON e.locked_reading_id = r2.id
  JOIN dictionary_entries de ON de.trad = e.trad
  WHERE r2.context_words IS NULL
    AND de.zhuyin_variants IS NOT NULL
) AS matched_context
WHERE r.id = matched_context.reading_id
  AND matched_context.cw_array IS NOT NULL
  AND array_length(matched_context.cw_array, 1) > 0;


-- ============================================================
-- Step 3: Unset locked_reading_id for single-pronunciation characters
-- ============================================================
-- Characters with no zhuyin_variants in the dictionary have only one pronunciation.
-- There's no ambiguity to filter for, so they should use State A (accept all word pairs).
-- The locked_reading_id was set because AddItemForm auto-locks all readings
-- (line 420: zhuyinVariants.length === 0 || hasConfirmedPronunciation).
--
-- After this step, these entries use State A in the RPC:
--   e.locked_reading_id IS NULL → accept all word pairs

UPDATE entries e
SET locked_reading_id = NULL
WHERE locked_reading_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM readings r
    WHERE r.id = e.locked_reading_id
    AND r.context_words IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM dictionary_entries de
    WHERE de.trad = e.trad
    AND de.zhuyin_variants IS NOT NULL
    AND jsonb_array_length(de.zhuyin_variants) > 1
  );


-- ============================================================
-- Step 4: Convert remaining NULL context_words to empty arrays
-- ============================================================
-- After Steps 2 and 3, any readings that STILL have NULL context_words
-- with a locked pronunciation are multi-pronunciation characters where
-- the dictionary variant has no context_words (e.g., 的's "de" reading).
-- Convert these to empty arrays so the RPC can distinguish them from
-- unlocked readings (NULL = no lock vs {} = locked but no context words).

UPDATE readings r
SET context_words = '{}'
FROM entries e
WHERE e.locked_reading_id = r.id
  AND r.context_words IS NULL;


-- ============================================================
-- Step 5: Update RPC — remove NULL context_words catch-all (#46)
-- ============================================================
-- IMPORTANT: Based on LATEST migration 20260118000001
-- Preserves all existing aliases (k.id, wp.id AS id, etc.)
-- See docs/solutions/database-issues/plpgsql-ambiguous-column-reference.md
-- See docs/solutions/database-issues/migration-regression-pattern.md

DROP FUNCTION IF EXISTS get_eligible_word_pairs(uuid);

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
  -- Verify caller owns this kid
  -- FIX (Migration 021d): Use table alias 'k.id' to avoid ambiguity. See Issue #40.
  IF NOT EXISTS (
    SELECT 1 FROM kids k
    WHERE k.id = p_kid_id
    AND k.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: kid not owned by caller';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    wp.id AS id,
    wp.word AS word,
    wp.char1 AS char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2 AS char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category AS category
  FROM word_pairs wp
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  -- Filter: char1 must be a saved/learned character (Issue #37)
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND e.trad = wp.char1  -- char1-only filter (preserves Issue #37)
    AND (
      -- State A: No pronunciation lock = accept all word pairs for this char
      e.locked_reading_id IS NULL
      -- State B: Has context words = filter by those words
      -- FIX (Issue #46): Removed "r.context_words IS NULL" catch-all.
      -- After migration steps 2-4, NULL no longer exists for locked readings.
      -- Empty array '{}' means "no context words defined" = exclude from Drill C.
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_eligible_word_pairs IS
  'Returns word pairs where char1 is in the kid''s learned set.
   Filters by pronunciation context when locked_reading_id exists.
   Issue #37: Only char1 must be learned (not char2).
   Issue #40: Fixed ambiguous column reference in auth check.
   Issue #46: Removed NULL context_words catch-all. Empty array = no Drill C.
   Issue #36: Requires context_words in traditional Chinese.';
