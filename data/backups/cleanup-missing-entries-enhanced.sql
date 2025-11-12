-- Enhanced Cleanup: Remove Remaining Invalid Entries
-- Run after initial cleanup to catch edge cases

-- =============================================================================
-- STEP 3: Delete Remaining Zhuyin (Logged Before Validation)
-- =============================================================================

-- Preview
SELECT simp, COUNT(*) as count
FROM dictionary_missing
WHERE simp IN ('ㄊ', 'ㄏ', 'ㄐ', 'ㄍ', 'ㄋ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ',
               'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ',
               'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ',
               'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ')
GROUP BY simp;

-- Delete
DELETE FROM dictionary_missing
WHERE simp IN ('ㄊ', 'ㄏ', 'ㄐ', 'ㄍ', 'ㄋ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ',
               'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ',
               'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ',
               'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ');

-- =============================================================================
-- STEP 4: Delete Traditional Characters That Are in Dictionary
-- =============================================================================

-- Preview: Check if Traditional form exists in dictionary_entries.trad column
SELECT 
  dm.simp as traditional_char,
  de.simp as simplified_in_dict,
  de.trad as traditional_in_dict,
  COUNT(*) as times_logged
FROM dictionary_missing dm
JOIN dictionary_entries de ON dm.simp = de.trad
GROUP BY dm.simp, de.simp, de.trad;

-- Delete Traditional characters that exist in dictionary
DELETE FROM dictionary_missing
WHERE simp IN (
  SELECT DISTINCT trad FROM dictionary_entries WHERE trad IS NOT NULL
);

-- =============================================================================
-- STEP 5: Delete Pinyin/Romanization Test Inputs
-- =============================================================================

-- Preview: Single lowercase letters, common pinyin syllables
SELECT simp, COUNT(*) as count
FROM dictionary_missing
WHERE 
  -- Single letters (a-z)
  simp SIMILAR TO '[a-zA-Z]'
  -- Common pinyin test (2-5 letter words, all lowercase ASCII)
  OR (simp SIMILAR TO '[a-z]{2,5}' AND simp !~ '[^\x00-\x7F]')
  -- Pinyin with spaces
  OR simp LIKE '% %'
GROUP BY simp
ORDER BY count DESC;

-- Delete romanization/pinyin test inputs
DELETE FROM dictionary_missing
WHERE 
  -- Single ASCII letters
  simp SIMILAR TO '[a-zA-Z]'
  -- Short lowercase words (pinyin test inputs)
  OR (simp SIMILAR TO '[a-z]{2,5}' AND simp !~ '[^\x00-\x7F]')
  -- Mixed case like "Me", "Xia"
  OR (simp SIMILAR TO '[A-Z][a-z]{1,4}' AND simp !~ '[^\x00-\x7F]')
  -- Pinyin with spaces like "xie xie", "m w n g"
  OR simp LIKE '% %';

-- =============================================================================
-- STEP 6: Verify Final Result
-- =============================================================================

-- Should now only show legitimate Chinese characters truly missing from dictionary
SELECT 
  dm.simp,
  COUNT(*) as times_requested,
  MIN(dm.created_at) as first_requested,
  COUNT(DISTINCT dm.reported_by) as users_requested
FROM dictionary_missing dm
GROUP BY dm.simp
ORDER BY times_requested DESC, first_requested ASC;

-- Count
SELECT COUNT(DISTINCT simp) as unique_missing_characters FROM dictionary_missing;

-- Double-check: Any remaining entries should be Chinese characters only
-- If you see anything that looks wrong, investigate:
SELECT simp FROM dictionary_missing WHERE simp !~ '^[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+$';
