-- Migration 014: Add Missing 4th Tone for 處/处
-- Date: 2025-12-06 (Session 17)
-- GitHub Issue: #18
-- Description: Add both 3rd tone (chǔ) and 4th tone (chù) pronunciations
--
-- Problem: 处/處 currently only has the 3rd tone pronunciation (chǔ) in the database.
-- The 4th tone (chù) is also valid and was being marked as incorrect in Drill A exercises.
--
-- Pronunciation Details:
--   - chǔ (3rd tone): verb meaning "to deal with" or "get along with"
--     Examples: 相处 (get along), 处理 (deal with)
--   - chù (4th tone): noun meaning "place" or "location"
--     Examples: 处所 (place), 办事处 (office), 好处 (benefit)
--
-- Pattern A Structure: Default pronunciation as FIRST element in zhuyin_variants array
-- with context words for ALL pronunciations.
--

BEGIN;

-- Safety check: Ensure character exists before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp = '处' AND trad = '處';

  IF char_count != 1 THEN
    RAISE EXCEPTION 'Expected 1 character entry for 处/處, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: Character 处/處 exists';
END $$;

-- Update 处/處 with proper zhuyin_variants (Pattern A structure)
-- Note: chǔ (3rd tone) is more common as default, but chù (4th tone) is also valid
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chǔ","zhuyin":[["ㄔ","ㄨ","ˇ"]],"context_words":["相处","处理","处于","处在"],"meanings":["to deal with","to handle","to get along with","to be in"]},{"pinyin":"chù","zhuyin":[["ㄔ","ㄨ","ˋ"]],"context_words":["处所","办事处","好处","到处"],"meanings":["place","location","office","benefit"]}]'::jsonb
WHERE simp = '处'
  AND trad = '處';

-- Verification: Check the update was successful
SELECT
  simp,
  trad,
  zhuyin,
  zhuyin_variants,
  jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE simp = '处' AND trad = '處';

COMMIT;

-- END OF MIGRATION
--
-- ROLLBACK SCRIPT (if needed):
/*

-- ROLLBACK: Remove variants added by this migration
-- (Preserves main zhuyin, only clears variants)

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '处' AND trad = '處';

*/
