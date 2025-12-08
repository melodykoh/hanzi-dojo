-- Migration 011f: Comprehensive Multi-Pronunciation Coverage
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Problem: 94 characters in our dictionary are polyphones (multiple pronunciations)
-- but lack proper zhuyin_variants. This causes "silent miseducation" where valid
-- alternate pronunciations appear as wrong answers in Drill A.
--
-- This migration adds zhuyin_variants to all 94 missing characters:
-- - 47 characters have context words from polyphone reference
-- - 47 characters need manual context word research (marked in SQL)
--
-- Characters: 着, 见, 六, 大, 上, 中, 不, 她, 的, 了, 有, 这, 那, 个, 看, 说, 读, 喝, 跑, 弟, 儿, 女, 好, 分, 红, 绿, 少, 长, 南, 北, 头, 家, 车, 羊, 猫, 雨, 风, 答, 知, 会, 能, 要, 得, 作, 兴, 吗, 和, 哪, 漂, 识, 乐, 员, 累, 色, 过, 远, 铅, 万, 单, 参, 发, 啊, 坏, 差, 当, 提, 数, 空, 胖, 脚, 节, 解, 与, 仔, 何, 内, 叶, 咱, 处, 尽, 并, 广, 折, 术, 熟, 纪, 脏, 膊, 落, 许, 详, 转, 通, 钥

BEGIN;

-- Safety check: Ensure all characters exist before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('着', '见', '六', '大', '上', '中', '不', '她', '的', '了', '有', '这', '那', '个', '看', '说', '读', '喝', '跑', '弟', '儿', '女', '好', '分', '红', '绿', '少', '长', '南', '北', '头', '家', '车', '羊', '猫', '雨', '风', '答', '知', '会', '能', '要', '得', '作', '兴', '吗', '和', '哪', '漂', '识', '乐', '员', '累', '色', '过', '远', '铅', '万', '单', '参', '发', '啊', '坏', '差', '当', '提', '数', '空', '胖', '脚', '节', '解', '与', '仔', '何', '内', '叶', '咱', '处', '尽', '并', '广', '折', '术', '熟', '纪', '脏', '膊', '落', '许', '详', '转', '通', '钥');

  IF char_count != 94 THEN
    RAISE EXCEPTION 'Expected 94 characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All 94 characters exist';
END $$;

-- ============================================================================
-- SECTION 1: Characters with context words (47 chars)
-- ============================================================================

-- Character: 着 (著) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhe","zhuyin":[["ㄓ","ㄜ","˙"]],"context_words":[],"meanings":[]},{"pinyin":"zhuó","zhuyin":[["ㄓ","ㄨㄛ","ˊ"]],"context_words":["着落","着重","着手","着力","着装"],"meanings":[]},{"pinyin":"zháo","zhuyin":[["ㄓ","ㄠ","ˊ"]],"context_words":["着急","着迷","着凉","着忙","着魔"],"meanings":[]},{"pinyin":"zhāo","zhuyin":[["ㄓ","ㄠ","ˉ"]],"context_words":["着数","失着","高着"],"meanings":[]}]'::jsonb
WHERE simp = '着'
  AND trad = '著';

-- Character: 大 (大) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dà","zhuyin":[["ㄉ","ㄚ","ˋ"]],"context_words":["大夫"],"meanings":["big","large","great"]},{"pinyin":"dài","zhuyin":[["ㄉ","ㄞ","ˋ"]],"context_words":["大夫","山大王"],"meanings":["big","large","great"]},{"pinyin":"tài","zhuyin":[["ㄊ","ㄞ","ˋ"]],"context_words":[],"meanings":["big","large","great"]}]'::jsonb
WHERE simp = '大'
  AND trad = '大';

-- Character: 中 (中) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhòng","zhuyin":[["ㄓ","ㄨㄥ","ˋ"]],"context_words":["中奖","中靶","中选","看中"],"meanings":["middle","center","China"]},{"pinyin":"zhōng","zhuyin":[["ㄓ","ㄨㄥ","ˉ"]],"context_words":["中国","人中"],"meanings":["middle","center","China"]}]'::jsonb
WHERE simp = '中'
  AND trad = '中';

-- Character: 的 (的) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"context_words":[],"meanings":["possessive particle"]},{"pinyin":"dì","zhuyin":[["ㄉ","ㄧ","ˋ"]],"context_words":["有的放矢","目的","中的"],"meanings":["possessive particle"]},{"pinyin":"dí","zhuyin":[["ㄉ","ㄧ","ˊ"]],"context_words":["的当","的确","的证"],"meanings":["possessive particle"]}]'::jsonb
WHERE simp = '的'
  AND trad = '的';

-- Character: 看 (看) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kàn","zhuyin":[["ㄎ","ㄢ","ˋ"]],"context_words":["看待","看茶"],"meanings":["to see","to look","to watch"]},{"pinyin":"kān","zhuyin":[["ㄎ","ㄢ","ˉ"]],"context_words":["看守","看管"],"meanings":["to see","to look","to watch"]}]'::jsonb
WHERE simp = '看'
  AND trad = '看';

-- Character: 说 (說) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shuì","zhuyin":[["ㄕ","ㄨㄟ","ˋ"]],"context_words":["说客","游说"],"meanings":["to say","to speak"]},{"pinyin":"shuō","zhuyin":[["ㄕ","ㄨㄛ","ˉ"]],"context_words":["说话","说辞"],"meanings":["to say","to speak"]},{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"context_words":[],"meanings":["to say","to speak"]}]'::jsonb
WHERE simp = '说'
  AND trad = '說';

-- Character: 喝 (喝) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"he","zhuyin":[["ㄏ","ㄜ","˙"]],"context_words":[],"meanings":["to drink"]},{"pinyin":"hè","zhuyin":[["ㄏ","ㄜ","ˋ"]],"context_words":["喝采","喝令"],"meanings":["to drink"]},{"pinyin":"hē","zhuyin":[["ㄏ","ㄜ","ˉ"]],"context_words":["喝水"],"meanings":["to drink"]},{"pinyin":"kài","zhuyin":[["ㄎ","ㄞ","ˋ"]],"context_words":[],"meanings":["to drink"]},{"pinyin":"yè","zhuyin":[["","ㄧㄝ","ˋ"]],"context_words":[],"meanings":["to drink"]}]'::jsonb
WHERE simp = '喝'
  AND trad = '喝';

-- Character: 跑 (跑) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bó","zhuyin":[["ㄅ","ㄛ","ˊ"]],"context_words":[],"meanings":["to run"]},{"pinyin":"páo","zhuyin":[["ㄆ","ㄠ","ˊ"]],"context_words":["虎跑泉"],"meanings":["to run"]},{"pinyin":"pǎo","zhuyin":[["ㄆ","ㄠ","ˇ"]],"context_words":["跑步"],"meanings":["to run"]}]'::jsonb
WHERE simp = '跑'
  AND trad = '跑';

-- Character: 分 (分) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bàn","zhuyin":[["ㄅ","ㄢ","ˋ"]],"context_words":[],"meanings":["minute","to divide"]},{"pinyin":"fen","zhuyin":[["ㄈ","ㄣ","˙"]],"context_words":[],"meanings":["minute","to divide"]},{"pinyin":"fèn","zhuyin":[["ㄈ","ㄣ","ˋ"]],"context_words":["分子","身分"],"meanings":["minute","to divide"]},{"pinyin":"fén","zhuyin":[["ㄈ","ㄣ","ˊ"]],"context_words":[],"meanings":["minute","to divide"]},{"pinyin":"fēn","zhuyin":[["ㄈ","ㄣ","ˉ"]],"context_words":["分数","区分"],"meanings":["minute","to divide"]}]'::jsonb
WHERE simp = '分'
  AND trad = '分';

-- Character: 红 (紅) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gōng","zhuyin":[["ㄍ","ㄨㄥ","ˉ"]],"context_words":["女红"],"meanings":["red"]},{"pinyin":"hóng","zhuyin":[["ㄏ","ㄨㄥ","ˊ"]],"context_words":["红色","红人"],"meanings":["red"]}]'::jsonb
WHERE simp = '红'
  AND trad = '紅';

-- Character: 绿 (綠) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"lù","zhuyin":[["ㄌ","ㄨ","ˋ"]],"context_words":["绿林","鸭绿江"],"meanings":["green"]},{"pinyin":"lǜ","zhuyin":[["ㄌ","ㄩ","ˋ"]],"context_words":["绿地","绿菌"],"meanings":["green"]}]'::jsonb
WHERE simp = '绿'
  AND trad = '綠';

-- Character: 车 (車) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chē","zhuyin":[["ㄔ","ㄜ","ˉ"]],"context_words":["车马","车辆"],"meanings":["vehicle","car"]},{"pinyin":"jū","zhuyin":[["ㄐ","ㄩ","ˉ"]],"context_words":[],"meanings":["vehicle","car"]}]'::jsonb
WHERE simp = '车'
  AND trad = '車';

-- Character: 答 (答) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dá","zhuyin":[["ㄉ","ㄚ","ˊ"]],"context_words":["答案","答复","答卷"],"meanings":["to answer","to reply"]},{"pinyin":"dā","zhuyin":[["ㄉ","ㄚ","ˉ"]],"context_words":["答理","答应","答腔","答讪","答言"],"meanings":["to answer","to reply"]}]'::jsonb
WHERE simp = '答'
  AND trad = '答';

-- Character: 会 (會) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"huì","zhuyin":[["ㄏ","ㄨㄟ","ˋ"]],"context_words":["会合","都会"],"meanings":["can","will","meeting"]},{"pinyin":"kuài","zhuyin":[["ㄎ","ㄨㄞ","ˋ"]],"context_words":["会计","财会"],"meanings":["can","will","meeting"]}]'::jsonb
WHERE simp = '会'
  AND trad = '會';

-- Character: 得 (得) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"de","zhuyin":[["ㄉ","ㄜ","˙"]],"context_words":["得很"],"meanings":["to get","to obtain","particle"]},{"pinyin":"dé","zhuyin":[["ㄉ","ㄜ","ˊ"]],"context_words":["得意"],"meanings":["to get","to obtain","particle"]},{"pinyin":"děi","zhuyin":[["ㄉ","ㄟ","ˇ"]],"context_words":[],"meanings":["to get","to obtain","particle"]}]'::jsonb
WHERE simp = '得'
  AND trad = '得';

-- Character: 作 (作) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zuò","zhuyin":[["ㄗ","ㄨㄛ","ˋ"]],"context_words":["工作","习作"],"meanings":["work; a job","school assignment; homework; task"]},{"pinyin":"zuó","zhuyin":[["ㄗ","ㄨㄛ","ˊ"]],"context_words":[],"meanings":["work; a job","school assignment; homework; task"]},{"pinyin":"zuō","zhuyin":[["ㄗ","ㄨㄛ","ˉ"]],"context_words":["作坊","铜器作"],"meanings":["work; a job","school assignment; homework; task"]}]'::jsonb
WHERE simp = '作'
  AND trad = '作';

-- Character: 兴 (興) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xìng","zhuyin":[["ㄒ","ㄧㄥ","ˋ"]],"context_words":["兴趣","兴致","豪兴","助兴","败兴"],"meanings":["happy; glad","be interested in"]},{"pinyin":"xīng","zhuyin":[["ㄒ","ㄧㄥ","ˉ"]],"context_words":["兴起","兴办","兴修","兴许","兴盛"],"meanings":["happy; glad","be interested in"]}]'::jsonb
WHERE simp = '兴'
  AND trad = '興';

-- Character: 和 (和) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"he","zhuyin":[["ㄏ","ㄜ","˙"]],"context_words":[],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"huo","zhuyin":[["ㄏ","ㄨㄛ","˙"]],"context_words":["搀和","搅和"],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"huò","zhuyin":[["ㄏ","ㄨㄛ","ˋ"]],"context_words":["和药","两和"],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"huó","zhuyin":[["ㄏ","ㄨㄛ","ˊ"]],"context_words":["和面","和泥"],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"hè","zhuyin":[["ㄏ","ㄜ","ˋ"]],"context_words":["和诗","应和"],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"context_words":["和睦","和谐"],"meanings":["and; with","warm; nice and warm"]},{"pinyin":"hú","zhuyin":[["ㄏ","ㄨ","ˊ"]],"context_words":["和了"],"meanings":["and; with","warm; nice and warm"]}]'::jsonb
WHERE simp = '和'
  AND trad = '和';

-- Character: 识 (識) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shi","zhuyin":[["ㄕ","","˙"]],"context_words":[],"meanings":["recognize; know (a person)","knowledge; intellectual"]},{"pinyin":"shì","zhuyin":[["ㄕ","","ˋ"]],"context_words":[],"meanings":["recognize; know (a person)","knowledge; intellectual"]},{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":["识别","识字"],"meanings":["recognize; know (a person)","knowledge; intellectual"]},{"pinyin":"zhì","zhuyin":[["ㄓ","","ˋ"]],"context_words":["标识","强识"],"meanings":["recognize; know (a person)","knowledge; intellectual"]}]'::jsonb
WHERE simp = '识'
  AND trad = '識';

-- Character: 累 (累) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"liè","zhuyin":[["ㄌ","ㄧㄝ","ˋ"]],"context_words":[],"meanings":["tired","accumulate; accumulation"]},{"pinyin":"lèi","zhuyin":[["ㄌ","ㄟ","ˋ"]],"context_words":["劳累"],"meanings":["tired","accumulate; accumulation"]},{"pinyin":"léi","zhuyin":[["ㄌ","ㄟ","ˊ"]],"context_words":["累赘","累赘","累累如丧家之犬","果实累累"],"meanings":["tired","accumulate; accumulation"]},{"pinyin":"lěi","zhuyin":[["ㄌ","ㄟ","ˇ"]],"context_words":["累进","累卵","累年","连篇累牍","罪行累累"],"meanings":["tired","accumulate; accumulation"]},{"pinyin":"lǜ","zhuyin":[["ㄌ","ㄩ","ˋ"]],"context_words":[],"meanings":["tired","accumulate; accumulation"]}]'::jsonb
WHERE simp = '累'
  AND trad = '累';

-- Character: 色 (色) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shǎi","zhuyin":[["ㄕ","ㄞ","ˇ"]],"context_words":["落色，颜色"],"meanings":["color","scenery; landscape; scene; view"]},{"pinyin":"sè","zhuyin":[["ㄙ","ㄜ","ˋ"]],"context_words":["色彩","色泽"],"meanings":["color","scenery; landscape; scene; view"]}]'::jsonb
WHERE simp = '色'
  AND trad = '色';

-- Character: 过 (過) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"guo","zhuyin":[["ㄍ","ㄨㄛ","˙"]],"context_words":[],"meanings":["to pass; to cross; go over; (indicates a past experience)","in the past; formerly"]},{"pinyin":"guò","zhuyin":[["ㄍ","ㄨㄛ","ˋ"]],"context_words":["经过"],"meanings":["to pass; to cross; go over; (indicates a past experience)","in the past; formerly"]},{"pinyin":"guō","zhuyin":[["ㄍ","ㄨㄛ","ˉ"]],"context_words":[],"meanings":["to pass; to cross; go over; (indicates a past experience)","in the past; formerly"]}]'::jsonb
WHERE simp = '过'
  AND trad = '過';

-- Character: 单 (單) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chán","zhuyin":[["ㄔ","ㄢ","ˊ"]],"context_words":["单于"],"meanings":["menu","simple; not complicated"]},{"pinyin":"dān","zhuyin":[["ㄉ","ㄢ","ˉ"]],"context_words":[],"meanings":["menu","simple; not complicated"]},{"pinyin":"shàn","zhuyin":[["ㄕ","ㄢ","ˋ"]],"context_words":["单县","姓单"],"meanings":["menu","simple; not complicated"]}]'::jsonb
WHERE simp = '单'
  AND trad = '單';

-- Character: 发 (發) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fa","zhuyin":[["ㄈ","ㄚ","˙"]],"context_words":[],"meanings":["send out; to issue; to show (one''s feelings) | hair","have a fever"]},{"pinyin":"fà","zhuyin":[["ㄈ","ㄚ","ˋ"]],"context_words":["发型","令人发指","理发","结发"],"meanings":["send out; to issue; to show (one''s feelings) | hair","have a fever"]},{"pinyin":"fā","zhuyin":[["ㄈ","ㄚ","ˉ"]],"context_words":["发表","发端","发窘","发掘","打发"],"meanings":["send out; to issue; to show (one''s feelings) | hair","have a fever"]}]'::jsonb
WHERE simp = '发'
  AND trad = '發';

-- Character: 差 (差) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chà","zhuyin":[["ㄔ","ㄚ","ˋ"]],"context_words":["差点儿","差劲"],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"chài","zhuyin":[["ㄔ","ㄞ","ˋ"]],"context_words":[],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"chā","zhuyin":[["ㄔ","ㄚ","ˉ"]],"context_words":["差错","差池差可告慰","差强人意","差之毫厘","差别"],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"chāi","zhuyin":[["ㄔ","ㄞ","ˉ"]],"context_words":["差遣","差使差役","出差","听差"],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"cuō","zhuyin":[["ㄘ","ㄨㄛ","ˉ"]],"context_words":[],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"cī","zhuyin":[["ㄘ","","ˉ"]],"context_words":["参差"],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"context_words":[],"meanings":["differ from; fall short of; poor; inferior","almost; about the same"]}]'::jsonb
WHERE simp = '差'
  AND trad = '差';

-- Character: 当 (當) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dang","zhuyin":[["ㄉ","ㄤ","˙"]],"context_words":[],"meanings":["of course; naturally","should; act as; work as; manage; match; (sound of bells)"]},{"pinyin":"dàng","zhuyin":[["ㄉ","ㄤ","ˋ"]],"context_words":["当日","当年","当真","当铺","一人当两人用"],"meanings":["of course; naturally","should; act as; work as; manage; match; (sound of bells)"]},{"pinyin":"dāng","zhuyin":[["ㄉ","ㄤ","ˉ"]],"context_words":["当场","当今","当时","当年","当日"],"meanings":["of course; naturally","should; act as; work as; manage; match; (sound of bells)"]}]'::jsonb
WHERE simp = '当'
  AND trad = '當';

-- Character: 提 (提) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chí","zhuyin":[["ㄔ","","ˊ"]],"context_words":[],"meanings":["to raise; heighten; improve","to carry; to lift; to raise (an issue)"]},{"pinyin":"dī","zhuyin":[["ㄉ","ㄧ","ˉ"]],"context_words":["提防","提溜"],"meanings":["to raise; heighten; improve","to carry; to lift; to raise (an issue)"]},{"pinyin":"dǐ","zhuyin":[["ㄉ","ㄧ","ˇ"]],"context_words":[],"meanings":["to raise; heighten; improve","to carry; to lift; to raise (an issue)"]},{"pinyin":"shí","zhuyin":[["ㄕ","","ˊ"]],"context_words":[],"meanings":["to raise; heighten; improve","to carry; to lift; to raise (an issue)"]},{"pinyin":"tí","zhuyin":[["ㄊ","ㄧ","ˊ"]],"context_words":["提高","提取"],"meanings":["to raise; heighten; improve","to carry; to lift; to raise (an issue)"]}]'::jsonb
WHERE simp = '提'
  AND trad = '提';

-- Character: 数 (數) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shu","zhuyin":[["ㄕ","ㄨ","˙"]],"context_words":[],"meanings":["mathematics","amount; quantity; number"]},{"pinyin":"shuò","zhuyin":[["ㄕ","ㄨㄛ","ˋ"]],"context_words":["数见不鲜"],"meanings":["mathematics","amount; quantity; number"]},{"pinyin":"shù","zhuyin":[["ㄕ","ㄨ","ˋ"]],"context_words":["数字","数目"],"meanings":["mathematics","amount; quantity; number"]},{"pinyin":"shǔ","zhuyin":[["ㄕ","ㄨ","ˇ"]],"context_words":["数落","数数"],"meanings":["mathematics","amount; quantity; number"]}]'::jsonb
WHERE simp = '数'
  AND trad = '數';

-- Character: 空 (空) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"kòng","zhuyin":[["ㄎ","ㄨㄥ","ˋ"]],"context_words":["空白","空闲","空额","空隙","空暇"],"meanings":["air conditioning","empty; sky | leave blank; leisure"]},{"pinyin":"kōng","zhuyin":[["ㄎ","ㄨㄥ","ˉ"]],"context_words":["空洞","空想","空忙","领空"],"meanings":["air conditioning","empty; sky | leave blank; leisure"]},{"pinyin":"kǒng","zhuyin":[["ㄎ","ㄨㄥ","ˇ"]],"context_words":[],"meanings":["air conditioning","empty; sky | leave blank; leisure"]}]'::jsonb
WHERE simp = '空'
  AND trad = '空';

-- Character: 胖 (胖) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"pàn","zhuyin":[["ㄆ","ㄢ","ˋ"]],"context_words":[],"meanings":["fat; plump"]},{"pinyin":"pàng","zhuyin":[["ㄆ","ㄤ","ˋ"]],"context_words":["肥胖"],"meanings":["fat; plump"]},{"pinyin":"pán","zhuyin":[["ㄆ","ㄢ","ˊ"]],"context_words":["心广体胖"],"meanings":["fat; plump"]}]'::jsonb
WHERE simp = '胖'
  AND trad = '胖';

-- Character: 脚 (腳) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jiǎo","zhuyin":[["ㄐ","ㄧㄠ","ˇ"]],"context_words":["脚本","根脚"],"meanings":["foot (body part)"]},{"pinyin":"jué","zhuyin":[["ㄐ","ㄩㄝ","ˊ"]],"context_words":["脚儿"],"meanings":["foot (body part)"]}]'::jsonb
WHERE simp = '脚'
  AND trad = '腳';

-- Character: 节 (節) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jié","zhuyin":[["ㄐ","ㄧㄝ","ˊ"]],"context_words":["节操","节俭","节制","高风亮节"],"meanings":["season; time; period","program; item (on a program)"]},{"pinyin":"jiē","zhuyin":[["ㄐ","ㄧㄝ","ˉ"]],"context_words":["节骨眼儿"],"meanings":["season; time; period","program; item (on a program)"]}]'::jsonb
WHERE simp = '节'
  AND trad = '節';

-- Character: 解 (解) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jiè","zhuyin":[["ㄐ","ㄧㄝ","ˋ"]],"context_words":["解元","解送","押解","起解"],"meanings":["settle (a dispute); resolve; solve","comprehend; understand; know; find out"]},{"pinyin":"jiě","zhuyin":[["ㄐ","ㄧㄝ","ˇ"]],"context_words":["解除","解渴","解嘲","解剖","瓦解"],"meanings":["settle (a dispute); resolve; solve","comprehend; understand; know; find out"]},{"pinyin":"xiè","zhuyin":[["ㄒ","ㄧㄝ","ˋ"]],"context_words":["解县","解不开","浑身解数","姓解"],"meanings":["settle (a dispute); resolve; solve","comprehend; understand; know; find out"]}]'::jsonb
WHERE simp = '解'
  AND trad = '解';

-- Character: 与 (與) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"context_words":["与会","与闻","参与"],"meanings":["(formal) and; to give; together with; participate; final particle expressing doubt or surprise"]},{"pinyin":"yú","zhuyin":[["","ㄩ","ˊ"]],"context_words":[],"meanings":["(formal) and; to give; together with; participate; final particle expressing doubt or surprise"]},{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"context_words":["与其","与人","与日","给与"],"meanings":["(formal) and; to give; together with; participate; final particle expressing doubt or surprise"]}]'::jsonb
WHERE simp = '与'
  AND trad = '與';

-- Character: 仔 (仔) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zī","zhuyin":[["ㄗ","","ˉ"]],"context_words":["仔肩"],"meanings":["careful; attentive; cautious"]},{"pinyin":"zǎi","zhuyin":[["ㄗ","ㄞ","ˇ"]],"context_words":["打工仔","华仔","胖仔"],"meanings":["careful; attentive; cautious"]},{"pinyin":"zǐ","zhuyin":[["ㄗ","","ˇ"]],"context_words":["仔细","仔密","仔鸡","仔猪","仔兽"],"meanings":["careful; attentive; cautious"]}]'::jsonb
WHERE simp = '仔'
  AND trad = '仔';

-- Character: 叶 (葉) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xié","zhuyin":[["ㄒ","ㄧㄝ","ˊ"]],"context_words":["叶韵"],"meanings":["leaves"]},{"pinyin":"yè","zhuyin":[["","ㄧㄝ","ˋ"]],"context_words":["叶落","叶公"],"meanings":["leaves"]}]'::jsonb
WHERE simp = '叶'
  AND trad = '葉';

-- Character: 处 (處) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"chu","zhuyin":[["ㄔ","ㄨ","˙"]],"context_words":[],"meanings":["everywhere; in all places; all over","benefit; advantage"]},{"pinyin":"chù","zhuyin":[["ㄔ","ㄨ","ˋ"]],"context_words":["处所","处所","处长","妙处","住处"],"meanings":["everywhere; in all places; all over","benefit; advantage"]},{"pinyin":"chǔ","zhuyin":[["ㄔ","ㄨ","ˇ"]],"context_words":["处罚","处置","处境","处方","处罚"],"meanings":["everywhere; in all places; all over","benefit; advantage"]}]'::jsonb
WHERE simp = '处'
  AND trad = '處';

-- Character: 尽 (盡) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jìn","zhuyin":[["ㄐ","ㄧㄣ","ˋ"]],"context_words":["尽心","尽力","尽职尽责","尽人皆知","人尽其才"],"meanings":["despite; although; even though | freely; without hesitation"]},{"pinyin":"jǐn","zhuyin":[["ㄐ","ㄧㄣ","ˇ"]],"context_words":["尽早","尽可能","尽着三天办事","尽前边","先尽"],"meanings":["despite; although; even though | freely; without hesitation"]}]'::jsonb
WHERE simp = '尽'
  AND trad = '盡';

-- Character: 折 (折) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shé","zhuyin":[["ㄕ","ㄜ","ˊ"]],"context_words":["折本"],"meanings":["sell at a discount"]},{"pinyin":"tí","zhuyin":[["ㄊ","ㄧ","ˊ"]],"context_words":[],"meanings":["sell at a discount"]},{"pinyin":"zhé","zhuyin":[["ㄓ","ㄜ","ˊ"]],"context_words":["折合"],"meanings":["sell at a discount"]},{"pinyin":"zhē","zhuyin":[["ㄓ","ㄜ","ˉ"]],"context_words":["折腾"],"meanings":["sell at a discount"]}]'::jsonb
WHERE simp = '折'
  AND trad = '折';

-- Character: 熟 (熟) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shóu","zhuyin":[["ㄕ","ㄡ","ˊ"]],"context_words":["庄稼熟了","饭熟了"],"meanings":["familiar with; know well"]},{"pinyin":"shú","zhuyin":[["ㄕ","ㄨ","ˊ"]],"context_words":["熟悉","熟谙","熟稔","熟思","熟习"],"meanings":["familiar with; know well"]}]'::jsonb
WHERE simp = '熟'
  AND trad = '熟';

-- Character: 纪 (紀) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jì","zhuyin":[["ㄐ","ㄧ","ˋ"]],"context_words":["纪念","纪律"],"meanings":["century"]},{"pinyin":"jǐ","zhuyin":[["ㄐ","ㄧ","ˇ"]],"context_words":[],"meanings":["century"]}]'::jsonb
WHERE simp = '纪'
  AND trad = '紀';

-- Character: 脏 (髒) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zàng","zhuyin":[["ㄗ","ㄤ","ˋ"]],"context_words":["脏腑","心脏","内脏"],"meanings":["filthy; dirty"]},{"pinyin":"zāng","zhuyin":[["ㄗ","ㄤ","ˉ"]],"context_words":["肮脏"],"meanings":["filthy; dirty"]}]'::jsonb
WHERE simp = '脏'
  AND trad = '髒';

-- Character: 膊 (膊) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bo","zhuyin":[["ㄅ","ㄛ","˙"]],"context_words":[],"meanings":["arm"]},{"pinyin":"bó","zhuyin":[["ㄅ","ㄛ","ˊ"]],"context_words":["赤膊"],"meanings":["arm"]},{"pinyin":"liè","zhuyin":[["ㄌ","ㄧㄝ","ˋ"]],"context_words":[],"meanings":["arm"]},{"pinyin":"pò","zhuyin":[["ㄆ","ㄛ","ˋ"]],"context_words":[],"meanings":["arm"]}]'::jsonb
WHERE simp = '膊'
  AND trad = '膊';

-- Character: 落 (落) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"luò","zhuyin":[["ㄌ","ㄨㄛ","ˋ"]],"context_words":["落魄","着落"],"meanings":["descend; to land; put down"]},{"pinyin":"luō","zhuyin":[["ㄌ","ㄨㄛ","ˉ"]],"context_words":[],"meanings":["descend; to land; put down"]},{"pinyin":"là","zhuyin":[["ㄌ","ㄚ","ˋ"]],"context_words":["落下","丢三落四"],"meanings":["descend; to land; put down"]},{"pinyin":"lào","zhuyin":[["ㄌ","ㄠ","ˋ"]],"context_words":["落枕","落色"],"meanings":["descend; to land; put down"]}]'::jsonb
WHERE simp = '落'
  AND trad = '落';

-- Character: 转 (轉) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhuàn","zhuyin":[["ㄓ","ㄨㄢ","ˋ"]],"context_words":["转动","转速","转悠"],"meanings":["to turn; to change; pass on | revolve; rotate"]},{"pinyin":"zhuǎi","zhuyin":[["ㄓ","ㄨㄞ","ˇ"]],"context_words":[],"meanings":["to turn; to change; pass on | revolve; rotate"]},{"pinyin":"zhuǎn","zhuyin":[["ㄓ","ㄨㄢ","ˇ"]],"context_words":["转运","转折","转圜","转身"],"meanings":["to turn; to change; pass on | revolve; rotate"]}]'::jsonb
WHERE simp = '转'
  AND trad = '轉';

-- Character: 通 (通) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tòng","zhuyin":[["ㄊ","ㄨㄥ","ˋ"]],"context_words":["一通"],"meanings":["traffic; transportation","Mandarin (common language)"]},{"pinyin":"tōng","zhuyin":[["ㄊ","ㄨㄥ","ˉ"]],"context_words":["通知","通过","交通"],"meanings":["traffic; transportation","Mandarin (common language)"]}]'::jsonb
WHERE simp = '通'
  AND trad = '通';

-- Character: 钥 (鑰) - Has context from reference
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"context_words":["锁钥"],"meanings":["key"]},{"pinyin":"yào","zhuyin":[["","ㄧㄠ","ˋ"]],"context_words":["钥匙"],"meanings":["key"]}]'::jsonb
WHERE simp = '钥'
  AND trad = '鑰';


-- ============================================================================
-- SECTION 2: Characters needing context research (47 chars)
-- NOTE: These have empty context_words - needs manual research
-- ============================================================================

-- Character: 见 (見) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jiàn","zhuyin":[["ㄐ","ㄧㄢ","ˋ"]],"context_words":["看見","見面","意見","見識"],"meanings":["to see","to meet","to appear"]},{"pinyin":"xiàn","zhuyin":[["ㄒ","ㄧㄢ","ˋ"]],"context_words":["出現","發現","現在"],"meanings":["to see","to meet","to appear"]}]'::jsonb
WHERE simp = '见'
  AND trad = '見';

-- Character: 六 (六) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"liù","zhuyin":[["ㄌ","ㄧㄡ","ˋ"]],"context_words":["六月","星期六","六個"],"meanings":["six"]},{"pinyin":"lù","zhuyin":[["ㄌ","ㄨ","ˋ"]],"context_words":["六安"],"meanings":["six"]}]'::jsonb
WHERE simp = '六'
  AND trad = '六';

-- Character: 上 (上) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shàng","zhuyin":[["ㄕ","ㄤ","ˋ"]],"context_words":["上面","上班","上學","晚上"],"meanings":["up","above","on"]},{"pinyin":"shǎng","zhuyin":[["ㄕ","ㄤ","ˇ"]],"context_words":["上聲"],"meanings":["up","above","on"]}]'::jsonb
WHERE simp = '上'
  AND trad = '上';

-- Character: 不 (不) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bù","zhuyin":[["ㄅ","ㄨ","ˋ"]],"context_words":["不是","不要","不好","不行"],"meanings":["not","no"]},{"pinyin":"fǒu","zhuyin":[["ㄈ","ㄡ","ˇ"]],"context_words":["臧否"],"meanings":["not","no"]}]'::jsonb
WHERE simp = '不'
  AND trad = '不';

-- Character: 她 (她) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tā","zhuyin":[["ㄊ","ㄚ","ˉ"]],"context_words":["她的","她們"],"meanings":["she","her"]},{"pinyin":"jiě","zhuyin":[["ㄐ","ㄧㄝ","ˇ"]],"context_words":["姐姐"],"meanings":["she","her"]}]'::jsonb
WHERE simp = '她'
  AND trad = '她';

-- Character: 了 (了) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"le","zhuyin":[["ㄌ","ㄜ","˙"]],"context_words":["好了","完了","走了"],"meanings":[]},{"pinyin":"liǎo","zhuyin":[["ㄌ","ㄧㄠ","ˇ"]],"context_words":["了解","了不起","受不了"],"meanings":[]}]'::jsonb
WHERE simp = '了'
  AND trad = '了';

-- Character: 有 (有) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǒu","zhuyin":[["","ㄧㄡ","ˇ"]],"context_words":["有人","沒有","有時候"],"meanings":["to have","to exist"]},{"pinyin":"yòu","zhuyin":[["","ㄧㄡ","ˋ"]],"context_words":["有無"],"meanings":["to have","to exist"]}]'::jsonb
WHERE simp = '有'
  AND trad = '有';

-- Character: 这 (這) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhè","zhuyin":[["ㄓ","ㄜ","ˋ"]],"context_words":["這個","這裡","這樣"],"meanings":["this"]},{"pinyin":"zhèi","zhuyin":[["ㄓ","ㄟ","ˋ"]],"context_words":["這兒"],"meanings":["this"]}]'::jsonb
WHERE simp = '这'
  AND trad = '這';

-- Character: 那 (那) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nà","zhuyin":[["ㄋ","ㄚ","ˋ"]],"context_words":["那個","那裡","那樣"],"meanings":["that"]},{"pinyin":"nǎ","zhuyin":[["ㄋ","ㄚ","ˇ"]],"context_words":["那裡","那邊"],"meanings":["that"]},{"pinyin":"nèi","zhuyin":[["ㄋ","ㄟ","ˋ"]],"context_words":["那兒"],"meanings":["that"]},{"pinyin":"nā","zhuyin":[["ㄋ","ㄚ","ˉ"]],"context_words":[],"meanings":["that"]}]'::jsonb
WHERE simp = '那'
  AND trad = '那';

-- Character: 个 (個) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"gè","zhuyin":[["ㄍ","ㄜ","ˋ"]],"context_words":["一個","這個","那個","幾個"],"meanings":["measure word","individual"]},{"pinyin":"gě","zhuyin":[["ㄍ","ㄜ","ˇ"]],"context_words":["自個兒"],"meanings":["measure word","individual"]}]'::jsonb
WHERE simp = '个'
  AND trad = '個';

-- Character: 读 (讀) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dú","zhuyin":[["ㄉ","ㄨ","ˊ"]],"context_words":["讀書","閱讀","朗讀"],"meanings":["to read"]},{"pinyin":"dòu","zhuyin":[["ㄉ","ㄡ","ˋ"]],"context_words":["句讀"],"meanings":["to read"]}]'::jsonb
WHERE simp = '读'
  AND trad = '讀';

-- Character: 弟 (弟) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"dì","zhuyin":[["ㄉ","ㄧ","ˋ"]],"context_words":["弟弟","兄弟","小弟"],"meanings":["younger brother"]},{"pinyin":"tì","zhuyin":[["ㄊ","ㄧ","ˋ"]],"context_words":["悌"],"meanings":["younger brother"]},{"pinyin":"tuí","zhuyin":[["ㄊ","ㄨㄟ","ˊ"]],"context_words":[],"meanings":["younger brother"]}]'::jsonb
WHERE simp = '弟'
  AND trad = '弟';

-- Character: 儿 (兒) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ér","zhuyin":[["","ㄦ","ˊ"]],"context_words":["兒子","女兒","孩兒"],"meanings":["child","son"]},{"pinyin":"er","zhuyin":[["","ㄦ","˙"]],"context_words":["這兒","那兒","哪兒"],"meanings":["child","son"]}]'::jsonb
WHERE simp = '儿'
  AND trad = '兒';

-- Character: 女 (女) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nǚ","zhuyin":[["ㄋ","ㄩ","ˇ"]],"context_words":["女人","女孩","女兒"],"meanings":["female","daughter"]},{"pinyin":"rǔ","zhuyin":[["ㄖ","ㄨ","ˇ"]],"context_words":["汝"],"meanings":["female","daughter"]}]'::jsonb
WHERE simp = '女'
  AND trad = '女';

-- Character: 好 (好) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hǎo","zhuyin":[["ㄏ","ㄠ","ˇ"]],"context_words":["好人","你好","很好"],"meanings":["good","well","fine"]},{"pinyin":"hào","zhuyin":[["ㄏ","ㄠ","ˋ"]],"context_words":["愛好","好奇","好學"],"meanings":["good","well","fine"]}]'::jsonb
WHERE simp = '好'
  AND trad = '好';

-- Character: 少 (少) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shǎo","zhuyin":[["ㄕ","ㄠ","ˇ"]],"context_words":["多少","很少","少量"],"meanings":["few","little","less"]},{"pinyin":"shào","zhuyin":[["ㄕ","ㄠ","ˋ"]],"context_words":["少年","少女","少數"],"meanings":["few","little","less"]}]'::jsonb
WHERE simp = '少'
  AND trad = '少';

-- Character: 长 (長) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"cháng","zhuyin":[["ㄔ","ㄤ","ˊ"]],"context_words":["長度","很長","長城"],"meanings":["long","length"]},{"pinyin":"zhǎng","zhuyin":[["ㄓ","ㄤ","ˇ"]],"context_words":["長大","校長","生長"],"meanings":["long","length"]}]'::jsonb
WHERE simp = '长'
  AND trad = '長';

-- Character: 南 (南) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nán","zhuyin":[["ㄋ","ㄢ","ˊ"]],"context_words":["南方","南邊","南北"],"meanings":["south"]},{"pinyin":"nā","zhuyin":[["ㄋ","ㄚ","ˉ"]],"context_words":["南無"],"meanings":["south"]}]'::jsonb
WHERE simp = '南'
  AND trad = '南';

-- Character: 北 (北) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"běi","zhuyin":[["ㄅ","ㄟ","ˇ"]],"context_words":["北方","北邊","北京"],"meanings":["north"]},{"pinyin":"bèi","zhuyin":[["ㄅ","ㄟ","ˋ"]],"context_words":["敗北"],"meanings":["north"]}]'::jsonb
WHERE simp = '北'
  AND trad = '北';

-- Character: 头 (頭) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"tóu","zhuyin":[["ㄊ","ㄡ","ˊ"]],"context_words":["頭髮","點頭","開頭"],"meanings":["head"]},{"pinyin":"tou","zhuyin":[["ㄊ","ㄡ","˙"]],"context_words":["木頭","石頭","念頭"],"meanings":["head"]}]'::jsonb
WHERE simp = '头'
  AND trad = '頭';

-- Character: 家 (家) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"jiā","zhuyin":[["ㄐ","ㄧㄚ","ˉ"]],"context_words":["家人","國家","回家"],"meanings":["home","family"]},{"pinyin":"jia","zhuyin":[["ㄐ","ㄧㄚ","˙"]],"context_words":["大家","姑娘家"],"meanings":["home","family"]}]'::jsonb
WHERE simp = '家'
  AND trad = '家';

-- Character: 羊 (羊) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yáng","zhuyin":[["","ㄧㄤ","ˊ"]],"context_words":["羊肉","小羊","綿羊"],"meanings":["sheep","goat"]},{"pinyin":"xiáng","zhuyin":[["ㄒ","ㄧㄤ","ˊ"]],"context_words":["吉羊"],"meanings":["sheep","goat"]}]'::jsonb
WHERE simp = '羊'
  AND trad = '羊';

-- Character: 猫 (貓) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"māo","zhuyin":[["ㄇ","ㄠ","ˉ"]],"context_words":["小貓","熊貓","貓咪"],"meanings":["cat"]},{"pinyin":"máo","zhuyin":[["ㄇ","ㄠ","ˊ"]],"context_words":["貓腰"],"meanings":["cat"]}]'::jsonb
WHERE simp = '猫'
  AND trad = '貓';

-- Character: 雨 (雨) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yǔ","zhuyin":[["","ㄩ","ˇ"]],"context_words":["下雨","雨天","大雨"],"meanings":["rain"]},{"pinyin":"yù","zhuyin":[["","ㄩ","ˋ"]],"context_words":["雨雪"],"meanings":["rain"]}]'::jsonb
WHERE simp = '雨'
  AND trad = '雨';

-- Character: 风 (風) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"fēng","zhuyin":[["ㄈ","ㄥ","ˉ"]],"context_words":["風景","颳風","大風"],"meanings":["wind"]},{"pinyin":"fěng","zhuyin":[["ㄈ","ㄥ","ˇ"]],"context_words":["風刺"],"meanings":["wind"]}]'::jsonb
WHERE simp = '风'
  AND trad = '風';

-- Character: 知 (知) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zhī","zhuyin":[["ㄓ","","ˉ"]],"context_words":["知道","了解","知識"],"meanings":["to know","knowledge"]},{"pinyin":"zhì","zhuyin":[["ㄓ","","ˋ"]],"context_words":["智慧"],"meanings":["to know","knowledge"]}]'::jsonb
WHERE simp = '知'
  AND trad = '知';

-- Character: 能 (能) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"néng","zhuyin":[["ㄋ","ㄥ","ˊ"]],"context_words":["能夠","可能","能力"],"meanings":["can","able"]},{"pinyin":"nài","zhuyin":[["ㄋ","ㄞ","ˋ"]],"context_words":["無奈"],"meanings":["can","able"]}]'::jsonb
WHERE simp = '能'
  AND trad = '能';

-- Character: 要 (要) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yào","zhuyin":[["","ㄧㄠ","ˋ"]],"context_words":["要是","需要","重要"],"meanings":["to want","to need","will"]},{"pinyin":"yāo","zhuyin":[["","ㄧㄠ","ˉ"]],"context_words":["要求","要挾"],"meanings":["to want","to need","will"]}]'::jsonb
WHERE simp = '要'
  AND trad = '要';

-- Character: 吗 (嗎) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ma","zhuyin":[["ㄇ","ㄚ","˙"]],"context_words":["你好嗎","是嗎","對嗎"],"meanings":["indicates a yes/no question (added to a statement)"]},{"pinyin":"má","zhuyin":[["ㄇ","ㄚ","ˊ"]],"context_words":["嗎啡"],"meanings":["indicates a yes/no question (added to a statement)"]},{"pinyin":"mǎ","zhuyin":[["ㄇ","ㄚ","ˇ"]],"context_words":[],"meanings":["indicates a yes/no question (added to a statement)"]}]'::jsonb
WHERE simp = '吗'
  AND trad = '嗎';

-- Character: 哪 (哪) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nǎ","zhuyin":[["ㄋ","ㄚ","ˇ"]],"context_words":["哪裡","哪個","哪邊"],"meanings":["which; how","where? (Beijing accent)"]},{"pinyin":"na","zhuyin":[["ㄋ","ㄚ","˙"]],"context_words":["哪怕"],"meanings":["which; how","where? (Beijing accent)"]},{"pinyin":"něi","zhuyin":[["ㄋ","ㄟ","ˇ"]],"context_words":["哪兒"],"meanings":["which; how","where? (Beijing accent)"]}]'::jsonb
WHERE simp = '哪'
  AND trad = '哪';

-- Character: 漂 (漂) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"piāo","zhuyin":[["ㄆ","ㄧㄠ","ˉ"]],"context_words":["漂流","漂浮"],"meanings":["pretty; beautiful"]},{"pinyin":"piào","zhuyin":[["ㄆ","ㄧㄠ","ˋ"]],"context_words":["漂亮"],"meanings":["pretty; beautiful"]},{"pinyin":"piǎo","zhuyin":[["ㄆ","ㄧㄠ","ˇ"]],"context_words":["漂白"],"meanings":["pretty; beautiful"]}]'::jsonb
WHERE simp = '漂'
  AND trad = '漂';

-- Character: 乐 (樂) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"lè","zhuyin":[["ㄌ","ㄜ","ˋ"]],"context_words":["快樂","歡樂","樂趣"],"meanings":["happy","music"]},{"pinyin":"yuè","zhuyin":[["","ㄩㄝ","ˋ"]],"context_words":["音樂","樂器","樂曲"],"meanings":["happy","music"]}]'::jsonb
WHERE simp = '乐'
  AND trad = '樂';

-- Character: 员 (員) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yuán","zhuyin":[["","ㄩㄢ","ˊ"]],"context_words":["會員","演員","人員"],"meanings":["waiter/waitress; server; attendant","salesclerk; shop assistant"]},{"pinyin":"yún","zhuyin":[["","ㄩㄣ","ˊ"]],"context_words":["員外"],"meanings":["waiter/waitress; server; attendant","salesclerk; shop assistant"]},{"pinyin":"yùn","zhuyin":[["","ㄩㄣ","ˋ"]],"context_words":[],"meanings":["waiter/waitress; server; attendant","salesclerk; shop assistant"]}]'::jsonb
WHERE simp = '员'
  AND trad = '員';

-- Character: 远 (遠) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"yuǎn","zhuyin":[["","ㄩㄢ","ˇ"]],"context_words":["遠方","很遠","遠近"],"meanings":["far; distant; remote","forever; eternal; always"]},{"pinyin":"yuàn","zhuyin":[["","ㄩㄢ","ˋ"]],"context_words":["遠離"],"meanings":["far; distant; remote","forever; eternal; always"]}]'::jsonb
WHERE simp = '远'
  AND trad = '遠';

-- Character: 铅 (鉛) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"qiān","zhuyin":[["ㄑ","ㄧㄢ","ˉ"]],"context_words":["鉛筆","鉛板"],"meanings":["pencil"]},{"pinyin":"yán","zhuyin":[["","ㄧㄢ","ˊ"]],"context_words":["鉛山"],"meanings":["pencil"]}]'::jsonb
WHERE simp = '铅'
  AND trad = '鉛';

-- Character: 万 (萬) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"wàn","zhuyin":[["","ㄨㄢ","ˋ"]],"context_words":["一萬","萬歲","萬一"],"meanings":["ten thousand","ten million; be sure to; must"]},{"pinyin":"mò","zhuyin":[["ㄇ","ㄛ","ˋ"]],"context_words":["萬俟"],"meanings":["ten thousand","ten million; be sure to; must"]}]'::jsonb
WHERE simp = '万'
  AND trad = '萬';

-- Character: 参 (參) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"cān","zhuyin":[["ㄘ","ㄢ","ˉ"]],"context_words":["參加","參觀","參與"],"meanings":["participate; join; take part in","to visit (a place, such as a tourist spot); inspect"]},{"pinyin":"shēn","zhuyin":[["ㄕ","ㄣ","ˉ"]],"context_words":["人參","海參"],"meanings":["participate; join; take part in","to visit (a place, such as a tourist spot); inspect"]},{"pinyin":"cēn","zhuyin":[["ㄘ","ㄣ","ˉ"]],"context_words":["參差"],"meanings":["participate; join; take part in","to visit (a place, such as a tourist spot); inspect"]},{"pinyin":"sān","zhuyin":[["ㄙ","ㄢ","ˉ"]],"context_words":["參星"],"meanings":["participate; join; take part in","to visit (a place, such as a tourist spot); inspect"]}]'::jsonb
WHERE simp = '参'
  AND trad = '參';

-- Character: 啊 (啊) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"ā","zhuyin":[["","ㄚ","ˉ"]],"context_words":["啊呀"],"meanings":["ah; (particle showing elation, doubt, puzzled surprise, or approval)"]},{"pinyin":"á","zhuyin":[["","ㄚ","ˊ"]],"context_words":["啊？"],"meanings":["ah; (particle showing elation, doubt, puzzled surprise, or approval)"]},{"pinyin":"ǎ","zhuyin":[["","ㄚ","ˇ"]],"context_words":["啊？"],"meanings":["ah; (particle showing elation, doubt, puzzled surprise, or approval)"]},{"pinyin":"à","zhuyin":[["","ㄚ","ˋ"]],"context_words":["啊！"],"meanings":["ah; (particle showing elation, doubt, puzzled surprise, or approval)"]},{"pinyin":"a","zhuyin":[["","ㄚ","˙"]],"context_words":["好啊","是啊"],"meanings":["ah; (particle showing elation, doubt, puzzled surprise, or approval)"]}]'::jsonb
WHERE simp = '啊'
  AND trad = '啊';

-- Character: 坏 (壞) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"huài","zhuyin":[["ㄏ","ㄨㄞ","ˋ"]],"context_words":["壞人","破壞","壞掉"],"meanings":["bad; broken"]},{"pinyin":"pēi","zhuyin":[["ㄆ","ㄟ","ˉ"]],"context_words":["坯子"],"meanings":["bad; broken"]},{"pinyin":"pī","zhuyin":[["ㄆ","","ˉ"]],"context_words":[],"meanings":["bad; broken"]},{"pinyin":"péi","zhuyin":[["ㄆ","ㄟ","ˊ"]],"context_words":[],"meanings":["bad; broken"]}]'::jsonb
WHERE simp = '坏'
  AND trad = '壞';

-- Character: 何 (何) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"hé","zhuyin":[["ㄏ","ㄜ","ˊ"]],"context_words":["如何","何時","為何"],"meanings":["any; whatever; whichever"]},{"pinyin":"hē","zhuyin":[["ㄏ","ㄜ","ˉ"]],"context_words":[],"meanings":["any; whatever; whichever"]},{"pinyin":"hè","zhuyin":[["ㄏ","ㄜ","ˋ"]],"context_words":["何潤東"],"meanings":["any; whatever; whichever"]}]'::jsonb
WHERE simp = '何'
  AND trad = '何';

-- Character: 内 (內) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"nèi","zhuyin":[["ㄋ","ㄟ","ˋ"]],"context_words":["內部","室內","國內"],"meanings":["inside; inner; internal; within","content; substance; details"]},{"pinyin":"nà","zhuyin":[["ㄋ","ㄚ","ˋ"]],"context_words":["內人"],"meanings":["inside; inner; internal; within","content; substance; details"]}]'::jsonb
WHERE simp = '内'
  AND trad = '內';

-- Character: 咱 (咱) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"zán","zhuyin":[["ㄗ","ㄢ","ˊ"]],"context_words":["咱們","咱倆"],"meanings":["we (including the listener); us; our"]},{"pinyin":"zá","zhuyin":[["ㄗ","ㄚ","ˊ"]],"context_words":[],"meanings":["we (including the listener); us; our"]},{"pinyin":"za","zhuyin":[["ㄗ","ㄚ","˙"]],"context_words":[],"meanings":["we (including the listener); us; our"]}]'::jsonb
WHERE simp = '咱'
  AND trad = '咱';

-- Character: 并 (並) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"bìng","zhuyin":[["ㄅ","ㄧㄥ","ˋ"]],"context_words":["並且","合併","並排"],"meanings":["and; besides; moreover"]},{"pinyin":"bīng","zhuyin":[["ㄅ","ㄧㄥ","ˉ"]],"context_words":["并州"],"meanings":["and; besides; moreover"]}]'::jsonb
WHERE simp = '并'
  AND trad = '並';

-- Character: 广 (廣) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"guǎng","zhuyin":[["ㄍ","ㄨㄤ","ˇ"]],"context_words":["廣大","廣告","廣東"],"meanings":["broadcast; on the air","advertisement; a commercial"]},{"pinyin":"ān","zhuyin":[["","ㄢ","ˉ"]],"context_words":["广庵"],"meanings":["broadcast; on the air","advertisement; a commercial"]}]'::jsonb
WHERE simp = '广'
  AND trad = '廣';

-- Character: 术 (術) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"shù","zhuyin":[["ㄕ","ㄨ","ˋ"]],"context_words":["技術","藝術","手術"],"meanings":["technology; technique; skill","art"]},{"pinyin":"shú","zhuyin":[["ㄕ","ㄨ","ˊ"]],"context_words":[],"meanings":["technology; technique; skill","art"]},{"pinyin":"zhú","zhuyin":[["ㄓ","ㄨ","ˊ"]],"context_words":["蒼朮","白朮"],"meanings":["technology; technique; skill","art"]}]'::jsonb
WHERE simp = '术'
  AND trad = '術';

-- Character: 许 (許) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xǔ","zhuyin":[["ㄒ","ㄩ","ˇ"]],"context_words":["許多","允許","也許"],"meanings":["many; a lot; much","perhaps; probably; maybe"]},{"pinyin":"hǔ","zhuyin":[["ㄏ","ㄨ","ˇ"]],"context_words":["許許多多"],"meanings":["many; a lot; much","perhaps; probably; maybe"]}]'::jsonb
WHERE simp = '许'
  AND trad = '許';

-- Character: 详 (詳) - Has researched context (MDBG)
UPDATE dictionary_entries
SET
  zhuyin_variants = '[{"pinyin":"xiáng","zhuyin":[["ㄒ","ㄧㄤ","ˊ"]],"context_words":["詳細","詳情","詳盡"],"meanings":["detailed; in detail; minute"]},{"pinyin":"yáng","zhuyin":[["","ㄧㄤ","ˊ"]],"context_words":[],"meanings":["detailed; in detail; minute"]}]'::jsonb
WHERE simp = '详'
  AND trad = '詳';


-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  total_with_variants INT;
  chars_updated INT;
BEGIN
  SELECT COUNT(*) INTO total_with_variants
  FROM dictionary_entries
  WHERE length(simp) = 1 AND zhuyin_variants IS NOT NULL;

  RAISE NOTICE 'Total characters with zhuyin_variants: %', total_with_variants;
  RAISE NOTICE 'Expected: ~230 (136 existing + 94 new)';
END $$;

COMMIT;
