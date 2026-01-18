-- Migration: Fix ambiguous column reference in get_eligible_word_pairs (AGAIN)
-- Issue: GitHub Issue #40 - Drill C disappeared, Training shows "No items available"
-- Root Cause: Migration 20260117000001 re-introduced the "ambiguous column reference" bug
--             that was previously fixed in 20260112000002
--
-- Error: "column reference 'id' is ambiguous - could refer to PL/pgSQL variable or table column"
-- Fix: Use table alias 'k.id' instead of bare 'id' in the auth check
--
-- This migration also preserves the char1-only filter logic from Issue #37

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
  -- FIXED: Use table alias 'k.id' to avoid ambiguity with OUT parameter 'id'
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
    AND e.trad = wp.char1  -- char1-only filter (preserves Issue #37 UX improvement)
    AND (
      e.locked_reading_id IS NULL
      OR r.context_words IS NULL
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
   Issue #40: Fixed ambiguous column reference in auth check.';
