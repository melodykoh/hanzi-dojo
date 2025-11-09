-- Fix Dictionary Lookup to Support Traditional Character Search
-- Version: 007
-- Created: 2025-11-05
-- Description: Update lookup_dictionary_entry RPC to search by both simplified AND traditional forms

-- =============================================================================
-- DROP AND RECREATE lookup_dictionary_entry FUNCTION
-- =============================================================================

DROP FUNCTION IF EXISTS lookup_dictionary_entry(TEXT);

CREATE OR REPLACE FUNCTION lookup_dictionary_entry(search_char TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  entry_record RECORD;
  confusions_zhuyin JSON;
  confusions_trad JSON;
BEGIN
  -- Look up the dictionary entry by EITHER simplified OR traditional form
  SELECT 
    id,
    simp,
    trad,
    zhuyin,
    pinyin,
    zhuyin_variants,
    meanings,
    frequency_rank
  INTO entry_record
  FROM dictionary_entries
  WHERE simp = search_char OR trad = search_char;  -- ⬅️ FIX: Search both columns
  
  -- If not found, return null
  IF NOT FOUND THEN
    RETURN json_build_object(
      'found', false,
      'entry', NULL,
      'confusions', NULL
    );
  END IF;
  
  -- Look up confusion mappings for Zhuyin drill
  SELECT confusions INTO confusions_zhuyin
  FROM dictionary_confusions
  WHERE entry_id = entry_record.id AND drill = 'zhuyin';
  
  -- Look up confusion mappings for Traditional drill
  SELECT confusions INTO confusions_trad
  FROM dictionary_confusions
  WHERE entry_id = entry_record.id AND drill = 'trad';
  
  -- Build the result JSON
  result := json_build_object(
    'found', true,
    'entry', json_build_object(
      'id', entry_record.id,
      'simp', entry_record.simp,
      'trad', entry_record.trad,
      'zhuyin', entry_record.zhuyin,
      'pinyin', entry_record.pinyin,
      'zhuyin_variants', entry_record.zhuyin_variants,
      'meanings', entry_record.meanings,
      'frequency_rank', entry_record.frequency_rank
    ),
    'confusions', json_build_object(
      'zhuyin', confusions_zhuyin,
      'trad', confusions_trad
    )
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION lookup_dictionary_entry(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION lookup_dictionary_entry(TEXT) TO anon;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION lookup_dictionary_entry(TEXT) IS 
'Look up a single character by simplified OR traditional form. Returns complete dictionary entry with confusion mappings, or found=false if not in dictionary.';

-- =============================================================================
-- TEST QUERIES
-- =============================================================================

-- Test with simplified (should work)
-- SELECT lookup_dictionary_entry('阳');

-- Test with traditional (should now work)
-- SELECT lookup_dictionary_entry('陽');

-- Verify both return the same entry
-- SELECT (lookup_dictionary_entry('阳')->'entry'->>'simp') = (lookup_dictionary_entry('陽')->'entry'->>'simp') AS same_entry;
