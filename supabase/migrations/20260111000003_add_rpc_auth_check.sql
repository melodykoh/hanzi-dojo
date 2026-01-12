-- 20260111000003_add_rpc_auth_check.sql
-- Add authorization check to get_eligible_word_pairs RPC

CREATE OR REPLACE FUNCTION get_eligible_word_pairs(p_kid_id uuid)
RETURNS TABLE (
  id uuid,
  word text,
  char1 text,
  char2 text,
  category text,
  char1_pinyin text,
  char1_zhuyin text,
  char1_meaning text,
  char2_pinyin text,
  char2_zhuyin text,
  char2_meaning text
) AS $$
BEGIN
  -- Verify caller owns this kid
  IF NOT EXISTS (
    SELECT 1 FROM kids
    WHERE id = p_kid_id
    AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: kid not owned by caller';
  END IF;

  RETURN QUERY
  SELECT
    wp.id,
    wp.word,
    wp.char1,
    wp.char2,
    wp.category,
    d1.pinyin as char1_pinyin,
    d1.zhuyin as char1_zhuyin,
    d1.meaning as char1_meaning,
    d2.pinyin as char2_pinyin,
    d2.zhuyin as char2_zhuyin,
    d2.meaning as char2_meaning
  FROM word_pairs wp
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  WHERE EXISTS (
    SELECT 1 FROM entries e
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
