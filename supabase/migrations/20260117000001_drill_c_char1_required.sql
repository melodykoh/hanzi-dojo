-- Migration: Require char1 to be learned for Drill C word pairs
-- Version: 021
-- Fixes: GitHub Issue #37 - Drill C too difficult for young learners
-- Rationale: Cognitively easier when the starting character (left column) is familiar
--
-- Change: Filter from (char1 OR char2) to just char1
-- Before: Word pairs shown if kid knows either character
-- After: Word pairs shown only if kid knows the first character (char1)
--
-- This is less restrictive than requiring both characters, which could
-- lock out users with limited vocabulary. If still too difficult,
-- a follow-up migration can require both characters.

CREATE OR REPLACE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
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
  -- Verify caller owns this kid (auth check)
  IF NOT EXISTS (
    SELECT 1 FROM kids
    WHERE id = p_kid_id
    AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: kid not owned by caller';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    wp.id,
    wp.word,
    wp.char1,
    d1.zhuyin AS char1_zhuyin,
    wp.char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category
  FROM word_pairs wp
  -- JOIN to get Zhuyin for display
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  -- Filter: char1 must be a saved/learned character
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND e.trad = wp.char1  -- CHANGED: Only char1 must be learned (was: char1 OR char2)
    AND (
      -- No pronunciation lock = accept all word pairs for this character
      e.locked_reading_id IS NULL
      -- No context words defined = accept all word pairs
      OR r.context_words IS NULL
      -- Word matches the character's pronunciation context
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_eligible_word_pairs IS
  'Returns word pairs where char1 is in the kid''s learned set.
   Filters by pronunciation context when locked_reading_id exists.
   GitHub Issue #37: Changed from (char1 OR char2) to require char1.';
