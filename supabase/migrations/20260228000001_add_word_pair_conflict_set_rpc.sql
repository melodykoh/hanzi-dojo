-- Migration: Add get_word_pair_conflict_set() RPC
-- Purpose: Returns ALL (char1, char2) pairs from word_pairs table for
--          comprehensive cross-column conflict detection in Drill C.
-- Context: Issue #34 (ambiguous word pairs), Issue #38 (word pair coverage)
--
-- The existing hasConflict() only checks against the kid's eligible pairs (~608).
-- After seeding MOE dictionary data (~87k pairs), this RPC provides the full
-- vocabulary for conflict detection — catching words like 日記/日光 that
-- exist in real Chinese but aren't in the kid's eligible set.
--
-- Uses explicit table aliases (wp.char1) per project convention to avoid
-- PL/pgSQL ambiguous column references with RETURNS TABLE.
-- See: docs/solutions/database-issues/plpgsql-ambiguous-column-reference.md

CREATE OR REPLACE FUNCTION get_word_pair_conflict_set()
RETURNS TABLE (char1 text, char2 text)
AS $$
BEGIN
  RETURN QUERY
  SELECT wp.char1 AS char1, wp.char2 AS char2
  FROM word_pairs wp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to all roles (word pairs are public reference data)
GRANT EXECUTE ON FUNCTION get_word_pair_conflict_set() TO anon, authenticated;
