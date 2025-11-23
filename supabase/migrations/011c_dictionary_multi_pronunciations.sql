-- Migration 011c: Dictionary Quality - Auto multi-pronunciation completion
-- Date: 2025-11-22
-- Description: Auto-generated pronunciations for remaining multi-tone characters prior to Drill A guardrails.
-- Source: data/multi_pronunciation_epic8_auto.json
-- Total in dataset: 136
-- Excluded (Migration 011b): 35 (curated Pattern A entries preserved)
-- Characters to deploy: 101
--
-- CRITICAL: This migration excludes 35 characters already deployed in Migration 011b
-- to prevent overwriting curated context words (175-350 words total).
--
-- Excluded characters: 为, 什, 传, 供, 便, 假, 几, 切, 划, 地, 场, 将, 应, 弹, 扫, 把, 担, 教, 更, 正, 没, 相, 省, 种, 系, 结, 给, 行, 觉, 角, 调, 还, 都, 重, 量

BEGIN;

DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('干', '且', '丽', '么', '乘', '于', '亚', '些', '亲', '仅', '从', '价', '任', '份', '休', '估', '体', '信', '俩', '倒', '共', '其', '冒', '净', '凉', '别', '刷', '助', '化', '匙', '区', '占', '卡', '压', '句', '可', '台', '号', '各', '合', '同', '否', '吧', '呀', '呢', '咖', '咳', '填', '夫', '奇', '妻', '孙', '底', '度', '弄', '思', '愉', '戏', '打', '择', '拾', '据', '排', '散', '旁', '景', '服', '条', '查', '校', '椅', '汗', '汤', '沙', '洗', '济', '父', '片', '甚', '疑', '研', '硕', '票', '禁', '稍', '约', '肚', '胳', '膏', '苹', '被', '观', '论', '语', '谁', '责', '赚', '趟', '趣', '跳', '钢');

  IF char_count != 101 THEN
    RAISE EXCEPTION 'Expected 101 characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All 101 characters present.';
END $$;

-- Character: 干 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gān","zhuyin":[["ㄍ","ㄢ","ˉ"]],"context_words":[],"meanings":["clean; neat and tidy","biscuit; cracker; cookie","to drink a toast; cheers!; bottoms up!"]},{"pinyin":"gàn","zhuyin":[["ㄍ","ㄢ","ˋ"]],"context_words":[],"meanings":["clean; neat and tidy","biscuit; cracker; cookie","to drink a toast; cheers!; bottoms up!"]}]'::jsonb
WHERE simp = '干'
  AND trad = '干';

-- Character: 且 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qiě","zhuyin":[["ㄑ","ㄧㄝ","ˇ"]],"context_words":[],"meanings":["moreover; in addition; as well as","and; besides; moreover"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"context_words":[],"meanings":["moreover; in addition; as well as","and; besides; moreover"]}]'::jsonb
WHERE simp = '且'
  AND trad = '且';

-- Character: 丽 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"lí","zhuyin":[["ㄌ","ㄧ","ˊ"]],"context_words":[],"meanings":["beautiful"]},{"pinyin":"lì","zhuyin":[["ㄌ","ㄧ","ˋ"]],"context_words":[],"meanings":["beautiful"]}]'::jsonb
WHERE simp = '丽'
  AND trad = '麗';

-- Character: 么 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"mó","zhuyin":[["ㄇ","ㄛ","ˊ"]],"context_words":[],"meanings":["what? (replaces the noun to turn a statement into a question)","how?"]},{"pinyin":"me","zhuyin":[["ㄇ","ㄜ","˙"]],"context_words":[],"meanings":["what? (replaces the noun to turn a statement into a question)","how?"]}]'::jsonb
WHERE simp = '么'
  AND trad = '麼';

-- Character: 乘 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chéng","zhuyin":[["ㄔ","ㄥ","ˊ"]],"context_words":[],"meanings":["ride; get into (a vehicle)"]},{"pinyin":"shèng","zhuyin":[["ㄕ","ㄥ","ˋ"]],"context_words":[],"meanings":["ride; get into (a vehicle)"]}]'::jsonb
WHERE simp = '乘'
  AND trad = '乘';

-- Character: 于 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"context_words":[],"meanings":["about; regarding; concerning","at last; in the end; finally","regarding; as far as sth. is concerned; with regards to; for"]},{"pinyin":"wū","zhuyin":[["","ㄨ","ˉ"]],"context_words":[],"meanings":["about; regarding; concerning","at last; in the end; finally","regarding; as far as sth. is concerned; with regards to; for"]}]'::jsonb
WHERE simp = '于'
  AND trad = '於';

-- Character: 亚 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":[],"meanings":["Asia"]},{"pinyin":"yà","zhuyin":[["","ㄧㄚ","ˋ"]],"context_words":[],"meanings":["Asia"]}]'::jsonb
WHERE simp = '亚'
  AND trad = '亞';

-- Character: 些 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xiē","zhuyin":[["ㄒ","ㄧㄝ","ˉ"]],"context_words":[],"meanings":["some; few; several"]},{"pinyin":"suò","zhuyin":[["ㄙ","ㄨㄛ","ˋ"]],"context_words":[],"meanings":["some; few; several"]}]'::jsonb
WHERE simp = '些'
  AND trad = '些';

-- Character: 亲 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qīn","zhuyin":[["ㄑ","ㄧㄣ","ˉ"]],"context_words":[],"meanings":["father","mother"]},{"pinyin":"qìng","zhuyin":[["ㄑ","ㄧㄥ","ˋ"]],"context_words":[],"meanings":["father","mother"]}]'::jsonb
WHERE simp = '亲'
  AND trad = '親';

-- Character: 仅 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jǐn","zhuyin":[["ㄐ","ㄧㄣ","ˇ"]],"context_words":[],"meanings":["not only; not just"]},{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"context_words":[],"meanings":["not only; not just"]}]'::jsonb
WHERE simp = '仅'
  AND trad = '僅';

-- Character: 从 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"cóng","zhuyin":[["ㄘ","ㄨㄥ","ˊ"]],"context_words":[],"meanings":["from; obey; observe","always; at all times"]},{"pinyin":"zòng","zhuyin":[["ㄗ","ㄨㄥ","ˋ"]],"context_words":[],"meanings":["from; obey; observe","always; at all times"]}]'::jsonb
WHERE simp = '从'
  AND trad = '從';

-- Character: 价 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jià","zhuyin":[["ㄐ","ㄧㄚ","ˋ"]],"context_words":[],"meanings":["price"]},{"pinyin":"jie","zhuyin":[["ㄐ","ㄧㄝ","˙"]],"context_words":[],"meanings":["price"]}]'::jsonb
WHERE simp = '价'
  AND trad = '價';

-- Character: 任 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"rèn","zhuyin":[["ㄖ","ㄣ","ˋ"]],"context_words":[],"meanings":["any; whatever; whichever","a mission; an assignment; a task"]},{"pinyin":"rén","zhuyin":[["ㄖ","ㄣ","ˊ"]],"context_words":[],"meanings":["any; whatever; whichever","a mission; an assignment; a task"]}]'::jsonb
WHERE simp = '任'
  AND trad = '任';

-- Character: 份 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fèn","zhuyin":[["ㄈ","ㄣ","ˋ"]],"context_words":[],"meanings":["part; portion; (mw for documents, papers, jobs, etc.)"]},{"pinyin":"bīn","zhuyin":[["ㄅ","ㄧㄣ","ˉ"]],"context_words":[],"meanings":["part; portion; (mw for documents, papers, jobs, etc.)"]}]'::jsonb
WHERE simp = '份'
  AND trad = '份';

-- Character: 休 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xiū","zhuyin":[["ㄒ","ㄧㄡ","ˉ"]],"context_words":[],"meanings":["to rest; take a break"]},{"pinyin":"xǔ","zhuyin":[["ㄒ","ㄩ","ˇ"]],"context_words":[],"meanings":["to rest; take a break"]}]'::jsonb
WHERE simp = '休'
  AND trad = '休';

-- Character: 估 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gū","zhuyin":[["ㄍ","ㄨ","ˉ"]],"context_words":[],"meanings":["appraise; estimate"]},{"pinyin":"gù","zhuyin":[["ㄍ","ㄨ","ˋ"]],"context_words":[],"meanings":["appraise; estimate"]}]'::jsonb
WHERE simp = '估'
  AND trad = '估';

-- Character: 体 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tǐ","zhuyin":[["ㄊ","ㄧ","ˇ"]],"context_words":[],"meanings":["health; (human) body","physical training; sports"]},{"pinyin":"tī","zhuyin":[["ㄊ","ㄧ","ˉ"]],"context_words":[],"meanings":["health; (human) body","physical training; sports"]}]'::jsonb
WHERE simp = '体'
  AND trad = '體';

-- Character: 信 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xìn","zhuyin":[["ㄒ","ㄧㄣ","ˋ"]],"context_words":[],"meanings":["believe (sb.); be convinced of","credit card"]},{"pinyin":"shēn","zhuyin":[["ㄕ","ㄣ","ˉ"]],"context_words":[],"meanings":["believe (sb.); be convinced of","credit card"]}]'::jsonb
WHERE simp = '信'
  AND trad = '信';

-- Character: 俩 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"liǎng","zhuyin":[["ㄌ","ㄧㄤ","ˇ"]],"context_words":[],"meanings":["(colloquial) two (people)"]},{"pinyin":"liǎ","zhuyin":[["ㄌ","ㄧㄚ","ˇ"]],"context_words":[],"meanings":["(colloquial) two (people)"]}]'::jsonb
WHERE simp = '俩'
  AND trad = '倆';

-- Character: 倒 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dǎo","zhuyin":[["ㄉ","ㄠ","ˇ"]],"context_words":[],"meanings":["to collapse; to fall; fail; to exchange | to pour; contrary to expectations"]},{"pinyin":"dào","zhuyin":[["ㄉ","ㄠ","ˋ"]],"context_words":[],"meanings":["to collapse; to fall; fail; to exchange | to pour; contrary to expectations"]}]'::jsonb
WHERE simp = '倒'
  AND trad = '倒';

-- Character: 共 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gòng","zhuyin":[["ㄍ","ㄨㄥ","ˋ"]],"context_words":[],"meanings":["(public) bus","altogether; in total"]},{"pinyin":"gōng","zhuyin":[["ㄍ","ㄨㄥ","ˉ"]],"context_words":[],"meanings":["(public) bus","altogether; in total"]}]'::jsonb
WHERE simp = '共'
  AND trad = '共';

-- Character: 其 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qí","zhuyin":[["ㄑ","ㄧ","ˊ"]],"context_words":[],"meanings":["actually; in fact","other; else"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":[],"meanings":["actually; in fact","other; else"]}]'::jsonb
WHERE simp = '其'
  AND trad = '其';

-- Character: 冒 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"mào","zhuyin":[["ㄇ","ㄠ","ˋ"]],"context_words":[],"meanings":["catch cold; (common) cold"]},{"pinyin":"mò","zhuyin":[["ㄇ","ㄛ","ˋ"]],"context_words":[],"meanings":["catch cold; (common) cold"]}]'::jsonb
WHERE simp = '冒'
  AND trad = '冒';

-- Character: 净 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jìng","zhuyin":[["ㄐ","ㄧㄥ","ˋ"]],"context_words":[],"meanings":["clean; neat and tidy"]},{"pinyin":"chēng","zhuyin":[["ㄔ","ㄥ","ˉ"]],"context_words":[],"meanings":["clean; neat and tidy"]}]'::jsonb
WHERE simp = '净'
  AND trad = '淨';

-- Character: 凉 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"liáng","zhuyin":[["ㄌ","ㄧㄤ","ˊ"]],"context_words":[],"meanings":["nice and cool; pleasantly cool"]},{"pinyin":"liàng","zhuyin":[["ㄌ","ㄧㄤ","ˋ"]],"context_words":[],"meanings":["nice and cool; pleasantly cool"]}]'::jsonb
WHERE simp = '凉'
  AND trad = '涼';

-- Character: 别 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bié","zhuyin":[["ㄅ","ㄧㄝ","ˊ"]],"context_words":[],"meanings":["don''t do something; don''t | depart; | other; difference; distinguish","other people; others"]},{"pinyin":"biè","zhuyin":[["ㄅ","ㄧㄝ","ˋ"]],"context_words":[],"meanings":["don''t do something; don''t | depart; | other; difference; distinguish","other people; others"]}]'::jsonb
WHERE simp = '别'
  AND trad = '別';

-- Character: 刷 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuā","zhuyin":[["ㄕ","ㄨㄚ","ˉ"]],"context_words":[],"meanings":["brush one''s teeth"]},{"pinyin":"shuà","zhuyin":[["ㄕ","ㄨㄚ","ˋ"]],"context_words":[],"meanings":["brush one''s teeth"]}]'::jsonb
WHERE simp = '刷'
  AND trad = '刷';

-- Character: 助 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhù","zhuyin":[["ㄓ","ㄨ","ˋ"]],"context_words":[],"meanings":["help; assist; aid"]},{"pinyin":"chú","zhuyin":[["ㄔ","ㄨ","ˊ"]],"context_words":[],"meanings":["help; assist; aid"]}]'::jsonb
WHERE simp = '助'
  AND trad = '助';

-- Character: 化 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"huà","zhuyin":[["ㄏ","ㄨㄚ","ˋ"]],"context_words":[],"meanings":["change","culture; civilization"]},{"pinyin":"huā","zhuyin":[["ㄏ","ㄨㄚ","ˉ"]],"context_words":[],"meanings":["change","culture; civilization"]}]'::jsonb
WHERE simp = '化'
  AND trad = '化';

-- Character: 匙 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chí","zhuyin":[["ㄔ","","ˊ"]],"context_words":[],"meanings":["key"]},{"pinyin":"shi","zhuyin":[["ㄕ","","˙"]],"context_words":[],"meanings":["key"]}]'::jsonb
WHERE simp = '匙'
  AND trad = '匙';

-- Character: 区 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qū","zhuyin":[["ㄑ","ㄩ","ˉ"]],"context_words":[],"meanings":["suburbs; outskirts","difference; distinguish"]},{"pinyin":"ōu","zhuyin":[["","ㄡ","ˉ"]],"context_words":[],"meanings":["suburbs; outskirts","difference; distinguish"]}]'::jsonb
WHERE simp = '区'
  AND trad = '區';

-- Character: 占 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhān","zhuyin":[["ㄓ","ㄢ","ˉ"]],"context_words":[],"meanings":["the (phone) line is busy"]},{"pinyin":"zhàn","zhuyin":[["ㄓ","ㄢ","ˋ"]],"context_words":[],"meanings":["the (phone) line is busy"]}]'::jsonb
WHERE simp = '占'
  AND trad = '占';

-- Character: 卡 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kǎ","zhuyin":[["ㄎ","ㄚ","ˇ"]],"context_words":[],"meanings":["credit card"]},{"pinyin":"qiǎ","zhuyin":[["ㄑ","ㄧㄚ","ˇ"]],"context_words":[],"meanings":["credit card"]}]'::jsonb
WHERE simp = '卡'
  AND trad = '卡';

-- Character: 压 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":[],"meanings":["pressure; stress"]},{"pinyin":"yà","zhuyin":[["","ㄧㄚ","ˋ"]],"context_words":[],"meanings":["pressure; stress"]}]'::jsonb
WHERE simp = '压'
  AND trad = '壓';

-- Character: 句 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jù","zhuyin":[["ㄐ","ㄩ","ˋ"]],"context_words":[],"meanings":["sentence"]},{"pinyin":"gōu","zhuyin":[["ㄍ","ㄡ","ˉ"]],"context_words":[],"meanings":["sentence"]}]'::jsonb
WHERE simp = '句'
  AND trad = '句';

-- Character: 可 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kě","zhuyin":[["ㄎ","ㄜ","ˇ"]],"context_words":[],"meanings":["possible; maybe","can; may; possible; okay"]},{"pinyin":"kè","zhuyin":[["ㄎ","ㄜ","ˋ"]],"context_words":[],"meanings":["possible; maybe","can; may; possible; okay"]}]'::jsonb
WHERE simp = '可'
  AND trad = '可';

-- Character: 台 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tái","zhuyin":[["ㄊ","ㄞ","ˊ"]],"context_words":[],"meanings":["platform; Taiwan (abbr.); desk; stage; typhoon; (mw for machines); (classical) you (in letters)"]},{"pinyin":"tāi","zhuyin":[["ㄊ","ㄞ","ˉ"]],"context_words":[],"meanings":["platform; Taiwan (abbr.); desk; stage; typhoon; (mw for machines); (classical) you (in letters)"]}]'::jsonb
WHERE simp = '台'
  AND trad = '台';

-- Character: 号 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hào","zhuyin":[["ㄏ","ㄠ","ˋ"]],"context_words":[],"meanings":["number; day of a month","number"]},{"pinyin":"háo","zhuyin":[["ㄏ","ㄠ","ˊ"]],"context_words":[],"meanings":["number; day of a month","number"]}]'::jsonb
WHERE simp = '号'
  AND trad = '號';

-- Character: 各 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gè","zhuyin":[["ㄍ","ㄜ","ˋ"]],"context_words":[],"meanings":["each; every"]},{"pinyin":"gě","zhuyin":[["ㄍ","ㄜ","ˇ"]],"context_words":[],"meanings":["each; every"]}]'::jsonb
WHERE simp = '各'
  AND trad = '各';

-- Character: 合 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"context_words":[],"meanings":["in keeping with; in accordance with; conform","qualified; up to standard"]},{"pinyin":"gě","zhuyin":[["ㄍ","ㄜ","ˇ"]],"context_words":[],"meanings":["in keeping with; in accordance with; conform","qualified; up to standard"]}]'::jsonb
WHERE simp = '合'
  AND trad = '合';

-- Character: 同 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tóng","zhuyin":[["ㄊ","ㄨㄥ","ˊ"]],"context_words":[],"meanings":["fellow student; schoolmate","colleague; co-worker"]},{"pinyin":"tòng","zhuyin":[["ㄊ","ㄨㄥ","ˋ"]],"context_words":[],"meanings":["fellow student; schoolmate","colleague; co-worker"]}]'::jsonb
WHERE simp = '同'
  AND trad = '同';

-- Character: 否 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fǒu","zhuyin":[["ㄈ","ㄡ","ˇ"]],"context_words":[],"meanings":["if not; otherwise; or else","whether (or not); if"]},{"pinyin":"pǐ","zhuyin":[["ㄆ","ㄧ","ˇ"]],"context_words":[],"meanings":["if not; otherwise; or else","whether (or not); if"]}]'::jsonb
WHERE simp = '否'
  AND trad = '否';

-- Character: 吧 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bā","zhuyin":[["ㄅ","ㄚ","ˉ"]],"context_words":[],"meanings":["particle indicating polite suggestion; | onomatopoeia | bar (serving drinks, providing internet access, etc.)"]},{"pinyin":"ba","zhuyin":[["ㄅ","ㄚ","˙"]],"context_words":[],"meanings":["particle indicating polite suggestion; | onomatopoeia | bar (serving drinks, providing internet access, etc.)"]}]'::jsonb
WHERE simp = '吧'
  AND trad = '吧';

-- Character: 呀 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yā","zhuyin":[["","ㄧㄚ","ˉ"]],"context_words":[],"meanings":["ah; oh; (used for 啊 after words ending with a, e, i, o, or ü)"]},{"pinyin":"ya","zhuyin":[["","ㄧㄚ","˙"]],"context_words":[],"meanings":["ah; oh; (used for 啊 after words ending with a, e, i, o, or ü)"]}]'::jsonb
WHERE simp = '呀'
  AND trad = '呀';

-- Character: 呢 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ne","zhuyin":[["ㄋ","ㄜ","˙"]],"context_words":[],"meanings":["indicates a question; how about...?;"]},{"pinyin":"ní","zhuyin":[["ㄋ","ㄧ","ˊ"]],"context_words":[],"meanings":["indicates a question; how about...?;"]}]'::jsonb
WHERE simp = '呢'
  AND trad = '呢';

-- Character: 咖 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kā","zhuyin":[["ㄎ","ㄚ","ˉ"]],"context_words":[],"meanings":["coffee"]},{"pinyin":"gā","zhuyin":[["ㄍ","ㄚ","ˉ"]],"context_words":[],"meanings":["coffee"]}]'::jsonb
WHERE simp = '咖'
  AND trad = '咖';

-- Character: 咳 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ké","zhuyin":[["ㄎ","ㄜ","ˊ"]],"context_words":[],"meanings":["to cough"]},{"pinyin":"hāi","zhuyin":[["ㄏ","ㄞ","ˉ"]],"context_words":[],"meanings":["to cough"]}]'::jsonb
WHERE simp = '咳'
  AND trad = '咳';

-- Character: 填 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tián","zhuyin":[["ㄊ","ㄧㄢ","ˊ"]],"context_words":[],"meanings":["fill in the blanks; fill a vacancy"]},{"pinyin":"zhèn","zhuyin":[["ㄓ","ㄣ","ˋ"]],"context_words":[],"meanings":["fill in the blanks; fill a vacancy"]}]'::jsonb
WHERE simp = '填'
  AND trad = '填';

-- Character: 夫 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fū","zhuyin":[["ㄈ","ㄨ","ˉ"]],"context_words":[],"meanings":["husband; man","doctor; physician"]},{"pinyin":"fú","zhuyin":[["ㄈ","ㄨ","ˊ"]],"context_words":[],"meanings":["husband; man","doctor; physician"]}]'::jsonb
WHERE simp = '夫'
  AND trad = '夫';

-- Character: 奇 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qí","zhuyin":[["ㄑ","ㄧ","ˊ"]],"context_words":[],"meanings":["strange; odd"]},{"pinyin":"jī","zhuyin":[["ㄐ","ㄧ","ˉ"]],"context_words":[],"meanings":["strange; odd"]}]'::jsonb
WHERE simp = '奇'
  AND trad = '奇';

-- Character: 妻 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qī","zhuyin":[["ㄑ","ㄧ","ˉ"]],"context_words":[],"meanings":["wife"]},{"pinyin":"qì","zhuyin":[["ㄑ","ㄧ","ˋ"]],"context_words":[],"meanings":["wife"]}]'::jsonb
WHERE simp = '妻'
  AND trad = '妻';

-- Character: 孙 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sūn","zhuyin":[["ㄙ","ㄨㄣ","ˉ"]],"context_words":[],"meanings":["grandson; son''s son"]},{"pinyin":"xùn","zhuyin":[["ㄒ","ㄩㄣ","ˋ"]],"context_words":[],"meanings":["grandson; son''s son"]}]'::jsonb
WHERE simp = '孙'
  AND trad = '孫';

-- Character: 底 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dǐ","zhuyin":[["ㄉ","ㄧ","ˇ"]],"context_words":[],"meanings":["after all; in the end (used in a question)","bottom; background; base"]},{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"context_words":[],"meanings":["after all; in the end (used in a question)","bottom; background; base"]}]'::jsonb
WHERE simp = '底'
  AND trad = '底';

-- Character: 度 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dù","zhuyin":[["ㄉ","ㄨ","ˋ"]],"context_words":[],"meanings":["speed; rate; velocity","manner; bearing; attitude"]},{"pinyin":"duó","zhuyin":[["ㄉ","ㄨㄛ","ˊ"]],"context_words":[],"meanings":["speed; rate; velocity","manner; bearing; attitude"]}]'::jsonb
WHERE simp = '度'
  AND trad = '度';

-- Character: 弄 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nòng","zhuyin":[["ㄋ","ㄨㄥ","ˋ"]],"context_words":[],"meanings":["do; manage; to handle; make"]},{"pinyin":"lòng","zhuyin":[["ㄌ","ㄨㄥ","ˋ"]],"context_words":[],"meanings":["do; manage; to handle; make"]}]'::jsonb
WHERE simp = '弄'
  AND trad = '弄';

-- Character: 思 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sī","zhuyin":[["ㄙ","","ˉ"]],"context_words":[],"meanings":["meaning; idea; opinion"]},{"pinyin":"sāi","zhuyin":[["ㄙ","ㄞ","ˉ"]],"context_words":[],"meanings":["meaning; idea; opinion"]}]'::jsonb
WHERE simp = '思'
  AND trad = '思';

-- Character: 愉 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"context_words":[],"meanings":["happy; cheerful; delightful"]},{"pinyin":"tōu","zhuyin":[["ㄊ","ㄡ","ˉ"]],"context_words":[],"meanings":["happy; cheerful; delightful"]}]'::jsonb
WHERE simp = '愉'
  AND trad = '愉';

-- Character: 戏 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xì","zhuyin":[["ㄒ","ㄧ","ˋ"]],"context_words":[],"meanings":["game; play; recreation"]},{"pinyin":"hū","zhuyin":[["ㄏ","ㄨ","ˉ"]],"context_words":[],"meanings":["game; play; recreation"]}]'::jsonb
WHERE simp = '戏'
  AND trad = '戲';

-- Character: 打 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dǎ","zhuyin":[["ㄉ","ㄚ","ˇ"]],"context_words":[],"meanings":["make a phone call","play basketball"]},{"pinyin":"dá","zhuyin":[["ㄉ","ㄚ","ˊ"]],"context_words":[],"meanings":["make a phone call","play basketball"]}]'::jsonb
WHERE simp = '打'
  AND trad = '打';

-- Character: 择 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zé","zhuyin":[["ㄗ","ㄜ","ˊ"]],"context_words":[],"meanings":["select; to pick; choose"]},{"pinyin":"zhái","zhuyin":[["ㄓ","ㄞ","ˊ"]],"context_words":[],"meanings":["select; to pick; choose"]}]'::jsonb
WHERE simp = '择'
  AND trad = '擇';

-- Character: 拾 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":[],"meanings":["to tidy; put in order; to repair; to settle with; punish"]},{"pinyin":"shè","zhuyin":[["ㄕ","ㄜ","ˋ"]],"context_words":[],"meanings":["to tidy; put in order; to repair; to settle with; punish"]}]'::jsonb
WHERE simp = '拾'
  AND trad = '拾';

-- Character: 据 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jù","zhuyin":[["ㄐ","ㄩ","ˋ"]],"context_words":[],"meanings":["according to; based on; basis"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"context_words":[],"meanings":["according to; based on; basis"]}]'::jsonb
WHERE simp = '据'
  AND trad = '據';

-- Character: 排 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"pái","zhuyin":[["ㄆ","ㄞ","ˊ"]],"context_words":[],"meanings":["arrange; to plan","queue; stand in line"]},{"pinyin":"pǎi","zhuyin":[["ㄆ","ㄞ","ˇ"]],"context_words":[],"meanings":["arrange; to plan","queue; stand in line"]}]'::jsonb
WHERE simp = '排'
  AND trad = '排';

-- Character: 散 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"sàn","zhuyin":[["ㄙ","ㄢ","ˋ"]],"context_words":[],"meanings":["to go for a walk"]},{"pinyin":"sǎn","zhuyin":[["ㄙ","ㄢ","ˇ"]],"context_words":[],"meanings":["to go for a walk"]}]'::jsonb
WHERE simp = '散'
  AND trad = '散';

-- Character: 旁 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"páng","zhuyin":[["ㄆ","ㄤ","ˊ"]],"context_words":[],"meanings":["side, beside"]},{"pinyin":"bàng","zhuyin":[["ㄅ","ㄤ","ˋ"]],"context_words":[],"meanings":["side, beside"]}]'::jsonb
WHERE simp = '旁'
  AND trad = '旁';

-- Character: 景 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jǐng","zhuyin":[["ㄐ","ㄧㄥ","ˇ"]],"context_words":[],"meanings":["scenery; landscape; scene; view"]},{"pinyin":"yǐng","zhuyin":[["","ㄧㄥ","ˇ"]],"context_words":[],"meanings":["scenery; landscape; scene; view"]}]'::jsonb
WHERE simp = '景'
  AND trad = '景';

-- Character: 服 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fú","zhuyin":[["ㄈ","ㄨ","ˊ"]],"context_words":[],"meanings":["clothes","waiter/waitress; server; attendant"]},{"pinyin":"fù","zhuyin":[["ㄈ","ㄨ","ˋ"]],"context_words":[],"meanings":["clothes","waiter/waitress; server; attendant"]}]'::jsonb
WHERE simp = '服'
  AND trad = '服';

-- Character: 条 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tiáo","zhuyin":[["ㄊ","ㄧㄠ","ˊ"]],"context_words":[],"meanings":["noodles","strip; (mw for long thin objects); item"]},{"pinyin":"tiāo","zhuyin":[["ㄊ","ㄧㄠ","ˉ"]],"context_words":[],"meanings":["noodles","strip; (mw for long thin objects); item"]}]'::jsonb
WHERE simp = '条'
  AND trad = '條';

-- Character: 查 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chá","zhuyin":[["ㄔ","ㄚ","ˊ"]],"context_words":[],"meanings":["to check; examine; inspect","investigate; survey; inquiry"]},{"pinyin":"zhā","zhuyin":[["ㄓ","ㄚ","ˉ"]],"context_words":[],"meanings":["to check; examine; inspect","investigate; survey; inquiry"]}]'::jsonb
WHERE simp = '查'
  AND trad = '查';

-- Character: 校 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xiào","zhuyin":[["ㄒ","ㄧㄠ","ˋ"]],"context_words":[],"meanings":["school","principal (of school, college or university); president; headmaster"]},{"pinyin":"jiào","zhuyin":[["ㄐ","ㄧㄠ","ˋ"]],"context_words":[],"meanings":["school","principal (of school, college or university); president; headmaster"]}]'::jsonb
WHERE simp = '校'
  AND trad = '校';

-- Character: 椅 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǐ","zhuyin":[["","ㄧ","ˇ"]],"context_words":[],"meanings":["chair"]},{"pinyin":"yī","zhuyin":[["","ㄧ","ˉ"]],"context_words":[],"meanings":["chair"]}]'::jsonb
WHERE simp = '椅'
  AND trad = '椅';

-- Character: 汗 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hàn","zhuyin":[["ㄏ","ㄢ","ˋ"]],"context_words":[],"meanings":["sweat; perspiration; Khan"]},{"pinyin":"hán","zhuyin":[["ㄏ","ㄢ","ˊ"]],"context_words":[],"meanings":["sweat; perspiration; Khan"]}]'::jsonb
WHERE simp = '汗'
  AND trad = '汗';

-- Character: 汤 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tāng","zhuyin":[["ㄊ","ㄤ","ˉ"]],"context_words":[],"meanings":["soup; broth"]},{"pinyin":"shāng","zhuyin":[["ㄕ","ㄤ","ˉ"]],"context_words":[],"meanings":["soup; broth"]}]'::jsonb
WHERE simp = '汤'
  AND trad = '湯';

-- Character: 沙 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shā","zhuyin":[["ㄕ","ㄚ","ˉ"]],"context_words":[],"meanings":["sofa"]},{"pinyin":"shà","zhuyin":[["ㄕ","ㄚ","ˋ"]],"context_words":[],"meanings":["sofa"]}]'::jsonb
WHERE simp = '沙'
  AND trad = '沙';

-- Character: 洗 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xǐ","zhuyin":[["ㄒ","ㄧ","ˇ"]],"context_words":[],"meanings":["to wash; bathe","toilet; lavatory; washroom"]},{"pinyin":"xiǎn","zhuyin":[["ㄒ","ㄧㄢ","ˇ"]],"context_words":[],"meanings":["to wash; bathe","toilet; lavatory; washroom"]}]'::jsonb
WHERE simp = '洗'
  AND trad = '洗';

-- Character: 济 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"context_words":[],"meanings":["economy; economic"]},{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"context_words":[],"meanings":["economy; economic"]}]'::jsonb
WHERE simp = '济'
  AND trad = '濟';

-- Character: 父 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fù","zhuyin":[["ㄈ","ㄨ","ˋ"]],"context_words":[],"meanings":["father"]},{"pinyin":"fǔ","zhuyin":[["ㄈ","ㄨ","ˇ"]],"context_words":[],"meanings":["father"]}]'::jsonb
WHERE simp = '父'
  AND trad = '父';

-- Character: 片 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"piàn","zhuyin":[["ㄆ","ㄧㄢ","ˋ"]],"context_words":[],"meanings":["picture; photograph"]},{"pinyin":"piān","zhuyin":[["ㄆ","ㄧㄢ","ˉ"]],"context_words":[],"meanings":["picture; photograph"]}]'::jsonb
WHERE simp = '片'
  AND trad = '片';

-- Character: 甚 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shèn","zhuyin":[["ㄕ","ㄣ","ˋ"]],"context_words":[],"meanings":["even (to the point of); so much so that"]},{"pinyin":"shén","zhuyin":[["ㄕ","ㄣ","ˊ"]],"context_words":[],"meanings":["even (to the point of); so much so that"]}]'::jsonb
WHERE simp = '甚'
  AND trad = '甚';

-- Character: 疑 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yí","zhuyin":[["","ㄧ","ˊ"]],"context_words":[],"meanings":["doubt; to suspect; be skeptical"]},{"pinyin":"nǐ","zhuyin":[["ㄋ","ㄧ","ˇ"]],"context_words":[],"meanings":["doubt; to suspect; be skeptical"]}]'::jsonb
WHERE simp = '疑'
  AND trad = '疑';

-- Character: 研 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yán","zhuyin":[["","ㄧㄢ","ˊ"]],"context_words":[],"meanings":["to study; to research"]},{"pinyin":"yàn","zhuyin":[["","ㄧㄢ","ˋ"]],"context_words":[],"meanings":["to study; to research"]}]'::jsonb
WHERE simp = '研'
  AND trad = '研';

-- Character: 硕 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"context_words":[],"meanings":["Master''s degree (M.A.)"]},{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":[],"meanings":["Master''s degree (M.A.)"]}]'::jsonb
WHERE simp = '硕'
  AND trad = '碩';

-- Character: 票 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"piào","zhuyin":[["ㄆ","ㄧㄠ","ˋ"]],"context_words":[],"meanings":["ticket; bank note; a vote"]},{"pinyin":"piāo","zhuyin":[["ㄆ","ㄧㄠ","ˉ"]],"context_words":[],"meanings":["ticket; bank note; a vote"]}]'::jsonb
WHERE simp = '票'
  AND trad = '票';

-- Character: 禁 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jīn","zhuyin":[["ㄐ","ㄧㄣ","ˉ"]],"context_words":[],"meanings":["to ban; prohibit"]},{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"context_words":[],"meanings":["to ban; prohibit"]}]'::jsonb
WHERE simp = '禁'
  AND trad = '禁';

-- Character: 稍 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shāo","zhuyin":[["ㄕ","ㄠ","ˉ"]],"context_words":[],"meanings":["a little bit; slightly"]},{"pinyin":"shào","zhuyin":[["ㄕ","ㄠ","ˋ"]],"context_words":[],"meanings":["a little bit; slightly"]}]'::jsonb
WHERE simp = '稍'
  AND trad = '稍';

-- Character: 约 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yuē","zhuyin":[["","ㄩㄝ","ˉ"]],"context_words":[],"meanings":["approximately; about","frugal; to save"]},{"pinyin":"yāo","zhuyin":[["","ㄧㄠ","ˉ"]],"context_words":[],"meanings":["approximately; about","frugal; to save"]}]'::jsonb
WHERE simp = '约'
  AND trad = '約';

-- Character: 肚 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dù","zhuyin":[["ㄉ","ㄨ","ˋ"]],"context_words":[],"meanings":["belly; abdomen; stomach"]},{"pinyin":"dǔ","zhuyin":[["ㄉ","ㄨ","ˇ"]],"context_words":[],"meanings":["belly; abdomen; stomach"]}]'::jsonb
WHERE simp = '肚'
  AND trad = '肚';

-- Character: 胳 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gē","zhuyin":[["ㄍ","ㄜ","ˉ"]],"context_words":[],"meanings":["arm"]},{"pinyin":"gé","zhuyin":[["ㄍ","ㄜ","ˊ"]],"context_words":[],"meanings":["arm"]}]'::jsonb
WHERE simp = '胳'
  AND trad = '胳';

-- Character: 膏 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gāo","zhuyin":[["ㄍ","ㄠ","ˉ"]],"context_words":[],"meanings":["toothpaste"]},{"pinyin":"gào","zhuyin":[["ㄍ","ㄠ","ˋ"]],"context_words":[],"meanings":["toothpaste"]}]'::jsonb
WHERE simp = '膏'
  AND trad = '膏';

-- Character: 苹 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"pín","zhuyin":[["ㄆ","ㄧㄣ","ˊ"]],"context_words":[],"meanings":["apple"]},{"pinyin":"píng","zhuyin":[["ㄆ","ㄧㄥ","ˊ"]],"context_words":[],"meanings":["apple"]}]'::jsonb
WHERE simp = '苹'
  AND trad = '蘋';

-- Character: 被 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bèi","zhuyin":[["ㄅ","ㄟ","ˋ"]],"context_words":[],"meanings":["by (indicates passive voice sentences); a quilt/blanket"]},{"pinyin":"pī","zhuyin":[["ㄆ","ㄧ","ˉ"]],"context_words":[],"meanings":["by (indicates passive voice sentences); a quilt/blanket"]}]'::jsonb
WHERE simp = '被'
  AND trad = '被';

-- Character: 观 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"guān","zhuyin":[["ㄍ","ㄨㄢ","ˉ"]],"context_words":[],"meanings":["to visit (a place, such as a tourist spot); inspect","spectator; audience"]},{"pinyin":"guàn","zhuyin":[["ㄍ","ㄨㄢ","ˋ"]],"context_words":[],"meanings":["to visit (a place, such as a tourist spot); inspect","spectator; audience"]}]'::jsonb
WHERE simp = '观'
  AND trad = '觀';

-- Character: 论 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"lùn","zhuyin":[["ㄌ","ㄨㄣ","ˋ"]],"context_words":[],"meanings":["to discuss; discussion; to talk over","no matter what; regardless of whether..."]},{"pinyin":"lún","zhuyin":[["ㄌ","ㄨㄣ","ˊ"]],"context_words":[],"meanings":["to discuss; discussion; to talk over","no matter what; regardless of whether..."]}]'::jsonb
WHERE simp = '论'
  AND trad = '論';

-- Character: 语 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"context_words":[],"meanings":["Chinese language","words and expressions; terms"]},{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"context_words":[],"meanings":["Chinese language","words and expressions; terms"]}]'::jsonb
WHERE simp = '语'
  AND trad = '語';

-- Character: 谁 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuí","zhuyin":[["ㄕ","ㄨㄟ","ˊ"]],"context_words":[],"meanings":["who"]},{"pinyin":"shéi","zhuyin":[["ㄕ","ㄟ","ˊ"]],"context_words":[],"meanings":["who"]}]'::jsonb
WHERE simp = '谁'
  AND trad = '誰';

-- Character: 责 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zé","zhuyin":[["ㄗ","ㄜ","ˊ"]],"context_words":[],"meanings":["responsible for (something); in charge of","responsibility; blame; duty"]},{"pinyin":"zhài","zhuyin":[["ㄓ","ㄞ","ˋ"]],"context_words":[],"meanings":["responsible for (something); in charge of","responsibility; blame; duty"]}]'::jsonb
WHERE simp = '责'
  AND trad = '責';

-- Character: 赚 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"context_words":[],"meanings":["earn; make a profit"]},{"pinyin":"zuàn","zhuyin":[["ㄗ","ㄨㄢ","ˋ"]],"context_words":[],"meanings":["earn; make a profit"]}]'::jsonb
WHERE simp = '赚'
  AND trad = '賺';

-- Character: 趟 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tàng","zhuyin":[["ㄊ","ㄤ","ˋ"]],"context_words":[],"meanings":["(mw for trips times) | to wade"]},{"pinyin":"tāng","zhuyin":[["ㄊ","ㄤ","ˉ"]],"context_words":[],"meanings":["(mw for trips times) | to wade"]}]'::jsonb
WHERE simp = '趟'
  AND trad = '趟';

-- Character: 趣 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qù","zhuyin":[["ㄑ","ㄩ","ˋ"]],"context_words":[],"meanings":["be interested in","interesting; fascinating; amusing"]},{"pinyin":"cù","zhuyin":[["ㄘ","ㄨ","ˋ"]],"context_words":[],"meanings":["be interested in","interesting; fascinating; amusing"]}]'::jsonb
WHERE simp = '趣'
  AND trad = '趣';

-- Character: 跳 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tiào","zhuyin":[["ㄊ","ㄧㄠ","ˋ"]],"context_words":[],"meanings":["to dance"]},{"pinyin":"táo","zhuyin":[["ㄊ","ㄠ","ˊ"]],"context_words":[],"meanings":["to dance"]}]'::jsonb
WHERE simp = '跳'
  AND trad = '跳';

-- Character: 钢 (Auto-generated from dictionary_expansion_v2.json (no manual context words))
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gāng","zhuyin":[["ㄍ","ㄤ","ˉ"]],"context_words":[],"meanings":["play the piano"]},{"pinyin":"gàng","zhuyin":[["ㄍ","ㄤ","ˋ"]],"context_words":[],"meanings":["play the piano"]}]'::jsonb
WHERE simp = '钢'
  AND trad = '鋼';


COMMIT;

-- Rollback helper
/*
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '干' AND trad = '干';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '且' AND trad = '且';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '丽' AND trad = '麗';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '么' AND trad = '麼';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '乘' AND trad = '乘';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '于' AND trad = '於';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '亚' AND trad = '亞';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '些' AND trad = '些';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '亲' AND trad = '親';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '仅' AND trad = '僅';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '从' AND trad = '從';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '价' AND trad = '價';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '任' AND trad = '任';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '份' AND trad = '份';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '休' AND trad = '休';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '估' AND trad = '估';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '体' AND trad = '體';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '信' AND trad = '信';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '俩' AND trad = '倆';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '倒' AND trad = '倒';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '共' AND trad = '共';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '其' AND trad = '其';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '冒' AND trad = '冒';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '净' AND trad = '淨';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '凉' AND trad = '涼';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '别' AND trad = '別';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '刷' AND trad = '刷';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '助' AND trad = '助';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '化' AND trad = '化';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '匙' AND trad = '匙';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '区' AND trad = '區';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '占' AND trad = '占';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '卡' AND trad = '卡';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '压' AND trad = '壓';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '句' AND trad = '句';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '可' AND trad = '可';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '台' AND trad = '台';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '号' AND trad = '號';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '各' AND trad = '各';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '合' AND trad = '合';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '同' AND trad = '同';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '否' AND trad = '否';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '吧' AND trad = '吧';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '呀' AND trad = '呀';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '呢' AND trad = '呢';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '咖' AND trad = '咖';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '咳' AND trad = '咳';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '填' AND trad = '填';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '夫' AND trad = '夫';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '奇' AND trad = '奇';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '妻' AND trad = '妻';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '孙' AND trad = '孫';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '底' AND trad = '底';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '度' AND trad = '度';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '弄' AND trad = '弄';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '思' AND trad = '思';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '愉' AND trad = '愉';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '戏' AND trad = '戲';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '打' AND trad = '打';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '择' AND trad = '擇';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '拾' AND trad = '拾';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '据' AND trad = '據';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '排' AND trad = '排';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '散' AND trad = '散';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '旁' AND trad = '旁';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '景' AND trad = '景';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '服' AND trad = '服';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '条' AND trad = '條';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '查' AND trad = '查';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '校' AND trad = '校';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '椅' AND trad = '椅';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '汗' AND trad = '汗';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '汤' AND trad = '湯';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '沙' AND trad = '沙';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '洗' AND trad = '洗';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '济' AND trad = '濟';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '父' AND trad = '父';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '片' AND trad = '片';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '甚' AND trad = '甚';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '疑' AND trad = '疑';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '研' AND trad = '研';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '硕' AND trad = '碩';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '票' AND trad = '票';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '禁' AND trad = '禁';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '稍' AND trad = '稍';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '约' AND trad = '約';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '肚' AND trad = '肚';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '胳' AND trad = '胳';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '膏' AND trad = '膏';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '苹' AND trad = '蘋';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '被' AND trad = '被';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '观' AND trad = '觀';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '论' AND trad = '論';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '语' AND trad = '語';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '谁' AND trad = '誰';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '责' AND trad = '責';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '赚' AND trad = '賺';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '趟' AND trad = '趟';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '趣' AND trad = '趣';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '跳' AND trad = '跳';
UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '钢' AND trad = '鋼';
*/
