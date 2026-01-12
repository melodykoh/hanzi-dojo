-- 20260111000003_add_rpc_auth_check.sql
-- Add authorization check to get_eligible_word_pairs RPC
-- NOTE: Maintains jsonb return type for char1_zhuyin/char2_zhuyin (matches 20260110000002)

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
    d1.zhuyin AS char1_zhuyin,
    wp.char2,
    d2.zhuyin AS char2_zhuyin,
    wp.category
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
