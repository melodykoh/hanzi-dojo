-- Migration: Pronunciation Filtering for Drill C Word Pairs
-- Version: 020
-- Description: Updates get_eligible_word_pairs RPC to filter by hero character's
--              locked pronunciation (locked_reading_id -> readings.context_words)
--
-- Hero-Centric Filtering Model:
-- - Only the "hero character" (the saved character being practiced) drives filtering
-- - Non-hero character's pronunciation is irrelevant
-- - If hero has locked_reading_id, only word pairs in that reading's context_words are eligible
-- - If hero has NULL locked_reading_id or NULL context_words, all word pairs are accepted

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
  -- Verify caller owns this kid (auth check from 20260111000003)
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
  -- Filter: at least one saved character (hero) matches this word pair
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
    AND (
      -- No pronunciation lock = accept all word pairs for this hero
      e.locked_reading_id IS NULL
      -- No context words defined = accept all word pairs
      OR r.context_words IS NULL
      -- Word matches the hero character's pronunciation context
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_eligible_word_pairs IS 'Returns word pairs filtered by hero character pronunciation. If a saved character has a locked_reading_id, only word pairs in that reading''s context_words are eligible.';
