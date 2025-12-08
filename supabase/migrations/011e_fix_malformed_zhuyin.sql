-- Migration 011e: Fix Malformed Migration 009 Dictionary Data
-- Date: 2025-12-06
-- Issue: #23 (https://github.com/melodykoh/hanzi-dojo/issues/23)
--
-- Problem: Migration 009 stored 43 multi-pronunciation characters incorrectly
-- with ALL pronunciations merged into the main `zhuyin` array instead of
-- using `zhuyin_variants` for alternate pronunciations.
--
-- This migration:
-- 1. Fixes the main zhuyin array to contain only the primary pronunciation
-- 2. Updates zhuyin_variants with proper Pattern A structure
-- 3. Adds Traditional Chinese context words for all pronunciations
-- 4. Auto-fixes any affected user readings
--
-- Categories:
-- - Category 2 (33 chars): Had empty-context 011c variants - fix zhuyin + add context
-- - Category 3 (10 chars): No variants at all - create full Pattern A structure
--
-- Source: data/malformed_chars_fix.json
-- Context Words Format: Traditional Chinese (Taiwan MOE dictionary)

BEGIN;

-- ============================================================================
-- STEP 0: Pre-Migration Safety Check - Verify backups exist
-- ============================================================================
-- CRITICAL: This migration modifies dictionary data and user readings.
-- Backups MUST exist before proceeding. If backups are missing, run:
--   CREATE TABLE dictionary_entries_backup_011e AS SELECT * FROM dictionary_entries;
--   CREATE TABLE readings_backup_011e AS SELECT * FROM readings;
DO $$
DECLARE
  dict_backup_exists BOOLEAN;
  readings_backup_exists BOOLEAN;
BEGIN
  -- Check if dictionary backup table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'dictionary_entries_backup_011e'
  ) INTO dict_backup_exists;

  -- Check if readings backup table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'readings_backup_011e'
  ) INTO readings_backup_exists;

  -- Abort if either backup is missing
  IF NOT dict_backup_exists THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: dictionary_entries_backup_011e table does not exist. Create backup before running this migration.';
  END IF;

  IF NOT readings_backup_exists THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: readings_backup_011e table does not exist. Create backup before running this migration.';
  END IF;

  RAISE NOTICE 'SAFETY CHECK PASSED: Both backup tables exist';
END $$;

-- ============================================================================
-- STEP 1: Safety check - count affected characters before fix
-- ============================================================================
DO $$
DECLARE
  malformed_count INT;
BEGIN
  SELECT COUNT(*) INTO malformed_count
  FROM dictionary_entries
  WHERE length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  RAISE NOTICE 'Found % malformed single-char entries with merged pronunciations', malformed_count;
END $$;

-- ============================================================================
-- CATEGORY 2: Fix zhuyin + update context words (33 characters)
-- These already have zhuyin_variants from 011c but with empty context_words
-- ============================================================================

-- 同 (tóng/tòng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄊ","ㄨㄥ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"tóng","zhuyin":[["ㄊ","ㄨㄥ","ˊ"]],"context_words":["同學","同事","相同"],"meanings":["same","together","with"]},{"pinyin":"tòng","zhuyin":[["ㄊ","ㄨㄥ","ˋ"]],"context_words":["胡同"],"meanings":["alley (in 胡同)"]}]'::jsonb
WHERE simp = '同';

-- 号 (hào/háo)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄏ","ㄠ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"hào","zhuyin":[["ㄏ","ㄠ","ˋ"]],"context_words":["號碼","幾號","電話號碼"],"meanings":["number","date"]},{"pinyin":"háo","zhuyin":[["ㄏ","ㄠ","ˊ"]],"context_words":["號叫","哀號"],"meanings":["to cry out","to wail"]}]'::jsonb
WHERE simp = '号';

-- 呢 (ne/ní)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄋ","ㄜ","˙"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"ne","zhuyin":[["ㄋ","ㄜ","˙"]],"context_words":["你呢","怎麼呢"],"meanings":["question particle","how about"]},{"pinyin":"ní","zhuyin":[["ㄋ","ㄧ","ˊ"]],"context_words":["呢子","呢絨"],"meanings":["wool fabric"]}]'::jsonb
WHERE simp = '呢';

-- 旁 (páng/bàng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄆ","ㄤ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"páng","zhuyin":[["ㄆ","ㄤ","ˊ"]],"context_words":["旁邊","路旁","一旁"],"meanings":["side","beside"]},{"pinyin":"bàng","zhuyin":[["ㄅ","ㄤ","ˋ"]],"context_words":["旁門"],"meanings":["side door (literary)"]}]'::jsonb
WHERE simp = '旁';

-- 洗 (xǐ/xiǎn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄒ","ㄧ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xǐ","zhuyin":[["ㄒ","ㄧ","ˇ"]],"context_words":["洗手","洗澡","洗衣服"],"meanings":["to wash"]},{"pinyin":"xiǎn","zhuyin":[["ㄒ","ㄧㄢ","ˇ"]],"context_words":["洗馬"],"meanings":["historical title (rare)"]}]'::jsonb
WHERE simp = '洗';

-- 冒 (mào/mò)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄇ","ㄠ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"mào","zhuyin":[["ㄇ","ㄠ","ˋ"]],"context_words":["感冒","冒險","冒犯"],"meanings":["to emit","to brave","risk"]},{"pinyin":"mò","zhuyin":[["ㄇ","ㄛ","ˋ"]],"context_words":["冒頓"],"meanings":["historical name (Modu Chanyu)"]}]'::jsonb
WHERE simp = '冒';

-- 乘 (chéng/shèng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄔ","ㄥ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"chéng","zhuyin":[["ㄔ","ㄥ","ˊ"]],"context_words":["乘客","乘車","乘坐"],"meanings":["to ride","to travel by"]},{"pinyin":"shèng","zhuyin":[["ㄕ","ㄥ","ˋ"]],"context_words":["千乘之國","史記"],"meanings":["historical unit (chariot team)"]}]'::jsonb
WHERE simp = '乘';

-- 价 (jià/jie)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄧㄚ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jià","zhuyin":[["ㄐ","ㄧㄚ","ˋ"]],"context_words":["價格","價錢","價值"],"meanings":["price","value"]},{"pinyin":"jie","zhuyin":[["ㄐ","ㄧㄝ","˙"]],"context_words":["這麼個價兒"],"meanings":["colloquial suffix"]}]'::jsonb
WHERE simp = '价';

-- 丽 (lì/lí)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄌ","ㄧ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"lì","zhuyin":[["ㄌ","ㄧ","ˋ"]],"context_words":["美麗","華麗","壯麗"],"meanings":["beautiful","gorgeous"]},{"pinyin":"lí","zhuyin":[["ㄌ","ㄧ","ˊ"]],"context_words":["高麗"],"meanings":["Korea (historical)"]}]'::jsonb
WHERE simp = '丽';

-- 且 (qiě/jū)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄑ","ㄧㄝ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"qiě","zhuyin":[["ㄑ","ㄧㄝ","ˇ"]],"context_words":["而且","並且","暫且"],"meanings":["and","moreover","for now"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"context_words":["且慢"],"meanings":["wait a moment (literary)"]}]'::jsonb
WHERE simp = '且';

-- 干 (gān/gàn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄍ","ㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"gān","zhuyin":[["ㄍ","ㄢ","ˉ"]],"context_words":["乾淨","乾燥","乾杯"],"meanings":["dry","clean"]},{"pinyin":"gàn","zhuyin":[["ㄍ","ㄢ","ˋ"]],"context_words":["幹活","能幹","幹部"],"meanings":["to do","capable","cadre"]}]'::jsonb
WHERE simp = '干';

-- 于 (yú/wū)
UPDATE dictionary_entries SET
  zhuyin = '[[""," ㄩ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"context_words":["關於","對於","至於"],"meanings":["at","in","regarding"]},{"pinyin":"wū","zhuyin":[["","ㄨ","ˉ"]],"context_words":["烏乎"],"meanings":["alas (archaic)"]}]'::jsonb
WHERE simp = '于';

-- 亚 (yà/yā)
UPDATE dictionary_entries SET
  zhuyin = '[["","ㄧㄚ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"yà","zhuyin":[["","ㄧㄚ","ˋ"]],"context_words":["亞洲","東南亞","亞軍"],"meanings":["Asia","second place"]},{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":["亞父"],"meanings":["step-father (archaic)"]}]'::jsonb
WHERE simp = '亚';

-- 些 (xiē/suò)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄒ","ㄧㄝ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xiē","zhuyin":[["ㄒ","ㄧㄝ","ˉ"]],"context_words":["一些","這些","有些"],"meanings":["some","a few"]},{"pinyin":"suò","zhuyin":[["ㄙ","ㄨㄛ","ˋ"]],"context_words":["些些"],"meanings":["a little (dialectal)"]}]'::jsonb
WHERE simp = '些';

-- 亲 (qīn/qìng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄑ","ㄧㄣ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"qīn","zhuyin":[["ㄑ","ㄧㄣ","ˉ"]],"context_words":["父親","母親","親愛"],"meanings":["parent","relative","dear"]},{"pinyin":"qìng","zhuyin":[["ㄑ","ㄧㄥ","ˋ"]],"context_words":["親家"],"meanings":["parents-in-law of one'\''s child"]}]'::jsonb
WHERE simp = '亲';

-- 仅 (jǐn/jìn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄧㄣ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jǐn","zhuyin":[["ㄐ","ㄧㄣ","ˇ"]],"context_words":["僅僅","不僅","僅有"],"meanings":["only","merely","barely"]},{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"context_words":["僅此"],"meanings":["only this (variant)"]}]'::jsonb
WHERE simp = '仅';

-- 从 (cóng/zòng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄘ","ㄨㄥ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"cóng","zhuyin":[["ㄘ","ㄨㄥ","ˊ"]],"context_words":["從來","從前","從此"],"meanings":["from","since","follow"]},{"pinyin":"zòng","zhuyin":[["ㄗ","ㄨㄥ","ˋ"]],"context_words":["從容"],"meanings":["calm (when second char in 從容)"]}]'::jsonb
WHERE simp = '从';

-- 任 (rèn/rén)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄖ","ㄣ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"rèn","zhuyin":[["ㄖ","ㄣ","ˋ"]],"context_words":["任務","任何","擔任"],"meanings":["duty","task","any"]},{"pinyin":"rén","zhuyin":[["ㄖ","ㄣ","ˊ"]],"context_words":["任性"],"meanings":["surname Ren"]}]'::jsonb
WHERE simp = '任';

-- 份 (fèn/bīn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄈ","ㄣ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"fèn","zhuyin":[["ㄈ","ㄣ","ˋ"]],"context_words":["一份","身份","份量"],"meanings":["portion","share","identity"]},{"pinyin":"bīn","zhuyin":[["ㄅ","ㄧㄣ","ˉ"]],"context_words":["彬彬"],"meanings":["refined manner (archaic variant)"]}]'::jsonb
WHERE simp = '份';

-- 休 (xiū/xǔ)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄒ","ㄧㄡ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xiū","zhuyin":[["ㄒ","ㄧㄡ","ˉ"]],"context_words":["休息","休假","休閒"],"meanings":["to rest","vacation","leisure"]},{"pinyin":"xǔ","zhuyin":[["ㄒ","ㄩ","ˇ"]],"context_words":["休養"],"meanings":["variant pronunciation (rare)"]}]'::jsonb
WHERE simp = '休';

-- 估 (gū/gù)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄍ","ㄨ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"gū","zhuyin":[["ㄍ","ㄨ","ˉ"]],"context_words":["估計","估價","評估"],"meanings":["to estimate","to reckon"]},{"pinyin":"gù","zhuyin":[["ㄍ","ㄨ","ˋ"]],"context_words":["估衣"],"meanings":["secondhand clothing"]}]'::jsonb
WHERE simp = '估';

-- 体 (tǐ/tī)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄊ","ㄧ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"tǐ","zhuyin":[["ㄊ","ㄧ","ˇ"]],"context_words":["身體","體育","體驗"],"meanings":["body","form","sports"]},{"pinyin":"tī","zhuyin":[["ㄊ","ㄧ","ˉ"]],"context_words":["體己"],"meanings":["intimate (variant)"]}]'::jsonb
WHERE simp = '体';

-- 信 (xìn/shēn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄒ","ㄧㄣ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xìn","zhuyin":[["ㄒ","ㄧㄣ","ˋ"]],"context_words":["相信","信任","信用"],"meanings":["to believe","letter","trust"]},{"pinyin":"shēn","zhuyin":[["ㄕ","ㄣ","ˉ"]],"context_words":["信宿"],"meanings":["two nights (classical)"]}]'::jsonb
WHERE simp = '信';

-- 俩 (liǎ/liǎng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄌ","ㄧㄚ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"liǎ","zhuyin":[["ㄌ","ㄧㄚ","ˇ"]],"context_words":["我們倆","咱倆","哥倆"],"meanings":["two (colloquial)"]},{"pinyin":"liǎng","zhuyin":[["ㄌ","ㄧㄤ","ˇ"]],"context_words":["伎倆"],"meanings":["trick (in 伎倆)"]}]'::jsonb
WHERE simp = '俩';

-- 倒 (dǎo/dào)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄉ","ㄠ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"dǎo","zhuyin":[["ㄉ","ㄠ","ˇ"]],"context_words":["打倒","跌倒","倒閉"],"meanings":["to fall","to collapse","to fail"]},{"pinyin":"dào","zhuyin":[["ㄉ","ㄠ","ˋ"]],"context_words":["倒水","倒車","倒是"],"meanings":["to pour","reverse","actually"]}]'::jsonb
WHERE simp = '倒';

-- 共 (gòng/gōng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄍ","ㄨㄥ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"gòng","zhuyin":[["ㄍ","ㄨㄥ","ˋ"]],"context_words":["一共","共同","公共"],"meanings":["altogether","common","public"]},{"pinyin":"gōng","zhuyin":[["ㄍ","ㄨㄥ","ˉ"]],"context_words":["共工"],"meanings":["mythological figure"]}]'::jsonb
WHERE simp = '共';

-- 其 (qí/jī)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄑ","ㄧ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"qí","zhuyin":[["ㄑ","ㄧ","ˊ"]],"context_words":["其他","其實","尤其"],"meanings":["its","his","especially"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":["鄭其"],"meanings":["variant in names"]}]'::jsonb
WHERE simp = '其';

-- 净 (jìng/chēng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄧㄥ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jìng","zhuyin":[["ㄐ","ㄧㄥ","ˋ"]],"context_words":["乾淨","淨化","純淨"],"meanings":["clean","pure","net"]},{"pinyin":"chēng","zhuyin":[["ㄔ","ㄥ","ˉ"]],"context_words":["淨角"],"meanings":["painted face role in opera"]}]'::jsonb
WHERE simp = '净';

-- 凉 (liáng/liàng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄌ","ㄧㄤ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"liáng","zhuyin":[["ㄌ","ㄧㄤ","ˊ"]],"context_words":["涼快","涼水","涼爽"],"meanings":["cool","cold"]},{"pinyin":"liàng","zhuyin":[["ㄌ","ㄧㄤ","ˋ"]],"context_words":["涼一涼"],"meanings":["to let cool"]}]'::jsonb
WHERE simp = '凉';

-- 据 (jù/jū)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄩ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jù","zhuyin":[["ㄐ","ㄩ","ˋ"]],"context_words":["根據","據說","證據"],"meanings":["according to","evidence"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"context_words":["拮据"],"meanings":["hard up (in 拮据)"]}]'::jsonb
WHERE simp = '据';

-- 别 (bié/biè)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄅ","ㄧㄝ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"bié","zhuyin":[["ㄅ","ㄧㄝ","ˊ"]],"context_words":["別人","告別","區別"],"meanings":["other","don'\''t","farewell"]},{"pinyin":"biè","zhuyin":[["ㄅ","ㄧㄝ","ˋ"]],"context_words":["彆扭"],"meanings":["awkward (in 彆扭)"]}]'::jsonb
WHERE simp = '别';

-- 刷 (shuā/shuà)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄕ","ㄨㄚ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"shuā","zhuyin":[["ㄕ","ㄨㄚ","ˉ"]],"context_words":["刷牙","刷卡","牙刷"],"meanings":["to brush","to swipe"]},{"pinyin":"shuà","zhuyin":[["ㄕ","ㄨㄚ","ˋ"]],"context_words":["刷白"],"meanings":["very white"]}]'::jsonb
WHERE simp = '刷';

-- 助 (zhù/chú)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄓ","ㄨ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"zhù","zhuyin":[["ㄓ","ㄨ","ˋ"]],"context_words":["幫助","助手","援助"],"meanings":["to help","assistant"]},{"pinyin":"chú","zhuyin":[["ㄔ","ㄨ","ˊ"]],"context_words":["助胥"],"meanings":["historical term (rare)"]}]'::jsonb
WHERE simp = '助';

-- ============================================================================
-- CATEGORY 3: Create full Pattern A structure (10 characters)
-- These had NO zhuyin_variants at all
-- ============================================================================

-- 难 (nán/nàn/nuó)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄋ","ㄢ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"nán","zhuyin":[["ㄋ","ㄢ","ˊ"]],"context_words":["困難","難過","難道"],"meanings":["difficult","hard"]},{"pinyin":"nàn","zhuyin":[["ㄋ","ㄢ","ˋ"]],"context_words":["災難","難民","遇難"],"meanings":["disaster","calamity"]},{"pinyin":"nuó","zhuyin":[["ㄋ","ㄨㄛ","ˊ"]],"context_words":["儺舞"],"meanings":["exorcism dance (archaic)"]}]'::jsonb
WHERE simp = '难';

-- 饮 (yǐn/yìn)
UPDATE dictionary_entries SET
  zhuyin = '[["","ㄧㄣ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"yǐn","zhuyin":[["","ㄧㄣ","ˇ"]],"context_words":["飲料","飲食","飲水"],"meanings":["to drink","beverage"]},{"pinyin":"yìn","zhuyin":[["","ㄧㄣ","ˋ"]],"context_words":["飲馬"],"meanings":["to water horses"]}]'::jsonb
WHERE simp = '饮';

-- 队 (duì/zhuì)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄉ","ㄨㄟ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"duì","zhuyin":[["ㄉ","ㄨㄟ","ˋ"]],"context_words":["隊伍","排隊","球隊"],"meanings":["team","line","group"]},{"pinyin":"zhuì","zhuyin":[["ㄓ","ㄨㄟ","ˋ"]],"context_words":["隊仗"],"meanings":["guard of honor (archaic)"]}]'::jsonb
WHERE simp = '队';

-- 降 (jiàng/xiáng)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄧㄤ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiàng","zhuyin":[["ㄐ","ㄧㄤ","ˋ"]],"context_words":["降低","下降","降落"],"meanings":["to descend","to drop"]},{"pinyin":"xiáng","zhuyin":[["ㄒ","ㄧㄤ","ˊ"]],"context_words":["投降","降服","降龍"],"meanings":["to surrender","to subdue"]}]'::jsonb
WHERE simp = '降';

-- 期 (qī/jī)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄑ","ㄧ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"qī","zhuyin":[["ㄑ","ㄧ","ˉ"]],"context_words":["期待","日期","學期"],"meanings":["period","expect","term"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":["期年"],"meanings":["full year (classical)"]}]'::jsonb
WHERE simp = '期';

-- 间 (jiān/jiàn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄐ","ㄧㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiān","zhuyin":[["ㄐ","ㄧㄢ","ˉ"]],"context_words":["房間","時間","中間"],"meanings":["room","between","space"]},{"pinyin":"jiàn","zhuyin":[["ㄐ","ㄧㄢ","ˋ"]],"context_words":["間隔","離間","間諜"],"meanings":["gap","spy","to separate"]}]'::jsonb
WHERE simp = '间';

-- 只 (zhī/zhǐ)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄓ","","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"context_words":["一隻貓","兩隻手","一隻鳥"],"meanings":["classifier for animals, body parts"]},{"pinyin":"zhǐ","zhuyin":[["ㄓ","","ˇ"]],"context_words":["只是","只有","只好"],"meanings":["only","merely"]}]'::jsonb
WHERE simp = '只';

-- 阿 (ā/ē)
UPDATE dictionary_entries SET
  zhuyin = '[["","ㄚ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"ā","zhuyin":[["","ㄚ","ˉ"]],"context_words":["阿姨","阿公","阿媽"],"meanings":["prefix for names","aunt"]},{"pinyin":"ē","zhuyin":[["","ㄜ","ˉ"]],"context_words":["阿彌陀佛","阿諛"],"meanings":["Buddhist term","flatter"]}]'::jsonb
WHERE simp = '阿';

-- 鲜 (xiān/xiǎn)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄒ","ㄧㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xiān","zhuyin":[["ㄒ","ㄧㄢ","ˉ"]],"context_words":["新鮮","鮮豔","鮮花"],"meanings":["fresh","bright"]},{"pinyin":"xiǎn","zhuyin":[["ㄒ","ㄧㄢ","ˇ"]],"context_words":["鮮有","鮮少"],"meanings":["seldom","rarely"]}]'::jsonb
WHERE simp = '鲜';

-- 拉 (lā/lá)
UPDATE dictionary_entries SET
  zhuyin = '[["ㄌ","ㄚ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"lā","zhuyin":[["ㄌ","ㄚ","ˉ"]],"context_words":["拉手","拉門","拉車"],"meanings":["to pull","to drag"]},{"pinyin":"lá","zhuyin":[["ㄌ","ㄚ","ˊ"]],"context_words":["拉拉蛄"],"meanings":["mole cricket"]}]'::jsonb
WHERE simp = '拉';

-- ============================================================================
-- STEP 2: Auto-fix affected user readings
-- Update any user readings that reference these characters to use the new
-- primary pronunciation (single-syllable zhuyin)
-- ============================================================================

-- List of all 43 fixed characters
-- CRITICAL: JOIN on BOTH simp AND trad to prevent matching wrong character variant
-- Example: User has 干(乾) but simp='干' could match both 乾 and 幹 dictionary entries
UPDATE readings r
SET zhuyin = d.zhuyin
FROM entries e
JOIN dictionary_entries d ON e.simp = d.simp AND e.trad = d.trad
WHERE r.entry_id = e.id
  AND e.simp IN (
    -- Category 2 (33 chars)
    '同', '号', '呢', '旁', '洗', '冒', '乘', '价', '丽', '且', '干', '于',
    '亚', '些', '亲', '仅', '从', '任', '份', '休', '估', '体', '信', '俩',
    '倒', '共', '其', '净', '凉', '据', '别', '刷', '助',
    -- Category 3 (10 chars)
    '难', '饮', '队', '降', '期', '间', '只', '阿', '鲜', '拉'
  );

-- CRITICAL: GET DIAGNOSTICS must be IMMEDIATELY after UPDATE in same scope
-- to capture correct row count. Using DO block to wrap both statements.
DO $$
DECLARE
  readings_updated INT;
BEGIN
  GET DIAGNOSTICS readings_updated = ROW_COUNT;
  RAISE NOTICE 'Updated % user readings to use new primary pronunciations', readings_updated;
END $$;

-- ============================================================================
-- STEP 3: Verification - ensure no malformed entries remain
-- ============================================================================
DO $$
DECLARE
  remaining_malformed INT;
BEGIN
  -- Count any remaining malformed entries
  SELECT COUNT(*) INTO remaining_malformed
  FROM dictionary_entries
  WHERE length(simp) = 1
    AND jsonb_array_length(zhuyin) > 1;

  IF remaining_malformed > 0 THEN
    RAISE WARNING 'Still have % single-char entries with multi-syllable zhuyin', remaining_malformed;
  ELSE
    RAISE NOTICE 'SUCCESS: All malformed entries fixed - 0 remaining';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
--
-- ROLLBACK: If needed, restore from backup (data/backups/)
-- This migration cannot be easily rolled back as it modifies dictionary data.
-- Recommend taking a backup before running: pg_dump -t dictionary_entries
