-- Cleanup Missing Dictionary Entries - Remove Test Data
-- Run in Supabase Dashboard SQL Editor
-- 
-- Purpose: Remove Zhuyin and test input entries from dictionary_missing table
-- These were logged during testing and should not guide dictionary expansion

-- =============================================================================
-- STEP 1: PREVIEW WHAT WILL BE DELETED
-- =============================================================================

-- Show entries that will be deleted (Zhuyin, test inputs, garbage)
SELECT 
  id,
  simp,
  created_at,
  CASE
    WHEN simp LIKE '%ㄉ%' OR simp LIKE '%ㄧ%' OR simp LIKE '%ㄨ%' 
         OR simp LIKE '%ㄩ%' OR simp LIKE '%ㄚ%' OR simp LIKE '%ㄛ%'
         OR simp LIKE '%ㄜ%' OR simp LIKE '%ㄝ%' OR simp LIKE '%ㄞ%'
         OR simp LIKE '%ㄟ%' OR simp LIKE '%ㄠ%' OR simp LIKE '%ㄡ%'
         OR simp LIKE '%ㄢ%' OR simp LIKE '%ㄣ%' OR simp LIKE '%ㄤ%'
         OR simp LIKE '%ㄥ%' OR simp LIKE '%ㄦ%' OR simp LIKE '%ˊ%'
         OR simp LIKE '%ˇ%' OR simp LIKE '%ˋ%' OR simp LIKE '%˙%'
         OR simp LIKE '%ˉ%' THEN 'Zhuyin input'
    WHEN simp LIKE '%ム%' OR simp LIKE '%々%' OR simp LIKE '%丫%' THEN 'Katakana/test input'
    ELSE 'Other garbage'
  END as reason
FROM dictionary_missing
WHERE 
  -- Zhuyin characters (Bopomofo block U+3100-U+312F)
  simp LIKE '%ㄉ%' OR simp LIKE '%ㄧ%' OR simp LIKE '%ㄨ%' 
  OR simp LIKE '%ㄩ%' OR simp LIKE '%ㄚ%' OR simp LIKE '%ㄛ%'
  OR simp LIKE '%ㄜ%' OR simp LIKE '%ㄝ%' OR simp LIKE '%ㄞ%'
  OR simp LIKE '%ㄟ%' OR simp LIKE '%ㄠ%' OR simp LIKE '%ㄡ%'
  OR simp LIKE '%ㄢ%' OR simp LIKE '%ㄣ%' OR simp LIKE '%ㄤ%'
  OR simp LIKE '%ㄥ%' OR simp LIKE '%ㄦ%'
  -- Tone marks
  OR simp LIKE '%ˊ%' OR simp LIKE '%ˇ%' OR simp LIKE '%ˋ%' 
  OR simp LIKE '%˙%' OR simp LIKE '%ˉ%'
  -- Katakana/Japanese characters
  OR simp LIKE '%ム%' OR simp LIKE '%々%'
  -- Other test garbage
  OR simp LIKE '%丫%'
ORDER BY created_at DESC;

-- Count how many will be deleted
SELECT COUNT(*) as entries_to_delete
FROM dictionary_missing
WHERE 
  simp LIKE '%ㄉ%' OR simp LIKE '%ㄧ%' OR simp LIKE '%ㄨ%' 
  OR simp LIKE '%ㄩ%' OR simp LIKE '%ㄚ%' OR simp LIKE '%ㄛ%'
  OR simp LIKE '%ㄜ%' OR simp LIKE '%ㄝ%' OR simp LIKE '%ㄞ%'
  OR simp LIKE '%ㄟ%' OR simp LIKE '%ㄠ%' OR simp LIKE '%ㄡ%'
  OR simp LIKE '%ㄢ%' OR simp LIKE '%ㄣ%' OR simp LIKE '%ㄤ%'
  OR simp LIKE '%ㄥ%' OR simp LIKE '%ㄦ%'
  OR simp LIKE '%ˊ%' OR simp LIKE '%ˇ%' OR simp LIKE '%ˋ%' 
  OR simp LIKE '%˙%' OR simp LIKE '%ˉ%'
  OR simp LIKE '%ム%' OR simp LIKE '%々%'
  OR simp LIKE '%丫%';

-- =============================================================================
-- STEP 2: DELETE TEST DATA (UNCOMMENT TO EXECUTE)
-- =============================================================================

/*

DELETE FROM dictionary_missing
WHERE 
  -- Zhuyin characters (Bopomofo block)
  simp LIKE '%ㄉ%' OR simp LIKE '%ㄧ%' OR simp LIKE '%ㄨ%' 
  OR simp LIKE '%ㄩ%' OR simp LIKE '%ㄚ%' OR simp LIKE '%ㄛ%'
  OR simp LIKE '%ㄜ%' OR simp LIKE '%ㄝ%' OR simp LIKE '%ㄞ%'
  OR simp LIKE '%ㄟ%' OR simp LIKE '%ㄠ%' OR simp LIKE '%ㄡ%'
  OR simp LIKE '%ㄢ%' OR simp LIKE '%ㄣ%' OR simp LIKE '%ㄤ%'
  OR simp LIKE '%ㄥ%' OR simp LIKE '%ㄦ%'
  -- Tone marks
  OR simp LIKE '%ˊ%' OR simp LIKE '%ˇ%' OR simp LIKE '%ˋ%' 
  OR simp LIKE '%˙%' OR simp LIKE '%ˉ%'
  -- Katakana/Japanese characters
  OR simp LIKE '%ム%' OR simp LIKE '%々%'
  -- Other test garbage
  OR simp LIKE '%丫%';

*/

-- =============================================================================
-- STEP 3: VERIFY CLEANUP
-- =============================================================================

-- Show remaining entries (should be legitimate Chinese characters only)
SELECT 
  id,
  simp,
  trad,
  created_at
FROM dictionary_missing
ORDER BY created_at DESC
LIMIT 20;

-- Count remaining entries
SELECT COUNT(*) as legitimate_entries_remaining
FROM dictionary_missing;

-- Expected result after cleanup:
-- Only legitimate Chinese characters that are truly missing from dictionary
-- Examples: 字义, 门它, 么丫 (if they're real characters)
