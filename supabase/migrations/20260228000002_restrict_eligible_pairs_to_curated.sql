-- Migration: Restrict eligible word pairs to curated set only
-- Date: 2026-02-28
-- Context: Issue #34, #38
--
-- After seeding ~87k MOE dictionary word pairs for comprehensive conflict
-- detection, the get_eligible_word_pairs RPC was returning ALL word_pairs
-- including advanced adult-level vocabulary (臉, 極, 潑, etc.) that a
-- 7-year-old wouldn't recognize.
--
-- Fix: Add `wp.category IS NOT NULL` filter so only curated CCCC pairs
-- (~512 kid-friendly words) are returned for practice. MOE pairs
-- (category IS NULL) remain in the table for conflict detection via
-- get_word_pair_conflict_set().
--
-- IMPORTANT: Based on LATEST RPC from migration 20260215000001.
-- Preserves all existing aliases and logic. Only change is one WHERE clause.

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
  -- NEW: Only curated pairs for practice (MOE pairs used for conflict detection only)
  WHERE wp.category IS NOT NULL
  -- Filter: char1 must be a saved/learned character (Issue #37)
  AND EXISTS (
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
  'Returns curated word pairs (category IS NOT NULL) where char1 is in the kid''s learned set.
   MOE reference pairs (category IS NULL) excluded — used only for conflict detection.
   Filters by pronunciation context when locked_reading_id exists.
   Issue #34: MOE pairs restricted to conflict detection only.
   Issue #37: Only char1 must be learned (not char2).
   Issue #40: Fixed ambiguous column reference in auth check.
   Issue #46: Removed NULL context_words catch-all. Empty array = no Drill C.
   Issue #36: Requires context_words in traditional Chinese.';
