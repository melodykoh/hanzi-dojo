-- Dictionary Lookup RPC Function
-- Provides a single endpoint for looking up characters with all related data

-- =============================================================================
-- FUNCTION: lookup_dictionary_entry
-- =============================================================================
-- Purpose: Look up a character by simplified form and return complete dictionary data
-- Input: character (simplified form)
-- Output: JSON object with entry data and confusion mappings, or null if not found

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
  -- Look up the dictionary entry
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
  WHERE simp = search_char;
  
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
-- FUNCTION: batch_lookup_dictionary_entries
-- =============================================================================
-- Purpose: Look up multiple characters at once (for bulk Add Item operations)
-- Input: array of characters (simplified forms)
-- Output: JSON array of lookup results

CREATE OR REPLACE FUNCTION batch_lookup_dictionary_entries(search_chars TEXT[])
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON[];
  char TEXT;
  lookup_result JSON;
BEGIN
  -- Loop through each character and look it up
  FOREACH char IN ARRAY search_chars
  LOOP
    lookup_result := lookup_dictionary_entry(char);
    result := array_append(result, lookup_result);
  END LOOP;
  
  RETURN json_build_object('results', result);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION batch_lookup_dictionary_entries(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION batch_lookup_dictionary_entries(TEXT[]) TO anon;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION lookup_dictionary_entry(TEXT) IS 
'Look up a single character by simplified form. Returns complete dictionary entry with confusion mappings, or found=false if not in dictionary.';

COMMENT ON FUNCTION batch_lookup_dictionary_entries(TEXT[]) IS 
'Look up multiple characters at once. Returns array of lookup results.';

-- =============================================================================
-- TEST QUERIES (run these to verify the functions work)
-- =============================================================================

-- Test single lookup (should return data for 太)
-- SELECT lookup_dictionary_entry('太');

-- Test not found (should return found=false)
-- SELECT lookup_dictionary_entry('龘');

-- Test batch lookup (should return array)
-- SELECT batch_lookup_dictionary_entries(ARRAY['太', '阳', '黑', '龘']);

-- Test multi-reading character (should have zhuyin_variants)
-- SELECT lookup_dictionary_entry('着');
