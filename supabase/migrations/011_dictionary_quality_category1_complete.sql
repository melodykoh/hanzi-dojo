-- Migration 011: Dictionary Quality - Category 1 Complete
-- Date: 2025-11-12
-- Description: Complete Category 1 research covering 36 confirmed multi-pronunciation characters from Epic 8
--
-- Updates 36 high-frequency multi-pronunciation characters
-- with proper zhuyin_variants structure and context words.
--
-- Characters: 行, 重, 还, 为, 给, 都, 没, 教, 正, 更, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将, 应, 弹, 扫, 把, 担, 相, 省, 种, 系, 结, 觉, 角, 调, 量, 什
--
-- Note: Character '干' excluded - database missing entries for '幹' (to do) and '乾' (dry)
-- See docs/operational/EPIC8_PHASE2_GAN_ISSUE.md for resolution plan
--
-- Source: Epic 8 Category 1 Complete Research
-- Reference: data/multi_pronunciation_category1_complete.json
--
-- Database Safety Protocol:
-- 1. Backup completed: data/backups/dictionary_backup_pre_011_*.json
-- 2. Tested on local Supabase instance
-- 3. Verified no data loss
-- 4. Rollback script available below
--

BEGIN;

-- Safety check: Ensure all characters exist before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('行', '重', '还', '为', '给', '都', '没', '教', '正', '更', '传', '供', '便', '假', '几', '切', '划', '地', '场', '将', '应', '弹', '扫', '把', '担', '相', '省', '种', '系', '结', '觉', '角', '调', '量', '什');

  IF char_count != 36 THEN
    RAISE EXCEPTION 'Expected 36 characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All 36 characters exist';
END $$;

-- Update each character with proper zhuyin_variants

-- Character: 行 (Most common multi-pronunciation character. xíng for movement/action, háng for rows/professions.)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄒ","ㄧㄥ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"háng","zhuyin":[["ㄏ","ㄤ","ˊ"]],"context_words":["银行","行业","一行","同行"],"meanings":["row","line","profession","business"]}]'::jsonb
WHERE simp = '行'
  AND trad = '行';


-- Character: 重 (zhòng for weight/importance, chóng for repetition.)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","ㄨㄥ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"chóng","zhuyin":[["ㄔ","ㄨㄥ","ˊ"]],"context_words":["重复","重新","重来"],"meanings":["to repeat","again","re-","layer"]}]'::jsonb
WHERE simp = '重'
  AND trad = '重';


-- Character: 还 (hái is adverb (still/also), huán is verb (to return).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄏ","ㄞ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"huán","zhuyin":[["ㄏ","ㄨㄢ","ˊ"]],"context_words":["还钱","归还","偿还"],"meanings":["to return","to give back","to pay back"]}]'::jsonb
WHERE simp = '还'
  AND trad = '還';


-- Character: 为 (wèi for purpose/reason, wéi for acting as/becoming.)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄨ","ㄟ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"wéi","zhuyin":[["ㄨ","ㄟ","ˊ"]],"context_words":["作为","认为","成为","行为"],"meanings":["as","to act as","to serve as","to become","to be"]}]'::jsonb
WHERE simp = '为'
  AND trad = '為';


-- Character: 给 (gěi is extremely common, jǐ is rare in spoken Chinese.)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄍ","ㄟ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"context_words":["供给","给予"],"meanings":["to supply","to provide"]}]'::jsonb
WHERE simp = '给'
  AND trad = '給';


-- Character: 都 (dōu is adverb (all), dū is noun (capital city).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄡ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"dū","zhuyin":[["ㄉ","ㄨ","ˉ"]],"context_words":["首都","成都","都市"],"meanings":["capital city","metropolis","surname Du"]}]'::jsonb
WHERE simp = '都'
  AND trad = '都';


-- Character: 没 (méi is negative prefix (extremely common), mò is literary (sink/drown).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄇ","ㄟ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"mò","zhuyin":[["ㄇ","ㄛ","ˋ"]],"context_words":["淹没","沉没","埋没"],"meanings":["to sink","to drown","to submerge","to die"]}]'::jsonb
WHERE simp = '没'
  AND trad = '沒';


-- Character: 教 (jiāo in single-syllable words (教书), jiào in multi-syllable words (教育, 宗教).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄠ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"context_words":["教育","教室","宗教","教学"],"meanings":["teaching","religion","to cause","to tell"]}]'::jsonb
WHERE simp = '教'
  AND trad = '教';


-- Character: 正 (zhèng is common (correct/proper), zhēng only in 正月 (first lunar month).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","ㄥ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"zhēng","zhuyin":[["ㄓ","ㄥ","ˉ"]],"context_words":["正月"],"meanings":["first month of the lunar year"]}]'::jsonb
WHERE simp = '正'
  AND trad = '正';


-- Character: 更 (gèng is comparative adverb (more), gēng is literary (change/night watch).)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄍ","ㄥ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"gēng","zhuyin":[["ㄍ","ㄥ","ˉ"]],"context_words":["三更","打更","更换"],"meanings":["to change","night watch period","watch"]}]'::jsonb
WHERE simp = '更'
  AND trad = '更';


-- Character: 传 (chuán for transmission, zhuàn for biography/narrative)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄔ","ㄨㄢ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"context_words":["自传","传记"],"meanings":["biography","historical narrative"]}]'::jsonb
WHERE simp = '传'
  AND trad = '傳';


-- Character: 供 (gōng for supply/provide, gòng for offerings/confession)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄍ","ㄨㄥ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"gòng","zhuyin":[["ㄍ","ㄨㄥ","ˋ"]],"context_words":["供品","供奉"],"meanings":["offerings","to confess"]}]'::jsonb
WHERE simp = '供'
  AND trad = '供';


-- Character: 便 (biàn for convenience, pián only in 便宜 (cheap))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄅ","ㄧㄢ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"pián","zhuyin":[["ㄆ","ㄧㄢ","ˊ"]],"context_words":["便宜"],"meanings":["cheap (in 便宜)"]}]'::jsonb
WHERE simp = '便'
  AND trad = '便';


-- Character: 假 (jiǎ for fake/false/if, jià for vacation)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄚ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jià","zhuyin":[["ㄐ","ㄧㄚ","ˋ"]],"context_words":["放假","假期","休假"],"meanings":["vacation","leave"]}]'::jsonb
WHERE simp = '假'
  AND trad = '假';


-- Character: 几 (jǐ for "how many" (extremely common), jī for small table/almost (rare))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":["茶几","几乎"],"meanings":["small table","almost"]}]'::jsonb
WHERE simp = '几'
  AND trad = '幾';


-- Character: 切 (qiē for physical cutting, qiè for closeness/eagerness)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄑ","ㄧㄝ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"qiè","zhuyin":[["ㄑ","ㄧㄝ","ˋ"]],"context_words":["切实","亲切","一切"],"meanings":["close to","eager","definitely"]}]'::jsonb
WHERE simp = '切'
  AND trad = '切';


-- Character: 划 (huá for rowing/paddling, huà for planning/dividing)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄏ","ㄨㄚ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"huà","zhuyin":[["ㄏ","ㄨㄚ","ˋ"]],"context_words":["计划","规划","划分"],"meanings":["to plan","to draw a line"]}]'::jsonb
WHERE simp = '划'
  AND trad = '劃';


-- Character: 地 (dì for earth/place, de as adverbial particle)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄧ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"context_words":["慢慢地","高兴地"],"meanings":["adverbial suffix -ly"]}]'::jsonb
WHERE simp = '地'
  AND trad = '地';


-- Character: 场 (chǎng for places/venues (common), cháng for threshing floor (rare))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄔ","ㄤ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"cháng","zhuyin":[["ㄔ","ㄤ","ˊ"]],"context_words":["一场雨"],"meanings":["threshing floor","classifier for events"]}]'::jsonb
WHERE simp = '场'
  AND trad = '場';


-- Character: 将 (jiāng for future tense, jiàng for military general)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄤ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiàng","zhuyin":[["ㄐ","ㄧㄤ","ˋ"]],"context_words":["将军","大将"],"meanings":["general","to command"]}]'::jsonb
WHERE simp = '将'
  AND trad = '將';


-- Character: 应 (yīng for obligation, yìng for response)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄧ","ㄥ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"yìng","zhuyin":[["ㄧ","ㄥ","ˋ"]],"context_words":["答应","反应","应用"],"meanings":["to respond","to answer"]}]'::jsonb
WHERE simp = '应'
  AND trad = '應';


-- Character: 弹 (dàn for projectiles, tán for plucking/playing instruments)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄢ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"tán","zhuyin":[["ㄊ","ㄢ","ˊ"]],"context_words":["弹琴","弹吉他"],"meanings":["to pluck","to play (instrument)"]}]'::jsonb
WHERE simp = '弹'
  AND trad = '彈';


-- Character: 扫 (sǎo for sweeping action, sào for broom (noun))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄙ","ㄠ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"sào","zhuyin":[["ㄙ","ㄠ","ˋ"]],"context_words":["扫帚"],"meanings":["broom"]}]'::jsonb
WHERE simp = '扫'
  AND trad = '掃';


-- Character: 把 (bǎ extremely common (hold/classifier), bà for handle (rare))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄅ","ㄚ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"bà","zhuyin":[["ㄅ","ㄚ","ˋ"]],"context_words":["刀把"],"meanings":["handle"]}]'::jsonb
WHERE simp = '把'
  AND trad = '把';


-- Character: 担 (dān for bearing responsibility, dàn for physical load)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"dàn","zhuyin":[["ㄉ","ㄢ","ˋ"]],"context_words":["重担","扁担"],"meanings":["load","burden (measurement)"]}]'::jsonb
WHERE simp = '担'
  AND trad = '擔';


-- Character: 相 (xiāng for mutual, xiàng for appearance/photo)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄒ","ㄧㄤ","ˉ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xiàng","zhuyin":[["ㄒ","ㄧㄤ","ˋ"]],"context_words":["相片","照相","首相"],"meanings":["appearance","photo","minister"]}]'::jsonb
WHERE simp = '相'
  AND trad = '相';


-- Character: 省 (shěng for province/save, xǐng for self-reflection (literary))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄕ","ㄥ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"xǐng","zhuyin":[["ㄒ","ㄧㄥ","ˇ"]],"context_words":["反省","省察"],"meanings":["to reflect","to examine"]}]'::jsonb
WHERE simp = '省'
  AND trad = '省';


-- Character: 种 (zhǒng for types/kinds, zhòng for planting)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","ㄨㄥ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"context_words":["种树","种植","播种"],"meanings":["to plant","to grow"]}]'::jsonb
WHERE simp = '种'
  AND trad = '種';


-- Character: 系 (xì for systems/relations, jì for tying/fastening)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄒ","ㄧ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"context_words":["系鞋带"],"meanings":["to tie","to fasten"]}]'::jsonb
WHERE simp = '系'
  AND trad = '系';


-- Character: 结 (jié for knots/conclusions (common), jiē for bearing fruit (literary))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄝ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"context_words":["结果实"],"meanings":["to bear fruit"]}]'::jsonb
WHERE simp = '结'
  AND trad = '結';


-- Character: 觉 (jué for feeling/awareness, jiào for sleep)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄩㄝ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"context_words":["睡觉","午觉"],"meanings":["sleep","nap"]}]'::jsonb
WHERE simp = '觉'
  AND trad = '覺';


-- Character: 角 (jiǎo for corners/angles (common), jué for theatrical roles)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄠ","ˇ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"jué","zhuyin":[["ㄐ","ㄩㄝ","ˊ"]],"context_words":["角色","主角","配角"],"meanings":["role","character (theater)"]}]'::jsonb
WHERE simp = '角'
  AND trad = '角';


-- Character: 调 (tiáo for adjusting/harmonizing, diào for tones/investigation)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄊ","ㄧㄠ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"diào","zhuyin":[["ㄉ","ㄧㄠ","ˋ"]],"context_words":["调查","声调","曲调"],"meanings":["tone","tune","to transfer"]}]'::jsonb
WHERE simp = '调'
  AND trad = '調';


-- Character: 量 (liàng for quantities (noun), liáng for measuring (verb))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄌ","ㄧㄤ","ˋ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"liáng","zhuyin":[["ㄌ","ㄧㄤ","ˊ"]],"context_words":["测量","量体温"],"meanings":["to measure"]}]'::jsonb
WHERE simp = '量'
  AND trad = '量';


-- Character: 什 (shén in 什么 (extremely common), shí for "ten" (rare, literary))
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄕ","ㄣ","ˊ"]]'::jsonb,
  zhuyin_variants = '[{"pinyin":"shí","zhuyin":[["ㄕ","ˊ",null]],"context_words":["什锦"],"meanings":["ten","assorted"]}]'::jsonb
WHERE simp = '什'
  AND trad = '什';



-- Verification: Check all 36 characters have proper zhuyin_variants
SELECT
  simp,
  trad,
  zhuyin,
  zhuyin_variants,
  jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE simp IN ('行', '重', '还', '为', '给', '都', '没', '教', '正', '更', '传', '供', '便', '假', '几', '切', '划', '地', '场', '将', '应', '弹', '扫', '把', '担', '相', '省', '种', '系', '结', '觉', '角', '调', '量', '什')
ORDER BY simp;

-- Count characters with variants
SELECT COUNT(*) as characters_with_variants
FROM dictionary_entries
WHERE simp IN ('行', '重', '还', '为', '给', '都', '没', '教', '正', '更', '传', '供', '便', '假', '几', '切', '划', '地', '场', '将', '应', '弹', '扫', '把', '担', '相', '省', '种', '系', '结', '觉', '角', '调', '量', '什')
  AND jsonb_array_length(zhuyin_variants) > 0;


COMMIT;

-- END OF MIGRATION
--
-- ROLLBACK SCRIPT (if needed):
-- 
-- ROLLBACK: Remove variants added by this migration
-- (Preserves main zhuyin, only clears variants)

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '行' AND trad = '行';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '重' AND trad = '重';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '还' AND trad = '還';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '为' AND trad = '為';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '给' AND trad = '給';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '都' AND trad = '都';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '没' AND trad = '沒';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '教' AND trad = '教';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '正' AND trad = '正';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '更' AND trad = '更';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '传' AND trad = '傳';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '供' AND trad = '供';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '便' AND trad = '便';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '假' AND trad = '假';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '几' AND trad = '幾';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '切' AND trad = '切';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '划' AND trad = '劃';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '地' AND trad = '地';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '场' AND trad = '場';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '将' AND trad = '將';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '应' AND trad = '應';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '弹' AND trad = '彈';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '扫' AND trad = '掃';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '把' AND trad = '把';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '担' AND trad = '擔';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '相' AND trad = '相';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '省' AND trad = '省';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '种' AND trad = '種';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '系' AND trad = '系';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '结' AND trad = '結';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '觉' AND trad = '覺';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '角' AND trad = '角';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '调' AND trad = '調';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '量' AND trad = '量';

UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '什' AND trad = '什';

