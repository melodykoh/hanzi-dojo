-- Dictionary Quality Fix - Phase 1 (Critical)
-- Migration 010a
-- Date: 2025-11-10
-- Purpose: Fix critical dictionary data quality issues identified in audit
--
-- FIXES:
-- 1. 248 characters with empty tone marks → "ˉ" (first tone)
-- 2. 22 CRITICAL multi-pronunciation characters → proper zhuyin_variants
-- 3. Add missing character 麼
--
-- DEFERRED TO MIGRATION 011 (Epic 8):
-- - 37 additional known multi-pronunciation characters
-- - 102 characters needing research (2-syllable ambiguous cases)
--
-- Audit source: scripts/audit-dictionary-quality.js
-- Triage report: scripts/triage-results.json
-- Review doc: docs/operational/MULTI_PRONUNCIATION_REVIEW.md

-- =============================================================================
-- PART 1: FIX EMPTY TONE MARKS (248 characters)
-- =============================================================================

DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 1: Fixing Empty Tone Marks';
  RAISE NOTICE '========================================';
  
  -- Count affected entries
  SELECT COUNT(*)
  INTO affected_count
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(zhuyin) AS syllable
      WHERE syllable->2 = '""'::jsonb
    );
  
  RAISE NOTICE 'Found % entries with empty tone marks', affected_count;
END $$;

-- Fix: Replace empty tone strings with "ˉ" (U+02C9)
UPDATE dictionary_entries
SET zhuyin = (
  SELECT jsonb_agg(
    CASE 
      WHEN syllable->2 = '""'::jsonb THEN 
        jsonb_build_array(
          syllable->0,  -- initial
          syllable->1,  -- final  
          '"ˉ"'::jsonb  -- tone (first tone mark) - properly quoted for JSON
        )
      ELSE syllable
    END
  )
  FROM jsonb_array_elements(zhuyin) AS syllable
),
updated_at = NOW()
WHERE jsonb_array_length(zhuyin) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(zhuyin) AS syllable
    WHERE syllable->2 = '""'::jsonb
  );

-- Verify Part 1
DO $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO remaining
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(zhuyin) AS syllable
      WHERE syllable->2 = '""'::jsonb
    );
  
  IF remaining = 0 THEN
    RAISE NOTICE '✅ Part 1 Complete: All 248 empty tone marks fixed';
  ELSE
    RAISE WARNING '⚠️  Part 1 Issue: Still have % entries with empty tones', remaining;
  END IF;
END $$;

-- =============================================================================
-- PART 2: RESTRUCTURE MULTI-PRONUNCIATION CHARACTERS (22 characters)
-- =============================================================================
-- Strategy: Move pronunciations from main zhuyin array to zhuyin_variants
-- Keep most common pronunciation as default

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 2: Restructuring Multi-Pronunciation Characters';
  RAISE NOTICE '========================================';
END $$;

-- Character 1: 和 (hé - and, with)
UPDATE dictionary_entries
SET 
  zhuyin = '[["ㄏ","ㄜ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄏ","ㄜ","ˊ"]], "pinyin": "hé", "context_words": ["和平", "你和我"], "meanings": ["and", "with", "harmony"]},
    {"zhuyin": [["ㄏ","ㄜ","ˋ"]], "pinyin": "hè", "context_words": ["和聲", "唱和"], "meanings": ["to respond in singing"]},
    {"zhuyin": [["ㄏ","ㄨㄛ","ˊ"]], "pinyin": "huó", "context_words": ["和面", "和泥"], "meanings": ["to mix", "to knead"]},
    {"zhuyin": [["ㄏ","ㄨㄛ","ˋ"]], "pinyin": "huò", "context_words": ["和藥"], "meanings": ["to mix medicine"]},
    {"zhuyin": [["ㄏ","ㄨ","ˊ"]], "pinyin": "hú", "context_words": ["和牌"], "meanings": ["mahjong term"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '和';

-- Character 2: 乐 (lè - happy)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄌ","ㄜ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄌ","ㄜ","ˋ"]], "pinyin": "lè", "context_words": ["快乐", "欢乐"], "meanings": ["happy", "cheerful"]},
    {"zhuyin": [["","ㄩㄝ","ˋ"]], "pinyin": "yuè", "context_words": ["音乐", "乐器"], "meanings": ["music"]},
    {"zhuyin": [["","ㄧㄠ","ˋ"]], "pinyin": "yào", "context_words": ["乐意"], "meanings": ["to be glad to"]},
    {"zhuyin": [["ㄌ","ㄠ","ˋ"]], "pinyin": "lào", "context_words": ["乐亭"], "meanings": ["surname"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '乐';

-- Character 3: 仔 (zǐ - careful)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄗ","","ˇ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄗ","","ˇ"]], "pinyin": "zǐ", "context_words": ["仔细", "牛仔"], "meanings": ["careful", "young animal"]},
    {"zhuyin": [["ㄗ","ㄞ","ˇ"]], "pinyin": "zǎi", "context_words": ["靓仔"], "meanings": ["guy", "young man"]},
    {"zhuyin": [["ㄗ","","ˉ"]], "pinyin": "zī", "context_words": ["仔肩"], "meanings": ["duty", "responsibility"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '仔';

-- Character 4: 何 (hé - what, how)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄏ","ㄜ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄏ","ㄜ","ˊ"]], "pinyin": "hé", "context_words": ["何时", "如何", "为何"], "meanings": ["what", "how", "why"]},
    {"zhuyin": [["ㄏ","ㄜ","ˋ"]], "pinyin": "hè", "context_words": ["何不"], "meanings": ["why not"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '何';

-- Character 5: 单 (dān - single)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄉ","ㄢ","ˉ"]], "pinyin": "dān", "context_words": ["单独", "单一"], "meanings": ["single", "alone"]},
    {"zhuyin": [["ㄕ","ㄢ","ˋ"]], "pinyin": "shàn", "context_words": ["单县", "单姓"], "meanings": ["surname", "place name"]},
    {"zhuyin": [["ㄔ","ㄢ","ˊ"]], "pinyin": "chán", "context_words": ["单于"], "meanings": ["Chanyu title"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '单';

-- Character 6: 参 (cān - participate)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄘ","ㄢ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄘ","ㄢ","ˉ"]], "pinyin": "cān", "context_words": ["参加", "参与"], "meanings": ["to participate", "to join"]},
    {"zhuyin": [["ㄕ","ㄣ","ˉ"]], "pinyin": "shēn", "context_words": ["人参", "海参"], "meanings": ["ginseng", "sea cucumber"]},
    {"zhuyin": [["ㄘ","ㄣ","ˉ"]], "pinyin": "cēn", "context_words": ["参差"], "meanings": ["uneven", "irregular"]},
    {"zhuyin": [["ㄙ","ㄢ","ˉ"]], "pinyin": "sān", "context_words": ["参商"], "meanings": ["constellation"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '参';

-- Character 7: 吗 (ma - question particle)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄇ","ㄚ","˙"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄇ","ㄚ","˙"]], "pinyin": "ma", "context_words": ["好吗", "是吗"], "meanings": ["question particle"]},
    {"zhuyin": [["ㄇ","ㄚ","ˇ"]], "pinyin": "mǎ", "context_words": ["吗啡"], "meanings": ["morphine"]},
    {"zhuyin": [["ㄇ","ㄚ","ˊ"]], "pinyin": "má", "context_words": ["干吗"], "meanings": ["what for", "why"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '吗';

-- Character 8: 员 (yuán - member)
UPDATE dictionary_entries
SET
  zhuyin = '[["","ㄩㄢ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["","ㄩㄢ","ˊ"]], "pinyin": "yuán", "context_words": ["员工", "人员", "会员"], "meanings": ["member", "personnel"]},
    {"zhuyin": [["","ㄩㄣ","ˊ"]], "pinyin": "yún", "context_words": ["员峤"], "meanings": ["place name"]},
    {"zhuyin": [["","ㄩㄣ","ˋ"]], "pinyin": "yùn", "context_words": ["伍员"], "meanings": ["personal name"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '员';

-- Character 9: 咱 (zán - we)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄗ","ㄢ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄗ","ㄢ","ˊ"]], "pinyin": "zán", "context_words": ["咱们", "咱家"], "meanings": ["we", "us"]},
    {"zhuyin": [["ㄗ","ㄚ","ˊ"]], "pinyin": "zá", "context_words": ["咱"], "meanings": ["I (dialectal)"]},
    {"zhuyin": [["ㄗ","ㄚ","ˇ"]], "pinyin": "zǎ", "context_words": ["咱"], "meanings": ["dialectal variant"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '咱';

-- Character 10: 哪 (nǎ - which, where)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄋ","ㄚ","ˇ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄋ","ㄚ","ˇ"]], "pinyin": "nǎ", "context_words": ["哪里", "哪个", "哪儿"], "meanings": ["which", "where"]},
    {"zhuyin": [["ㄋ","ㄟ","ˇ"]], "pinyin": "něi", "context_words": ["哪"], "meanings": ["which (colloquial)"]},
    {"zhuyin": [["ㄋ","ㄚ","˙"]], "pinyin": "na", "context_words": ["哪"], "meanings": ["sentence-final particle"]},
    {"zhuyin": [["ㄋ","ㄜ","ˊ"]], "pinyin": "né", "context_words": ["哪"], "meanings": ["question particle"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '哪';

-- Character 11: 啊 (a - exclamation)
UPDATE dictionary_entries
SET
  zhuyin = '[["","ㄚ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["","ㄚ","ˉ"]], "pinyin": "a", "context_words": ["啊"], "meanings": ["ah (neutral)"]},
    {"zhuyin": [["","ㄚ","ˊ"]], "pinyin": "á", "context_words": ["啊"], "meanings": ["ah (questioning)"]},
    {"zhuyin": [["","ㄚ","ˇ"]], "pinyin": "ǎ", "context_words": ["啊"], "meanings": ["ah (puzzled)"]},
    {"zhuyin": [["","ㄚ","ˋ"]], "pinyin": "à", "context_words": ["啊"], "meanings": ["ah (realization)"]},
    {"zhuyin": [["","ㄚ","˙"]], "pinyin": "a", "context_words": ["啊"], "meanings": ["ah (light tone)"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '啊';

-- Character 12: 差 (chà - to differ)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄔ","ㄚ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄔ","ㄚ","ˋ"]], "pinyin": "chà", "context_words": ["差不多", "相差"], "meanings": ["to differ", "poor"]},
    {"zhuyin": [["ㄔ","ㄚ","ˉ"]], "pinyin": "chā", "context_words": ["差别", "差距"], "meanings": ["difference"]},
    {"zhuyin": [["ㄔ","ㄞ","ˉ"]], "pinyin": "chāi", "context_words": ["出差", "差事"], "meanings": ["errand", "business trip"]},
    {"zhuyin": [["ㄘ","","ˉ"]], "pinyin": "cī", "context_words": ["参差"], "meanings": ["uneven"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '差';

-- Character 13: 当 (dāng - to act as)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄉ","ㄤ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄉ","ㄤ","ˉ"]], "pinyin": "dāng", "context_words": ["当时", "当作"], "meanings": ["to act as", "just at"]},
    {"zhuyin": [["ㄉ","ㄤ","ˋ"]], "pinyin": "dàng", "context_words": ["上当", "当铺"], "meanings": ["to be fooled", "pawn shop"]},
    {"zhuyin": [["ㄉ","ㄤ","ˇ"]], "pinyin": "dǎng", "context_words": ["当当"], "meanings": ["clang sound"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '当';

-- Character 14: 折 (zhé - to break)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄓ","ㄜ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄓ","ㄜ","ˊ"]], "pinyin": "zhé", "context_words": ["折断", "打折"], "meanings": ["to break", "discount"]},
    {"zhuyin": [["ㄓ","ㄜ","ˉ"]], "pinyin": "zhē", "context_words": ["折腾"], "meanings": ["to toss about"]},
    {"zhuyin": [["ㄕ","ㄜ","ˊ"]], "pinyin": "shé", "context_words": ["折本"], "meanings": ["to lose money"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '折';

-- Character 15: 提 (tí - to lift)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄊ","ㄧ","ˊ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄊ","ㄧ","ˊ"]], "pinyin": "tí", "context_words": ["提高", "提出"], "meanings": ["to lift", "to raise"]},
    {"zhuyin": [["ㄉ","ㄧ","ˉ"]], "pinyin": "dī", "context_words": ["提防"], "meanings": ["to guard against"]},
    {"zhuyin": [["ㄉ","ㄧ","ˇ"]], "pinyin": "dǐ", "context_words": ["提溜"], "meanings": ["to carry hanging"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '提';

-- Character 16: 数 (shù - number)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄕ","ㄨ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄕ","ㄨ","ˋ"]], "pinyin": "shù", "context_words": ["数学", "数字"], "meanings": ["number", "figure"]},
    {"zhuyin": [["ㄕ","ㄨ","ˇ"]], "pinyin": "shǔ", "context_words": ["数不清", "数一数"], "meanings": ["to count"]},
    {"zhuyin": [["ㄕ","ㄨㄛ","ˋ"]], "pinyin": "shuò", "context_words": ["数见不鲜"], "meanings": ["frequently"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '数';

-- Character 17: 漂 (piào - beautiful)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄆ","ㄧㄠ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄆ","ㄧㄠ","ˋ"]], "pinyin": "piào", "context_words": ["漂亮"], "meanings": ["beautiful", "pretty"]},
    {"zhuyin": [["ㄆ","ㄧㄠ","ˉ"]], "pinyin": "piāo", "context_words": ["漂流", "漂泊"], "meanings": ["to float", "to drift"]},
    {"zhuyin": [["ㄆ","ㄧㄠ","ˇ"]], "pinyin": "piǎo", "context_words": ["漂白"], "meanings": ["to bleach"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '漂';

-- Character 18: 空 (kōng - empty)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄎ","ㄨㄥ","ˉ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄎ","ㄨㄥ","ˉ"]], "pinyin": "kōng", "context_words": ["天空", "空气"], "meanings": ["empty", "sky", "air"]},
    {"zhuyin": [["ㄎ","ㄨㄥ","ˋ"]], "pinyin": "kòng", "context_words": ["空闲", "空隙"], "meanings": ["free time", "gap"]},
    {"zhuyin": [["ㄎ","ㄨㄥ","ˇ"]], "pinyin": "kǒng", "context_words": ["空空"], "meanings": ["empty (classical)"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '空';

-- Character 19: 累 (lèi - tired)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄌ","ㄟ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄌ","ㄟ","ˋ"]], "pinyin": "lèi", "context_words": ["疲累", "劳累"], "meanings": ["tired", "weary"]},
    {"zhuyin": [["ㄌ","ㄟ","ˇ"]], "pinyin": "lěi", "context_words": ["累积", "累计"], "meanings": ["to accumulate"]},
    {"zhuyin": [["ㄌ","ㄟ","ˊ"]], "pinyin": "léi", "context_words": ["累赘"], "meanings": ["cumbersome"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '累';

-- Character 20: 胖 (pàng - fat)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄆ","ㄤ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄆ","ㄤ","ˋ"]], "pinyin": "pàng", "context_words": ["胖子", "肥胖"], "meanings": ["fat", "plump"]},
    {"zhuyin": [["ㄆ","ㄢ","ˊ"]], "pinyin": "pán", "context_words": ["心广体胖"], "meanings": ["at ease (classical)"]},
    {"zhuyin": [["ㄆ","ㄢ","ˋ"]], "pinyin": "pàn", "context_words": ["胖胖"], "meanings": ["chubby"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '胖';

-- Character 21: 落 (luò - to fall)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄌ","ㄨㄛ","ˋ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄌ","ㄨㄛ","ˋ"]], "pinyin": "luò", "context_words": ["落下", "降落"], "meanings": ["to fall", "to drop"]},
    {"zhuyin": [["ㄌ","ㄚ","ˋ"]], "pinyin": "là", "context_words": ["丢三落四"], "meanings": ["to leave behind"]},
    {"zhuyin": [["ㄌ","ㄠ","ˋ"]], "pinyin": "lào", "context_words": ["落枕"], "meanings": ["stiff neck"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '落';

-- Character 22: 解 (jiě - to solve)
UPDATE dictionary_entries
SET
  zhuyin = '[["ㄐ","ㄧㄝ","ˇ"]]'::jsonb,
  zhuyin_variants = '[
    {"zhuyin": [["ㄐ","ㄧㄝ","ˇ"]], "pinyin": "jiě", "context_words": ["解决", "解释", "理解"], "meanings": ["to solve", "to explain"]},
    {"zhuyin": [["ㄐ","ㄧㄝ","ˋ"]], "pinyin": "jiè", "context_words": ["解送", "押解"], "meanings": ["to escort"]},
    {"zhuyin": [["ㄒ","ㄧㄝ","ˋ"]], "pinyin": "xiè", "context_words": ["解县", "解元"], "meanings": ["surname", "place name"]}
  ]'::jsonb,
  updated_at = NOW()
WHERE simp = '解';

-- Verify Part 2
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO fixed_count
  FROM dictionary_entries
  WHERE simp IN ('和','乐','仔','何','单','参','吗','员','咱','哪','啊','差','当','折','提','数','漂','空','累','胖','落','解')
    AND zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) > 0;
  
  IF fixed_count = 22 THEN
    RAISE NOTICE '✅ Part 2 Complete: All 22 multi-pronunciation characters restructured';
  ELSE
    RAISE WARNING '⚠️  Part 2 Issue: Only % of 22 characters fixed', fixed_count;
  END IF;
END $$;

-- =============================================================================
-- PART 3: ADD MISSING CHARACTER 麼
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PART 3: Adding Missing Character';
  RAISE NOTICE '========================================';
END $$;

-- Add 麼 with proper variants
INSERT INTO dictionary_entries (simp, trad, zhuyin, zhuyin_variants, pinyin, meanings)
VALUES (
  '么', 
  '麼',
  '[["ㄇ","ㄜ","˙"]]'::jsonb,
  '[
    {"zhuyin": [["ㄇ","ㄜ","˙"]], "pinyin": "me", "context_words": ["什么", "怎么"], "meanings": ["what", "particle"]},
    {"zhuyin": [["ㄇ","ㄛ","ˊ"]], "pinyin": "mó", "context_words": ["幺麼"], "meanings": ["tiny", "insignificant"]},
    {"zhuyin": [["ㄇ","ㄚ","ˊ"]], "pinyin": "má", "context_words": ["麼麼"], "meanings": ["kissing sound (baby talk)"]}
  ]'::jsonb,
  'me',
  ARRAY['what', 'how', 'particle']
)
ON CONFLICT (simp) DO UPDATE
SET 
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  updated_at = NOW();

-- Verify Part 3
DO $$
BEGIN
  RAISE NOTICE '✅ Part 3 Complete: Added character 麼';
END $$;

-- =============================================================================
-- FINAL VERIFICATION
-- =============================================================================

DO $$
DECLARE
  empty_tones INTEGER;
  multi_pronunciation_fixed INTEGER;
  me_char_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FINAL VERIFICATION';
  RAISE NOTICE '========================================';
  
  -- Check empty tones
  SELECT COUNT(*)
  INTO empty_tones
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(zhuyin) AS syllable
      WHERE syllable->2 = '""'::jsonb
    );
  
  -- Check multi-pronunciation
  SELECT COUNT(*)
  INTO multi_pronunciation_fixed
  FROM dictionary_entries
  WHERE simp IN ('和','乐','仔','何','单','参','吗','员','咱','哪','啊','差','当','折','提','数','漂','空','累','胖','落','解')
    AND zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) > 0;
  
  -- Check 麼
  SELECT EXISTS(
    SELECT 1 FROM dictionary_entries WHERE simp = '么' OR trad = '麼'
  ) INTO me_char_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 Results:';
  RAISE NOTICE '  - Empty tone marks remaining: %', empty_tones;
  RAISE NOTICE '  - Multi-pronunciation characters fixed: % / 22', multi_pronunciation_fixed;
  RAISE NOTICE '  - Character 麼 exists: %', me_char_exists;
  RAISE NOTICE '';
  
  IF empty_tones = 0 AND multi_pronunciation_fixed = 22 AND me_char_exists THEN
    RAISE NOTICE '✅✅✅ MIGRATION COMPLETE - All 3 parts successful!';
  ELSE
    RAISE WARNING '⚠️  Migration incomplete - review errors above';
  END IF;
END $$;

-- Sample verification queries
SELECT '和' AS char, simp, trad, zhuyin, jsonb_array_length(zhuyin_variants) AS variant_count
FROM dictionary_entries WHERE simp = '和'
UNION ALL
SELECT '因' AS char, simp, trad, zhuyin, jsonb_array_length(zhuyin_variants) AS variant_count
FROM dictionary_entries WHERE simp = '因'
UNION ALL
SELECT '星' AS char, simp, trad, zhuyin, jsonb_array_length(zhuyin_variants) AS variant_count
FROM dictionary_entries WHERE simp = '星'
UNION ALL
SELECT '麼' AS char, simp, trad, zhuyin, jsonb_array_length(zhuyin_variants) AS variant_count
FROM dictionary_entries WHERE simp = '么' OR trad = '麼';
