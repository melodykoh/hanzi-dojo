-- Migration 016: Fix ALL remaining malformed zhuyin entries
-- Issue: Migration 009 stored multiple pronunciations merged in main zhuyin array
-- Bug: Drill A shows merged pronunciations like "ㄎㄜˇ ㄎㄜˋ" instead of "ㄎㄜˇ"
-- Date: 2025-12-15
--
-- Found 68 single-character entries with multi-syllable zhuyin arrays
-- Each needs to be fixed to contain only the primary pronunciation
-- Primary pronunciations chosen by HSK frequency and common usage

BEGIN;

-- ============================================================================
-- STEP 0: Create backups
-- ============================================================================
CREATE TABLE IF NOT EXISTS dictionary_entries_backup_016 AS
  SELECT * FROM dictionary_entries
  WHERE char_length(simp) = 1 AND jsonb_array_length(zhuyin) > 1;

CREATE TABLE IF NOT EXISTS readings_backup_016 AS
  SELECT r.* FROM readings r
  JOIN entries e ON r.entry_id = e.id
  WHERE char_length(e.simp) = 1;

-- ============================================================================
-- STEP 1: Count malformed entries before fix
-- ============================================================================
DO $$
DECLARE
  malformed_count INT;
BEGIN
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE char_length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  RAISE NOTICE 'Found % malformed entries to fix', malformed_count;
END $$;

-- ============================================================================
-- STEP 2: Fix primary zhuyin field (68 characters)
-- Primary pronunciation chosen by frequency in HSK1-4 vocabulary
-- ============================================================================

-- 化 huà (change/transform) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄏ","ㄨㄚ","ˋ"]]'::jsonb WHERE simp = '化' AND trad = '化';

-- 匙 chí (key in 钥匙) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄔ","","ˊ"]]'::jsonb WHERE simp = '匙' AND trad = '匙';

-- 区 qū (area/district) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄑ","ㄩ","ˉ"]]'::jsonb WHERE simp = '区' AND trad = '區';

-- 占 zhàn (to occupy) - more common than zhān (divination)
UPDATE dictionary_entries SET zhuyin = '[["ㄓ","ㄢ","ˋ"]]'::jsonb WHERE simp = '占' AND trad = '占';

-- 卡 kǎ (card) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄎ","ㄚ","ˇ"]]'::jsonb WHERE simp = '卡' AND trad = '卡';

-- 压 yā (pressure) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["","ㄧㄚ","ˉ"]]'::jsonb WHERE simp = '压' AND trad = '壓';

-- 句 jù (sentence) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄩ","ˋ"]]'::jsonb WHERE simp = '句' AND trad = '句';

-- 可 kě (can/may) - HSK1, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄎ","ㄜ","ˇ"]]'::jsonb WHERE simp = '可' AND trad = '可';

-- 台 tái (platform/Taiwan) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄞ","ˊ"]]'::jsonb WHERE simp = '台' AND trad = '台';

-- 各 gè (each) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄍ","ㄜ","ˋ"]]'::jsonb WHERE simp = '各' AND trad = '各';

-- 合 hé (together/fit) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄏ","ㄜ","ˊ"]]'::jsonb WHERE simp = '合' AND trad = '合';

-- 否 fǒu (whether/not) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄈ","ㄡ","ˇ"]]'::jsonb WHERE simp = '否' AND trad = '否';

-- 吧 ba (particle) - neutral tone particle most common
UPDATE dictionary_entries SET zhuyin = '[["ㄅ","ㄚ","˙"]]'::jsonb WHERE simp = '吧' AND trad = '吧';

-- 呀 ya (particle) - neutral tone particle most common
UPDATE dictionary_entries SET zhuyin = '[["","ㄧㄚ","˙"]]'::jsonb WHERE simp = '呀' AND trad = '呀';

-- 咖 kā (coffee) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄎ","ㄚ","ˉ"]]'::jsonb WHERE simp = '咖' AND trad = '咖';

-- 咳 ké (cough) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄎ","ㄜ","ˊ"]]'::jsonb WHERE simp = '咳' AND trad = '咳';

-- 填 tián (to fill) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄧㄢ","ˊ"]]'::jsonb WHERE simp = '填' AND trad = '填';

-- 夫 fū (husband) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄈ","ㄨ","ˉ"]]'::jsonb WHERE simp = '夫' AND trad = '夫';

-- 奇 qí (strange) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄑ","ㄧ","ˊ"]]'::jsonb WHERE simp = '奇' AND trad = '奇';

-- 妻 qī (wife) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄑ","ㄧ","ˉ"]]'::jsonb WHERE simp = '妻' AND trad = '妻';

-- 孙 sūn (grandson/surname) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄙ","ㄨㄣ","ˉ"]]'::jsonb WHERE simp = '孙' AND trad = '孫';

-- 底 dǐ (bottom) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄉ","ㄧ","ˇ"]]'::jsonb WHERE simp = '底' AND trad = '底';

-- 度 dù (degree) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄉ","ㄨ","ˋ"]]'::jsonb WHERE simp = '度' AND trad = '度';

-- 弄 nòng (to do/handle) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄋ","ㄨㄥ","ˋ"]]'::jsonb WHERE simp = '弄' AND trad = '弄';

-- 思 sī (think) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄙ","","ˉ"]]'::jsonb WHERE simp = '思' AND trad = '思';

-- 愉 yú (pleasant) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["","ㄩ","ˊ"]]'::jsonb WHERE simp = '愉' AND trad = '愉';

-- 戏 xì (play/drama) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄒ","ㄧ","ˋ"]]'::jsonb WHERE simp = '戏' AND trad = '戲';

-- 打 dǎ (hit/play) - HSK1, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄉ","ㄚ","ˇ"]]'::jsonb WHERE simp = '打' AND trad = '打';

-- 择 zé (choose) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄗ","ㄜ","ˊ"]]'::jsonb WHERE simp = '择' AND trad = '擇';

-- 拾 shí (pick up/ten formal) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","","ˊ"]]'::jsonb WHERE simp = '拾' AND trad = '拾';

-- 排 pái (row/arrange) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄆ","ㄞ","ˊ"]]'::jsonb WHERE simp = '排' AND trad = '排';

-- 散 sàn (disperse) - more common than sǎn
UPDATE dictionary_entries SET zhuyin = '[["ㄙ","ㄢ","ˋ"]]'::jsonb WHERE simp = '散' AND trad = '散';

-- 景 jǐng (scenery) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄧㄥ","ˇ"]]'::jsonb WHERE simp = '景' AND trad = '景';

-- 服 fú (clothes/serve) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄈ","ㄨ","ˊ"]]'::jsonb WHERE simp = '服' AND trad = '服';

-- 条 tiáo (strip/classifier) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄧㄠ","ˊ"]]'::jsonb WHERE simp = '条' AND trad = '條';

-- 查 chá (check/investigate) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄔ","ㄚ","ˊ"]]'::jsonb WHERE simp = '查' AND trad = '查';

-- 校 xiào (school) - HSK1, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄒ","ㄧㄠ","ˋ"]]'::jsonb WHERE simp = '校' AND trad = '校';

-- 椅 yǐ (chair) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["","ㄧ","ˇ"]]'::jsonb WHERE simp = '椅' AND trad = '椅';

-- 汗 hàn (sweat) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄏ","ㄢ","ˋ"]]'::jsonb WHERE simp = '汗' AND trad = '汗';

-- 汤 tāng (soup) - HSK2, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄤ","ˉ"]]'::jsonb WHERE simp = '汤' AND trad = '湯';

-- 沙 shā (sand) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","ㄚ","ˉ"]]'::jsonb WHERE simp = '沙' AND trad = '沙';

-- 济 jì (economy in 经济) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄧ","ˋ"]]'::jsonb WHERE simp = '济' AND trad = '濟';

-- 父 fù (father) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄈ","ㄨ","ˋ"]]'::jsonb WHERE simp = '父' AND trad = '父';

-- 片 piàn (piece/slice) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄆ","ㄧㄢ","ˋ"]]'::jsonb WHERE simp = '片' AND trad = '片';

-- 甚 shèn (very/what) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","ㄣ","ˋ"]]'::jsonb WHERE simp = '甚' AND trad = '甚';

-- 疑 yí (doubt) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["","ㄧ","ˊ"]]'::jsonb WHERE simp = '疑' AND trad = '疑';

-- 研 yán (research) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["","ㄧㄢ","ˊ"]]'::jsonb WHERE simp = '研' AND trad = '研';

-- 硕 shuò (master's degree) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","ㄨㄛ","ˋ"]]'::jsonb WHERE simp = '硕' AND trad = '碩';

-- 票 piào (ticket) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄆ","ㄧㄠ","ˋ"]]'::jsonb WHERE simp = '票' AND trad = '票';

-- 禁 jìn (prohibit in 禁止) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄐ","ㄧㄣ","ˋ"]]'::jsonb WHERE simp = '禁' AND trad = '禁';

-- 稍 shāo (slightly) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","ㄠ","ˉ"]]'::jsonb WHERE simp = '稍' AND trad = '稍';

-- 约 yuē (appointment/about) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["","ㄩㄝ","ˉ"]]'::jsonb WHERE simp = '约' AND trad = '約';

-- 肚 dù (belly) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄉ","ㄨ","ˋ"]]'::jsonb WHERE simp = '肚' AND trad = '肚';

-- 胳 gē (arm in 胳膊) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄍ","ㄜ","ˉ"]]'::jsonb WHERE simp = '胳' AND trad = '胳';

-- 膏 gāo (paste/cream) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄍ","ㄠ","ˉ"]]'::jsonb WHERE simp = '膏' AND trad = '膏';

-- 苹 píng (apple in 苹果) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄆ","ㄧㄣ","ˊ"]]'::jsonb WHERE simp = '苹' AND trad = '蘋';

-- 被 bèi (quilt/passive marker) - HSK2, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄅ","ㄟ","ˋ"]]'::jsonb WHERE simp = '被' AND trad = '被';

-- 观 guān (view/watch) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄍ","ㄨㄢ","ˉ"]]'::jsonb WHERE simp = '观' AND trad = '觀';

-- 论 lùn (discuss/theory) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄌ","ㄨㄣ","ˋ"]]'::jsonb WHERE simp = '论' AND trad = '論';

-- 语 yǔ (language) - HSK1, most common
UPDATE dictionary_entries SET zhuyin = '[["","ㄩ","ˇ"]]'::jsonb WHERE simp = '语' AND trad = '語';

-- 谁 shuí (who) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄕ","ㄨㄟ","ˊ"]]'::jsonb WHERE simp = '谁' AND trad = '誰';

-- 责 zé (responsibility) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄗ","ㄜ","ˊ"]]'::jsonb WHERE simp = '责' AND trad = '責';

-- 赚 zhuàn (earn money) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄓ","ㄨㄢ","ˋ"]]'::jsonb WHERE simp = '赚' AND trad = '賺';

-- 趟 tàng (trip classifier) - most common usage
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄤ","ˋ"]]'::jsonb WHERE simp = '趟' AND trad = '趟';

-- 趣 qù (interest) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄑ","ㄩ","ˋ"]]'::jsonb WHERE simp = '趣' AND trad = '趣';

-- 跳 tiào (jump) - HSK2, most common
UPDATE dictionary_entries SET zhuyin = '[["ㄊ","ㄧㄠ","ˋ"]]'::jsonb WHERE simp = '跳' AND trad = '跳';

-- 钢 gāng (steel) - standard pronunciation
UPDATE dictionary_entries SET zhuyin = '[["ㄍ","ㄤ","ˉ"]]'::jsonb WHERE simp = '钢' AND trad = '鋼';

-- ============================================================================
-- STEP 3: Cascade fix to user readings
-- ============================================================================
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp AND e.trad = d.trad
WHERE r.entry_id = e.id
  AND char_length(e.simp) = 1;

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

  RAISE NOTICE 'SUCCESS: All 68 single characters now have single-syllable zhuyin';
END $$;

COMMIT;
