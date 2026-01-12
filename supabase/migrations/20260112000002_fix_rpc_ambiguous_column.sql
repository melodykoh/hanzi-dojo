-- Migration: Fix ambiguous column reference in get_eligible_word_pairs
-- Version: 021
-- Description: Fixes "column reference 'id' is ambiguous" error by using
--              explicit OUT parameter assignment instead of column aliasing

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
  WHERE EXISTS (
    SELECT 1 FROM entries e
    LEFT JOIN readings r ON r.id = e.locked_reading_id
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
    AND (
      e.locked_reading_id IS NULL
      OR r.context_words IS NULL
      OR wp.word = ANY(r.context_words)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_eligible_word_pairs IS 'Returns word pairs filtered by hero character pronunciation. If a saved character has a locked_reading_id, only word pairs in that reading''s context_words are eligible.';
