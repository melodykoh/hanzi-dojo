-- Migration 016: Fix 11 characters missed in PR #24
-- Issue: Characters claimed fixed in PR #24 description weren't in Migration 011e SQL
-- Bug: Drill A shows merged pronunciations like "ㄎㄜˇ ㄎㄜˋ" instead of "ㄎㄜˇ"
-- Date: 2025-12-12
--
-- Root Cause: Migration 009 stored ALL pronunciations in the main `zhuyin` array
-- instead of using `zhuyin_variants` for alternate pronunciations. PR #24 claimed
-- to fix these but only fixed 43 characters - these 11 were in the description
-- but NOT in the actual SQL.
--
-- Characters fixed: 可, 几, 系, 调, 都, 重, 量, 觉, 角, 还, 行

BEGIN;

-- ============================================================================
-- STEP 0: Create backups
-- ============================================================================
CREATE TABLE dictionary_entries_backup_016 AS
  SELECT * FROM dictionary_entries
  WHERE simp IN ('可', '几', '系', '调', '都', '重', '量', '觉', '角', '还', '行');

CREATE TABLE readings_backup_016 AS
  SELECT r.* FROM readings r
  JOIN entries e ON r.entry_id = e.id
  WHERE e.simp IN ('可', '几', '系', '调', '都', '重', '量', '觉', '角', '还', '行');

-- ============================================================================
-- STEP 1: Verify expected malformed entries exist
-- ============================================================================
DO $$
DECLARE
  malformed_count INT;
BEGIN
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE simp IN ('可', '几', '系', '调', '都', '重', '量', '觉', '角', '还', '行')
    AND jsonb_array_length(zhuyin) > 1;

  RAISE NOTICE 'Found % malformed entries to fix', malformed_count;
END $$;

-- ============================================================================
-- STEP 2: Fix primary zhuyin field (11 characters)
-- Primary pronunciation chosen by frequency in HSK1-4 vocabulary
-- ============================================================================
UPDATE dictionary_entries SET zhuyin = '[["ㄎ","ㄜ","ˇ"]]'::jsonb WHERE simp = '可' AND trad = '可';       -- kě (can/may) - most common
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄧ","ˇ"]]'::jsonb WHERE simp = '几' AND trad IN ('幾', '几'); -- jǐ (how many) - HSK1
UPDATE dictionary_entries SET zhuyin = '[["ㄒ","ㄧ","ˋ"]]'::jsonb WHERE simp = '系' AND trad IN ('系', '繫'); -- xì (system) - most common
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄧㄠ","ˊ"]]'::jsonb WHERE simp = '调' AND trad = '調';      -- tiáo (to adjust) - HSK2
UPDATE dictionary_entries SET zhuyin = '[["ㄉ","ㄡ","ˉ"]]'::jsonb WHERE simp = '都' AND trad = '都';        -- dōu (all) - HSK1
UPDATE dictionary_entries SET zhuyin = '[["ㄓ","ㄨㄥ","ˋ"]]'::jsonb WHERE simp = '重' AND trad = '重';      -- zhòng (heavy) - HSK2
UPDATE dictionary_entries SET zhuyin = '[["ㄌ","ㄧㄤ","ˋ"]]'::jsonb WHERE simp = '量' AND trad = '量';      -- liàng (quantity) - HSK3
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄩㄝ","ˊ"]]'::jsonb WHERE simp = '觉' AND trad = '覺';      -- jué (to feel) - HSK2 觉得
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄧㄠ","ˇ"]]'::jsonb WHERE simp = '角' AND trad = '角';      -- jiǎo (corner/angle) - most common
UPDATE dictionary_entries SET zhuyin = '[["ㄏ","ㄞ","ˊ"]]'::jsonb WHERE simp = '还' AND trad = '還';        -- hái (still) - HSK1
UPDATE dictionary_entries SET zhuyin = '[["ㄒ","ㄧㄥ","ˊ"]]'::jsonb WHERE simp = '行' AND trad = '行';      -- xíng (to walk/OK) - HSK1

-- ============================================================================
-- STEP 3: Cascade fix to user readings
-- ============================================================================
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp AND e.trad = d.trad
WHERE r.entry_id = e.id
  AND e.simp IN ('可', '几', '系', '调', '都', '重', '量', '觉', '角', '还', '行');

-- ============================================================================
-- STEP 4: Add constraint to prevent future malformed data
-- Single characters must have single-syllable zhuyin
-- ============================================================================
ALTER TABLE dictionary_entries
ADD CONSTRAINT single_char_single_pronunciation
CHECK (
  char_length(simp) > 1 OR jsonb_array_length(zhuyin) = 1
);

-- ============================================================================
-- STEP 5: Verify fix succeeded
-- ============================================================================
DO $$
DECLARE
  remaining_malformed INT;
BEGIN
  SELECT COUNT(*) INTO remaining_malformed
  FROM dictionary_entries
  WHERE char_length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  IF remaining_malformed > 0 THEN
    RAISE EXCEPTION 'Migration failed: % single-char entries still have multi-syllable zhuyin', remaining_malformed;
  END IF;

  RAISE NOTICE 'SUCCESS: All single characters have single-syllable zhuyin';
END $$;

COMMIT;
