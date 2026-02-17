-- Migration: Fix Simplified Chinese Context Words in dictionary_entries and readings
-- Issue: #36 (https://github.com/melodykoh/hanzi-dojo/issues/36)
-- Date: 2026-02-16
--
-- ROOT CAUSE: Migrations 011f and 015c introduced context_words containing simplified
-- Chinese characters. Previous fix attempts (20260117000002, 20260118000002) used a
-- self-referential detection query (checking against dictionary_entries WHERE simp != trad)
-- which missed simplified characters NOT in the dictionary (e.g., 劲/勁, 铺/鋪, 谙/諳).
--
-- THIS FIX: Uses an internet-verified, comprehensive word-level mapping built by analyzing
-- all 1,316 unique context_words against authoritative character databases (MDBG/CC-CEDICT).
-- Context-dependent characters handled explicitly:
--   发 → 髮 (hair) vs 發 (emit)
--   干 → 幹 (do) vs 乾 (dry)
--   脏 → 臟 (organ) vs 髒 (dirty)
--   占 → stays 占 for divination (占卜)
--   累 → stays 累 (Taiwan standard)
--
-- APPROACH: Word-level temp table mapping applied to both dictionary_entries.zhuyin_variants
-- and readings.context_words within a single transaction. Idempotent — only updates rows
-- containing matching simplified words. Safe to re-run.
--
-- MANDATORY PRE-MIGRATION: Run backup query first (see below)
-- DEPLOYMENT: Run this entire file in Supabase SQL Editor (includes BEGIN/COMMIT)

-- ============================================
-- PRE-MIGRATION BACKUP (run this FIRST, separately)
-- ============================================
-- CREATE TABLE _backup_simplified_context_words_20260216 AS
-- SELECT de.id, de.trad, de.simp, de.zhuyin_variants
-- FROM dictionary_entries de
-- WHERE de.zhuyin_variants IS NOT NULL;
--
-- CREATE TABLE _backup_readings_context_words_20260216 AS
-- SELECT r.id, r.entry_id, r.context_words
-- FROM readings r
-- WHERE r.context_words IS NOT NULL
--   AND array_length(r.context_words, 1) > 0;

BEGIN;

-- ============================================
-- Shared word-level mapping (used by both steps)
-- ============================================
-- Using temp table instead of CTE so both UPDATE statements share the same
-- mapping source. PRIMARY KEY on simp enforces uniqueness (prevents duplicate-key
-- bugs that would crash scalar subqueries).
CREATE TEMP TABLE word_mappings(simp TEXT PRIMARY KEY, trad TEXT NOT NULL) ON COMMIT DROP;

INSERT INTO word_mappings(simp, trad) VALUES
  -- === Characters with 与/與 ===
  ('与人', '與人'),
  ('与会', '與會'),
  ('与其', '與其'),
  ('与日', '與日'),
  ('与闻', '與聞'),

  -- === Characters with 为/為 and 么/麼 ===
  ('为了', '為了'),
  ('为什么', '為什麼'),
  ('为何', '為何'),
  ('什么', '什麼'),
  ('什锦', '什錦'),
  ('怎么', '怎麼'),

  -- === Characters with 当/當 ===
  ('上当', '上當'),
  ('当今', '當今'),
  ('当作', '當作'),
  ('当场', '當場'),
  ('当年', '當年'),
  ('当当', '當當'),
  ('当日', '當日'),
  ('当时', '當時'),
  ('当真', '當真'),
  ('当铺', '當鋪'),
  ('當铺', '當鋪'),
  ('的当', '的當'),

  -- === Characters with 两/兩, 场/場 ===
  ('一人当两人用', '一人當兩人用'),
  ('一场雨', '一場雨'),
  ('两和', '兩和'),
  ('场地', '場地'),
  ('市场', '市場'),
  ('广场', '廣場'),

  -- === Characters with 严/嚴 ===
  ('严重', '嚴重'),

  -- === Characters with 乐/樂 ===
  ('乐亭', '樂亭'),
  ('乐器', '樂器'),
  ('乐意', '樂意'),
  ('快乐', '快樂'),
  ('欢乐', '歡樂'),
  ('音乐', '音樂'),

  -- === Characters with 习/習 ===
  ('习作', '習作'),
  ('熟习', '熟習'),

  -- === Characters with 亲/親 ===
  ('亲切', '親切'),

  -- === Characters with 员/員 ===
  ('人员', '人員'),
  ('伍员', '伍員'),
  ('员峤', '員嶠'),
  ('员工', '員工'),

  -- === Characters with 尽/盡 ===
  ('人尽其才', '人盡其才'),
  ('先尽', '先盡'),
  ('尽人皆知', '盡人皆知'),
  ('尽前边', '盡前邊'),
  ('尽力', '盡力'),
  ('尽可能', '盡可能'),
  ('尽心', '盡心'),
  ('尽早', '盡早'),
  ('尽着三天办事', '盡著三天辦事'),
  ('尽职尽责', '盡職盡責'),

  -- === Characters with 兴/興 ===
  ('兴修', '興修'),
  ('兴办', '興辦'),
  ('兴盛', '興盛'),
  ('兴致', '興致'),
  ('兴许', '興許'),
  ('兴起', '興起'),
  ('兴趣', '興趣'),
  ('助兴', '助興'),
  ('豪兴', '豪興'),
  ('败兴', '敗興'),
  ('高兴地', '高興地'),

  -- === Characters with 关/關 ===
  ('关系', '關係'),
  ('没关系', '沒關係'),

  -- === Characters with 几/幾 ===
  ('几个', '幾個'),
  ('几乎', '幾乎'),
  ('几天', '幾天'),
  ('好几', '好幾'),
  ('茶几', '茶幾'),

  -- === Characters with 单/單 ===
  ('单一', '單一'),
  ('单于', '單于'),
  ('单县', '單縣'),
  ('单姓', '單姓'),
  ('单独', '單獨'),
  ('姓单', '姓單'),

  -- === Characters with 会/會 ===
  ('会合', '會合'),
  ('会员', '會員'),
  ('会计', '會計'),
  ('都会', '都會'),
  ('财会', '財會'),

  -- === Characters with 传/傳 ===
  ('传统', '傳統'),
  ('传记', '傳記'),
  ('传说', '傳說'),
  ('流传', '流傳'),
  ('自传', '自傳'),

  -- === Characters with 体/體 ===
  ('体重', '體重'),
  ('心广体胖', '心廣體胖'),
  ('量体温', '量體溫'),

  -- === Characters with 处/處 ===
  ('住处', '住處'),
  ('到处', '到處'),
  ('办事处', '辦事處'),
  ('好处', '好處'),
  ('妙处', '妙處'),
  ('处于', '處於'),
  ('处在', '處在'),
  ('处境', '處境'),
  ('处所', '處所'),
  ('处方', '處方'),
  ('处理', '處理'),
  ('处罚', '處罰'),
  ('处置', '處置'),
  ('处长', '處長'),
  ('相处', '相處'),

  -- === Characters with 时/時 ===
  ('何时', '何時'),

  -- === Characters with 将/將 ===
  ('大将', '大將'),
  ('将军', '將軍'),
  ('将来', '將來'),
  ('将要', '將要'),

  -- === Characters with 应/應 ===
  ('应和', '應和'),
  ('应当', '應當'),
  ('应用', '應用'),
  ('应该', '應該'),
  ('答应', '答應'),
  ('供应', '供應'),
  ('反应', '反應'),

  -- === Characters with 强/強 ===
  ('差强人意', '差強人意'),
  ('强识', '強識'),
  ('强调', '強調'),

  -- === Characters with 归/歸 ===
  ('归还', '歸還'),

  -- === Characters with 弹/彈 ===
  ('弹吉他', '彈吉他'),
  ('弹琴', '彈琴'),
  ('子弹', '子彈'),
  ('导弹', '導彈'),
  ('炸弹', '炸彈'),

  -- === Characters with 担/擔 ===
  ('担任', '擔任'),
  ('担心', '擔心'),
  ('扁担', '扁擔'),
  ('负担', '負擔'),
  ('重担', '重擔'),

  -- === Characters with 发/發 (emit meaning) ===
  ('发掘', '發掘'),
  ('发窘', '發窘'),
  ('发端', '發端'),
  ('发表', '發表'),
  ('打发', '打發'),

  -- === Characters with 发/髮 (hair meaning) ===
  ('发型', '髮型'),
  ('令人发指', '令人髮指'),
  ('理发', '理髮'),
  ('结发', '結髮'),

  -- === Characters with 听/聽 ===
  ('听差', '聽差'),
  ('听着', '聽著'),

  -- === Characters with 吗/嗎 ===
  ('吗啡', '嗎啡'),
  ('好吗', '好嗎'),
  ('是吗', '是嗎'),
  ('干吗', '幹嗎'),

  -- === Characters with 叶/葉 ===
  ('叶公', '葉公'),
  ('叶落', '葉落'),
  ('叶韵', '葉韻'),

  -- === Characters with 说/說, 话/話, 辞/辭 ===
  ('说客', '說客'),
  ('说话', '說話'),
  ('说辞', '說辭'),
  ('說辞', '說辭'),
  ('游说', '遊說'),

  -- === Characters with 调/調 ===
  ('声调', '聲調'),
  ('曲调', '曲調'),
  ('调整', '調整'),
  ('调查', '調查'),
  ('调节', '調節'),

  -- === Characters with 认/認, 识/識, 计/計, 规/規 ===
  ('认为', '認為'),
  ('识别', '識別'),
  ('识字', '識字'),
  ('标识', '標識'),
  ('计划', '計劃'),
  ('规划', '規劃'),

  -- === Characters with 觉/覺 ===
  ('觉得', '覺得'),
  ('午觉', '午覺'),
  ('睡觉', '睡覺'),
  ('自觉', '自覺'),
  ('感觉', '感覺'),

  -- === Characters with 给/給 ===
  ('供给', '供給'),
  ('教给', '教給'),
  ('送给', '送給'),
  ('给与', '給與'),
  ('给予', '給予'),
  ('给他', '給他'),
  ('给你', '給你'),

  -- === Characters with 经/經, 结/結, 纪/紀, 绿/綠 ===
  ('经过', '經過'),
  ('结婚', '結婚'),
  ('结束', '結束'),
  ('结果', '結果'),
  ('结果实', '結果實'),
  ('纪律', '紀律'),
  ('纪念', '紀念'),
  ('绿地', '綠地'),
  ('绿林', '綠林'),
  ('绿菌', '綠菌'),

  -- === Characters with 数/數 ===
  ('数一数', '數一數'),
  ('数不清', '數不清'),
  ('数字', '數字'),
  ('数学', '數學'),
  ('数数', '數數'),
  ('数目', '數目'),
  ('数落', '數落'),
  ('数见不鲜', '數見不鮮'),
  ('数量', '數量'),
  ('分数', '分數'),

  -- === Characters with 脏/臟 (organ) vs 髒 (dirty) ===
  ('内脏', '內臟'),
  ('心脏', '心臟'),
  ('脏腑', '臟腑'),
  ('肮脏', '骯髒'),
  ('肮髒', '骯髒'),

  -- === Characters with 节/節, 俭/儉 ===
  ('节俭', '節儉'),
  ('节制', '節制'),
  ('节操', '節操'),
  ('节省', '節省'),
  ('节骨眼儿', '節骨眼兒'),
  ('節俭', '節儉'),

  -- === Characters with 车/車, 转/轉 ===
  ('车辆', '車輛'),
  ('车马', '車馬'),
  ('转动', '轉動'),
  ('转圜', '轉圜'),
  ('转悠', '轉悠'),
  ('转折', '轉折'),
  ('转身', '轉身'),
  ('转运', '轉運'),
  ('转速', '轉速'),

  -- === Characters with 还/還 ===
  ('还好', '還好'),
  ('还是', '還是'),
  ('还有', '還有'),
  ('还钱', '還錢'),
  ('偿还', '償還'),

  -- === Characters with 过/過, 这/這 ===
  ('通过', '通過'),
  ('这种', '這種'),

  -- === Characters with 选/選, 连/連 ===
  ('中选', '中選'),
  ('连篇累牍', '連篇累牘'),

  -- === Characters with 钥/鑰, 铜/銅, 银/銀, 锁/鎖, 钱/錢 ===
  ('钥匙', '鑰匙'),
  ('铜器作', '銅器作'),
  ('银行', '銀行'),
  ('锁钥', '鎖鑰'),
  ('省钱', '省錢'),
  ('一角钱', '一角錢'),

  -- === Characters with 风/風, 领/領, 颜/顏 ===
  ('高风亮节', '高風亮節'),
  ('领空', '領空'),
  ('落色，颜色', '落色，顏色'),

  -- === Characters with 脚/腳 ===
  ('根脚', '根腳'),
  ('脚儿', '腳兒'),
  ('脚本', '腳本'),

  -- === Characters with 种/種 ===
  ('种树', '種樹'),
  ('种植', '種植'),
  ('种类', '種類'),
  ('播种', '播種'),
  ('各种', '各種'),

  -- === Characters with 确/確, 硕/碩 ===
  ('正确', '正確'),
  ('的确', '的確'),
  ('硕士', '碩士'),
  ('硕大', '碩大'),
  ('硕果', '碩果'),

  -- === Characters with 没/沒 ===
  ('沉没', '沉沒'),
  ('没事', '沒事'),
  ('没有', '沒有'),
  ('埋没', '埋沒'),
  ('淹没', '淹沒'),

  -- === Characters with 浑/渾, 测/測, 海参/海參 ===
  ('浑身解数', '渾身解數'),
  ('浑身解數', '渾身解數'),
  ('测量', '測量'),
  ('海参', '海參'),

  -- === Characters with 谙/諳 ===
  ('熟谙', '熟諳'),

  -- === Characters with 庄/莊, 广/廣 ===
  ('庄稼熟了', '莊稼熟了'),
  ('广庵', '廣庵'),

  -- === Characters with 饭/飯, 靓/靚 ===
  ('饭熟了', '飯熟了'),
  ('靓仔', '靚仔'),

  -- === Characters with 华/華 ===
  ('华仔', '華仔'),

  -- === Characters with 参/參 ===
  ('参与', '參與'),
  ('参加', '參加'),
  ('参商', '參商'),
  ('参差', '參差'),

  -- === Characters with 奖/獎 ===
  ('中奖', '中獎'),

  -- === Remaining conversions ===
  ('丢三落四', '丟三落四'),
  ('中国', '中國'),
  ('作为', '作為'),
  ('成为', '成為'),
  ('切实', '切實'),
  ('切开', '切開'),
  ('切断', '切斷'),
  ('划分', '劃分'),
  ('划算', '劃算'),
  ('区分', '區分'),
  ('差别', '差別'),
  ('差点儿', '差點兒'),
  ('差错', '差錯'),
  ('教书', '教書'),
  ('教会', '教會'),
  ('教学', '教學'),
  ('更换', '更換'),
  ('扫地', '掃地'),
  ('扫帚', '掃帚'),
  ('扫描', '掃描'),
  ('打扫', '打掃'),
  ('折断', '折斷'),
  ('折腾', '折騰'),
  ('拮据', '拮據'),
  ('行业', '行業'),
  ('行为', '行為'),
  ('解不开', '解不開'),
  ('解决', '解決'),
  ('解县', '解縣'),
  ('解释', '解釋'),
  ('质量', '質量'),
  ('答复', '答復'),
  ('答讪', '答訕'),
  ('空气', '空氣'),
  ('空闲', '空閒'),
  ('空额', '空額'),
  ('色泽', '色澤'),
  ('重复', '重複'),
  ('重来', '重來'),
  ('系统', '系統'),
  ('系鞋带', '繫鞋帶'),
  ('鸭绿江', '鴨綠江'),
  ('和药', '和藥'),
  ('和诗', '和詩'),
  ('仔细', '仔細'),
  ('仔鸡', '仔雞'),
  ('仔猪', '仔豬'),
  ('仔兽', '仔獸'),
  ('的证', '的證'),
  ('咱们', '咱們'),
  ('哪个', '哪個'),
  ('哪里', '哪裡'),
  ('因为', '因為'),

  -- === Added from sub-agent verification (batches 2-5) ===
  ('和谐', '和諧'),
  ('和面', '和麵'),
  ('便于', '便於'),
  ('哪儿', '哪兒'),
  ('劳累', '勞累'),
  ('搀和', '攙和'),
  ('搅和', '攪和'),
  ('红人', '紅人'),
  ('红色', '紅色'),
  ('差劲', '差勁'),
  ('果实累累', '果實累累'),
  ('累累如丧家之犬', '累累如喪家之犬'),
  ('明了', '明瞭'),

  -- === Characters with 着/著 ===
  ('着凉', '著涼'),
  ('着力', '著力'),
  ('着忙', '著忙'),
  ('着急', '著急'),
  ('着手', '著手'),
  ('着数', '著數'),
  ('着落', '著落'),
  ('着装', '著裝'),
  ('着迷', '著迷'),
  ('着重', '著重'),
  ('着魔', '著魔'),
  ('睡着', '睡著'),

  -- === Fix over-conversion errors in existing data ===
  ('心髒', '心臟'),
  ('隻好', '只好'),
  ('隻是', '只是'),
  ('隻有', '只有'),

  -- === Fix partially converted entries (previous migrations converted some chars but not all) ===
  -- Pattern: previous char-level REPLACE converted SOME characters in the word, leaving hybrids
  ('强調', '強調'),       -- 强 not yet converted (調 was)
  ('强識', '強識'),       -- 强 not yet converted (識 was)
  ('著装', '著裝'),       -- 装 not yet converted (着→著 was done)
  ('葉韵', '葉韻'),       -- 韵 not yet converted (叶→葉 was done)
  ('處罚', '處罰'),       -- 罚 not yet converted (处→處 was done)
  ('沒關系', '沒關係'),   -- 系→係 not done (沒,關 were converted)
  ('關系', '關係'),       -- 系→係 not done (关→關 was done)
  ('連篇累牍', '連篇累牘'), -- 牍 not yet converted (连→連 was done)
  ('得亏', '得虧'),       -- 亏 not converted
  ('累赘', '累贅'),       -- 赘 not converted

  -- === Fix wrong traditional character selection (previous migrations picked wrong variant) ===
  -- Pattern: 发→發 (emit) used where 发→髮 (hair) was correct, etc.
  ('內髒', '內臟'),       -- 髒=dirty, should be 臟=organ
  ('髒腑', '臟腑'),       -- 髒=dirty, should be 臟=organ
  ('重復', '重複'),       -- 復=return, should be 複=repeat
  ('理發', '理髮'),       -- 發=emit, should be 髮=hair
  ('結發', '結髮'),       -- 發=emit, should be 髮=hair
  ('發型', '髮型'),       -- 發=emit, should be 髮=hair
  ('令人發指', '令人髮指'), -- 發=emit, should be 髮=hair (hair standing on end)

  -- === Missed simplified characters (not caught by previous detection) ===
  ('禅那', '禪那'),       -- 禅 is simplified for 禪 (dhyāna/meditation)

  -- === Fix over-conversions from previous migrations ===
  ('單於', '單于'),       -- Chanyu (匈奴) title: historically 單于, not 單於
  ('劃船', '划船')        -- 划(huá)=row a boat, not 劃(huà)=plan/divide
;

-- ============================================
-- STEP 1: Fix dictionary_entries (the source of truth)
-- ============================================
-- Uses WITH ORDINALITY on both outer (zhuyin_variants array) and inner
-- (context_words array) to guarantee element ordering is preserved.
-- The default pronunciation MUST remain as the first element in zhuyin_variants.

UPDATE dictionary_entries de
SET zhuyin_variants = (
  SELECT jsonb_agg(
    CASE
      WHEN v.value->'context_words' IS NOT NULL THEN
        jsonb_set(v.value, '{context_words}', (
          SELECT COALESCE(jsonb_agg(
            COALESCE(wm.trad, t.cw_text)
            ORDER BY t.ord
          ), '[]'::jsonb)
          FROM jsonb_array_elements_text(v.value->'context_words') WITH ORDINALITY AS t(cw_text, ord)
          LEFT JOIN word_mappings wm ON wm.simp = t.cw_text
        ))
      ELSE v.value
    END
    ORDER BY v.idx
  )
  FROM jsonb_array_elements(de.zhuyin_variants) WITH ORDINALITY AS v(value, idx)
)
WHERE de.zhuyin_variants IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(de.zhuyin_variants) AS v2,
         jsonb_array_elements_text(v2->'context_words') AS cw2
    WHERE cw2 IN (SELECT wm2.simp FROM word_mappings wm2)
  );


-- ============================================
-- STEP 2: Fix readings (user's copies)
-- ============================================
-- Uses WITH ORDINALITY to preserve context_words array order.
-- Shares the same word_mappings temp table as Step 1 (single source of truth).

UPDATE readings r
SET context_words = (
  SELECT ARRAY(
    SELECT COALESCE(wm.trad, w.val)
    FROM unnest(r.context_words) WITH ORDINALITY AS w(val, idx)
    LEFT JOIN word_mappings wm ON wm.simp = w.val
    ORDER BY w.idx
  )
)
WHERE r.context_words IS NOT NULL
  AND array_length(r.context_words, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(r.context_words) AS w2
    WHERE w2 IN (SELECT wm2.simp FROM word_mappings wm2)
  );

COMMIT;


-- ============================================
-- POST-MIGRATION VERIFICATION (run after migration)
-- ============================================

-- V1: Known suspects should return 0 rows
-- SELECT 'dictionary_entries' AS source, de.trad, cw
-- FROM dictionary_entries de,
--      jsonb_array_elements(de.zhuyin_variants) AS v,
--      jsonb_array_elements_text(v->'context_words') AS cw
-- WHERE cw IN (
--   -- Fully simplified forms
--   '差劲', '当铺', '庄稼熟了', '饭熟了', '熟谙', '熟习',
--   '仔猪', '仔兽', '华仔', '和谐', '和诗', '肮髒',
--   '说客', '游说', '说话', '说辞',
--   '仔细', '仔密', '仔鸡',
--   '的当', '的确', '的证', '上当',
--   -- Partially converted forms
--   '强調', '强識', '著装', '葉韵', '處罚',
--   '沒關系', '關系', '連篇累牍', '得亏', '累赘',
--   -- Wrong traditional forms
--   '內髒', '髒腑', '重復', '理發', '結發', '發型',
--   '令人發指', '禅那'
-- );

-- V2: Spot-check fixed characters
-- SELECT cw, de.trad
-- FROM dictionary_entries de,
--      jsonb_array_elements(de.zhuyin_variants) AS v,
--      jsonb_array_elements_text(v->'context_words') AS cw
-- WHERE de.trad IN ('差', '熟', '仔', '和', '說', '當')
-- ORDER BY de.trad, cw;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- Restore from backups:
-- UPDATE dictionary_entries de
-- SET zhuyin_variants = b.zhuyin_variants
-- FROM _backup_simplified_context_words_20260216 b
-- WHERE de.id = b.id;
--
-- UPDATE readings r
-- SET context_words = b.context_words
-- FROM _backup_readings_context_words_20260216 b
-- WHERE r.id = b.id;
--
-- After 1 week, clean up:
-- DROP TABLE IF EXISTS _backup_simplified_context_words_20260216;
-- DROP TABLE IF EXISTS _backup_readings_context_words_20260216;
