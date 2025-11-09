-- Hanzi Dojo Dictionary Seed Data
-- Version: 002
-- Created: 2025-11-03
-- Description: Import initial 150 characters from dictionary_seed_v1.json
-- NOTE: This script provides the template. Actual data import should use Supabase Dashboard or import tool.

-- =============================================================================
-- DICTIONARY ENTRIES - Sample Characters from User's School Week 1
-- =============================================================================

-- Character: 太 (too, very, extremely)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('太', '太', '[["ㄊ","ㄞ","ˋ"]]'::jsonb, 'tài', ARRAY['too', 'very', 'extremely'], 150);

-- Character: 阳/陽 (sun, solar, positive)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('阳', '陽', '[["ㄧ","ㄤ","ˊ"]]'::jsonb, 'yáng', ARRAY['sun', 'solar', 'positive'], 300);

-- Character: 黑 (black, dark)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('黑', '黑', '[["ㄏ","ㄟ","ˉ"]]'::jsonb, 'hēi', ARRAY['black', 'dark'], 400);

-- Character: 前 (front, before, forward)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('前', '前', '[["ㄑ","ㄧㄢ","ˊ"]]'::jsonb, 'qián', ARRAY['front', 'before', 'forward'], 80);

-- Character: 后/後 (back, after, behind)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('后', '後', '[["ㄏ","ㄡ","ˋ"]]'::jsonb, 'hòu', ARRAY['back', 'after', 'behind'], 120);

-- Character: 着/著 (multi-reading character - requires special handling)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, frequency_rank)
VALUES (
  '着', '著',
  '[["ㄓ","ㄠ","ˊ"]]'::jsonb,
  'zháo',
  '[
    {"zhuyin": [["ㄓ","ㄠ","ˊ"]], "pinyin": "zháo", "context_words": ["着急","睡着"], "meanings": ["to touch", "to feel", "to be affected by"]},
    {"zhuyin": [["ㄓ","ㄨㄛ","ˊ"]], "pinyin": "zhuó", "context_words": ["着手","着力"], "meanings": ["to wear", "to use", "to apply"]},
    {"zhuyin": [["","ㄓㄜ","˙"]], "pinyin": "zhe", "context_words": ["跟着","看着"], "meanings": ["particle indicating continuous state"]}
  ]'::jsonb,
  60
);

-- Character: 光 (light, ray, bright)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('光', '光', '[["ㄍ","ㄨㄤ","ˉ"]]'::jsonb, 'guāng', ARRAY['light', 'ray', 'bright'], 250);

-- Character: 灯/燈 (lamp, light, lantern)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('灯', '燈', '[["ㄉ","ㄥ","ˉ"]]'::jsonb, 'dēng', ARRAY['lamp', 'light', 'lantern'], 600);

-- Character: 亮 (bright, light, shiny)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('亮', '亮', '[["ㄌ","ㄧㄤ","ˋ"]]'::jsonb, 'liàng', ARRAY['bright', 'light', 'shiny'], 500);

-- Character: 见/見 (to see, to meet, to appear)
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank)
VALUES ('见', '見', '[["ㄐ","ㄧㄢ","ˋ"]]'::jsonb, 'jiàn', ARRAY['to see', 'to meet', 'to appear'], 90);

-- =============================================================================
-- NUMBERS 1-10
-- =============================================================================

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank) VALUES
('一', '一', '[["ㄧ","","ˉ"]]'::jsonb, 'yī', ARRAY['one', 'single', 'a'], 1),
('二', '二', '[["ㄦ","","ˋ"]]'::jsonb, 'èr', ARRAY['two'], 2),
('三', '三', '[["ㄙ","ㄢ","ˉ"]]'::jsonb, 'sān', ARRAY['three'], 3),
('四', '四', '[["ㄙ","","ˋ"]]'::jsonb, 'sì', ARRAY['four'], 4),
('五', '五', '[["ㄨ","","ˇ"]]'::jsonb, 'wǔ', ARRAY['five'], 5),
('六', '六', '[["ㄌ","ㄧㄡ","ˋ"]]'::jsonb, 'liù', ARRAY['six'], 6),
('七', '七', '[["ㄑ","ㄧ","ˉ"]]'::jsonb, 'qī', ARRAY['seven'], 7),
('八', '八', '[["ㄅ","ㄚ","ˉ"]]'::jsonb, 'bā', ARRAY['eight'], 8),
('九', '九', '[["ㄐ","ㄧㄡ","ˇ"]]'::jsonb, 'jiǔ', ARRAY['nine'], 9),
('十', '十', '[["ㄕ","","ˊ"]]'::jsonb, 'shí', ARRAY['ten'], 10);

-- =============================================================================
-- COMMON CHARACTERS (HSK 1-2)
-- =============================================================================

-- Note: For brevity, showing key examples. Full 150-character dataset should be imported via JSON import tool.

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank) VALUES
('人', '人', '[["ㄖ","ㄣ","ˊ"]]'::jsonb, 'rén', ARRAY['person', 'people', 'human'], 11),
('大', '大', '[["ㄉ","ㄚ","ˋ"]]'::jsonb, 'dà', ARRAY['big', 'large', 'great'], 12),
('小', '小', '[["ㄒ","ㄧㄠ","ˇ"]]'::jsonb, 'xiǎo', ARRAY['small', 'little', 'young'], 13),
('上', '上', '[["ㄕ","ㄤ","ˋ"]]'::jsonb, 'shàng', ARRAY['up', 'above', 'on'], 14),
('下', '下', '[["ㄒ","ㄧㄚ","ˋ"]]'::jsonb, 'xià', ARRAY['down', 'below', 'under'], 15),
('我', '我', '[["ㄨ","ㄛ","ˇ"]]'::jsonb, 'wǒ', ARRAY['I', 'me'], 21),
('你', '你', '[["ㄋ","ㄧ","ˇ"]]'::jsonb, 'nǐ', ARRAY['you'], 22),
('他', '他', '[["ㄊ","ㄚ","ˉ"]]'::jsonb, 'tā', ARRAY['he', 'him'], 23),
('她', '她', '[["ㄊ","ㄚ","ˉ"]]'::jsonb, 'tā', ARRAY['she', 'her'], 24);

-- Family members
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank) VALUES
('爸', '爸', '[["ㄅ","ㄚ","ˋ"]]'::jsonb, 'bà', ARRAY['dad', 'father'], 48),
('妈', '媽', '[["ㄇ","ㄚ","ˉ"]]'::jsonb, 'mā', ARRAY['mom', 'mother'], 49),
('哥', '哥', '[["ㄍ","ㄜ","ˉ"]]'::jsonb, 'gē', ARRAY['older brother'], 50),
('姐', '姐', '[["ㄐ","ㄧㄝ","ˇ"]]'::jsonb, 'jiě', ARRAY['older sister'], 51);

-- Common verbs
INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, meanings, frequency_rank) VALUES
('是', '是', '[["ㄕ","","ˋ"]]'::jsonb, 'shì', ARRAY['to be', 'yes'], 19),
('有', '有', '[["ㄧ","ㄡ","ˇ"]]'::jsonb, 'yǒu', ARRAY['to have', 'to exist'], 29),
('来', '來', '[["ㄌ","ㄞ","ˊ"]]'::jsonb, 'lái', ARRAY['to come', 'to arrive'], 33),
('去', '去', '[["ㄑ","ㄩ","ˋ"]]'::jsonb, 'qù', ARRAY['to go', 'to leave'], 34),
('看', '看', '[["ㄎ","ㄢ","ˋ"]]'::jsonb, 'kàn', ARRAY['to see', 'to look', 'to watch'], 35);

-- =============================================================================
-- DICTIONARY CONFUSIONS - Sample Entries
-- =============================================================================

-- For 着/著 Zhuyin drill - tone variations
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'zhuyin', '{"tone_variants": [[["ㄓ","ㄠ","ˉ"]], [["ㄓ","ㄠ","ˇ"]], [["ㄓ","ㄠ","ˋ"]]]}'::jsonb
FROM dictionary_entries WHERE simp = '着';

-- For 阳/陽 Traditional drill - visual confusions
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'trad', '{"visual": ["陰", "暘"], "phonetic": ["楊", "洋"]}'::jsonb
FROM dictionary_entries WHERE simp = '阳';

-- For 见/見 Traditional drill
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'trad', '{"visual": ["現", "覺", "規"], "phonetic": ["建", "件"]}'::jsonb
FROM dictionary_entries WHERE simp = '见';

-- For 灯/燈 Traditional drill
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'trad', '{"visual": ["登"], "phonetic": ["等"]}'::jsonb
FROM dictionary_entries WHERE simp = '灯';

-- For 妈/媽 Zhuyin drill - tone variations + phonetic
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'zhuyin', '{"tone_variants": [[["ㄇ","ㄚ","ˊ"]], [["ㄇ","ㄚ","ˇ"]], [["ㄇ","ㄚ","ˋ"]]]}'::jsonb
FROM dictionary_entries WHERE simp = '妈';

-- For 妈/媽 Traditional drill
INSERT INTO dictionary_confusions (entry_id, drill, confusions)
SELECT id, 'trad', '{"phonetic": ["馬", "嗎"]}'::jsonb
FROM dictionary_entries WHERE simp = '妈';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check total count
-- SELECT COUNT(*) as total_characters FROM dictionary_entries;

-- Check multi-reading characters
-- SELECT simp, trad, pinyin, zhuyin_variants 
-- FROM dictionary_entries 
-- WHERE zhuyin_variants IS NOT NULL;

-- Check characters with identical Simplified/Traditional (should only have Zhuyin drill)
-- SELECT simp, trad FROM dictionary_entries WHERE simp = trad;

-- Check confusion mappings
-- SELECT de.simp, de.trad, dc.drill, dc.confusions
-- FROM dictionary_entries de
-- JOIN dictionary_confusions dc ON de.id = dc.entry_id
-- LIMIT 10;

-- =============================================================================
-- NOTES FOR PRODUCTION IMPORT
-- =============================================================================

/*
For production deployment, recommend using one of these approaches:

1. Supabase Dashboard Import:
   - Export dictionary_seed_v1.json to CSV
   - Use Supabase Dashboard → Table Editor → Import CSV
   - Manually map JSON columns (zhuyin, zhuyin_variants, meanings)

2. Node.js Script:
   ```js
   const { createClient } = require('@supabase/supabase-js');
   const seed = require('./data/dictionary_seed_v1.json');
   
   const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
   
   for (const entry of seed.entries) {
     const { simp, trad, zhuyin, zhuyin_variants, pinyin, meanings, frequency_rank } = entry;
     await supabase.from('dictionary_entries').insert({
       simp, trad, 
       zhuyin: zhuyin || null,
       zhuyin_variants: zhuyin_variants || null,
       pinyin, meanings, frequency_rank
     });
   }
   ```

3. Python Script:
   ```python
   from supabase import create_client
   import json
   
   supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
   
   with open('data/dictionary_seed_v1.json') as f:
     seed = json.load(f)
   
   for entry in seed['entries']:
     supabase.table('dictionary_entries').insert(entry).execute()
   ```

This migration provides sample data for testing the schema.
For full 150-character import, use one of the programmatic approaches above.
*/
