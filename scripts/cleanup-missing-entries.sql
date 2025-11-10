-- Cleanup Missing Dictionary Entries - Two-Step Approach
-- Run in Supabase Dashboard SQL Editor
-- 
-- Purpose: 
-- 1. Remove Zhuyin/test garbage (invalid entries)
-- 2. Remove entries now in dictionary (resolved, no longer missing)
-- Result: Only show current, legitimate missing characters for Epic 8 planning
--
-- Context: Multi-user production system with 1,067-character dictionary
-- Most missing entries are historical (before dictionary expansion)

-- =============================================================================
-- ANALYSIS: UNDERSTAND CURRENT STATE
-- =============================================================================

-- Total entries by user
SELECT 
  reported_by,
  au.email,
  COUNT(*) as entries_logged
FROM dictionary_missing dm
LEFT JOIN auth.users au ON dm.reported_by = au.id
GROUP BY reported_by, au.email
ORDER BY entries_logged DESC;

-- Check which entries are now in dictionary (resolved)
SELECT 
  dm.simp,
  COUNT(*) as times_requested,
  MIN(dm.created_at) as first_requested,
  MAX(dm.created_at) as last_requested,
  CASE 
    WHEN de.simp IS NOT NULL THEN 'Now in dictionary ✅'
    ELSE 'Still missing ❌'
  END as status
FROM dictionary_missing dm
LEFT JOIN dictionary_entries de ON dm.simp = de.simp
GROUP BY dm.simp, de.simp
ORDER BY status, times_requested DESC;

-- =============================================================================
-- STEP 1: PREVIEW INVALID ENTRIES (ZHUYIN/TEST GARBAGE)
-- =============================================================================

-- Show entries that will be deleted (Zhuyin, test inputs, garbage)
SELECT 
  id,
  simp,
  reported_by,
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
    WHEN simp LIKE '%ム%' OR simp LIKE '%々%' THEN 'Katakana/Japanese'
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
ORDER BY created_at DESC;

-- Count invalid entries
SELECT COUNT(*) as invalid_entries_to_delete
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
  OR simp LIKE '%ム%' OR simp LIKE '%々%';

-- =============================================================================
-- STEP 2: PREVIEW RESOLVED ENTRIES (NOW IN DICTIONARY)
-- =============================================================================

-- Show entries that are now in dictionary (will be deleted as resolved)
SELECT 
  dm.id,
  dm.simp,
  dm.reported_by,
  au.email,
  dm.created_at,
  'Now in dictionary (resolved)' as reason
FROM dictionary_missing dm
LEFT JOIN auth.users au ON dm.reported_by = au.id
WHERE dm.simp IN (SELECT simp FROM dictionary_entries)
ORDER BY dm.created_at DESC;

-- Count resolved entries
SELECT COUNT(*) as resolved_entries_to_delete
FROM dictionary_missing
WHERE simp IN (SELECT simp FROM dictionary_entries);

-- =============================================================================
-- STEP 3: DELETE INVALID ENTRIES (UNCOMMENT TO EXECUTE)
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
  OR simp LIKE '%ム%' OR simp LIKE '%々%';

*/

-- =============================================================================
-- STEP 4: DELETE RESOLVED ENTRIES (UNCOMMENT TO EXECUTE)
-- =============================================================================

/*

DELETE FROM dictionary_missing
WHERE simp IN (
  SELECT simp FROM dictionary_entries
);

*/

-- =============================================================================
-- STEP 5: VERIFY CLEANUP - WHAT'S LEFT?
-- =============================================================================

-- Show remaining entries (should be legitimate, still-missing Chinese characters)
SELECT 
  dm.simp,
  COUNT(*) as times_requested,
  MIN(dm.created_at) as first_requested,
  MAX(dm.created_at) as last_requested,
  COUNT(DISTINCT dm.reported_by) as users_requested
FROM dictionary_missing dm
GROUP BY dm.simp
ORDER BY times_requested DESC, first_requested ASC
LIMIT 50;

-- Total count remaining
SELECT COUNT(*) as total_entries_remaining FROM dictionary_missing;

-- Count unique characters remaining
SELECT COUNT(DISTINCT simp) as unique_characters_remaining FROM dictionary_missing;

-- Expected result after cleanup:
-- Only legitimate Chinese characters that are STILL missing from dictionary
-- These guide Epic 8 dictionary expansion planning
-- Multi-user requests show most-wanted characters
