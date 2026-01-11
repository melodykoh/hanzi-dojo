-- Drill C: Word Match - Part 2: Tables and RPC
-- Version: 019b
-- Description: Adds word_pairs table, RPC function, and modifies practice_events

-- =============================================================================
-- WORD_PAIRS TABLE
-- =============================================================================

CREATE TABLE word_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The word (Traditional only - matches drill display)
  word TEXT NOT NULL,              -- e.g., "月亮"

  -- Character references (Traditional)
  char1 TEXT NOT NULL,             -- "月" (first char)
  char2 TEXT NOT NULL,             -- "亮" (second char)

  -- Metadata (optional, for analytics)
  category TEXT,                   -- "自然" (from CCCC)

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT word_length CHECK (length(word) = 2),
  CONSTRAINT word_matches_chars CHECK (word = char1 || char2)
);

-- Indexes for anchor character lookup
CREATE INDEX idx_word_pairs_char1 ON word_pairs(char1);
CREATE INDEX idx_word_pairs_char2 ON word_pairs(char2);
CREATE INDEX idx_word_pairs_word ON word_pairs(word);

-- =============================================================================
-- RLS: Public read access (matches dictionary_entries pattern)
-- =============================================================================

ALTER TABLE word_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON word_pairs
  FOR SELECT USING (true);

-- =============================================================================
-- RPC: GET ELIGIBLE WORD PAIRS
-- =============================================================================

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
  -- JOIN to get Zhuyin (no duplication!)
  JOIN dictionary_entries d1 ON d1.trad = wp.char1
  JOIN dictionary_entries d2 ON d2.trad = wp.char2
  -- Filter: at least one char is in kid's learned set
  WHERE EXISTS (
    SELECT 1 FROM entries e
    WHERE e.kid_id = p_kid_id
    AND (e.trad = wp.char1 OR e.trad = wp.char2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- MODIFY PRACTICE_EVENTS TO ALLOW NULL ENTRY_ID FOR WORD_MATCH
-- =============================================================================

-- First, drop the NOT NULL constraint on entry_id
ALTER TABLE practice_events
  ALTER COLUMN entry_id DROP NOT NULL;

-- Add a check constraint to ensure entry_id is NOT NULL for character drills
-- but can be NULL for word_match
ALTER TABLE practice_events
  ADD CONSTRAINT practice_events_entry_id_check
  CHECK (
    (drill IN ('zhuyin', 'trad') AND entry_id IS NOT NULL) OR
    (drill = 'word_match')
  );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE word_pairs IS 'Word pairs for Drill C (Word Match) - 2-character vocabulary from CCCC';
COMMENT ON FUNCTION get_eligible_word_pairs IS 'Returns word pairs where at least one character is in the kid''s learned set';
