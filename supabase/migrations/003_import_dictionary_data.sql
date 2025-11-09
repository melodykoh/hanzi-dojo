-- Auto-generated dictionary import SQL
-- Generated from dictionary_seed_v1.json
-- Total entries: 155

-- Temporarily disable RLS for import
ALTER TABLE dictionary_entries DISABLE ROW LEVEL SECURITY;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('太', '太', '[["ㄊ","ㄞ","ˋ"]]'::jsonb, 'tài', NULL::jsonb, ARRAY['too','very','extremely'], 150)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('阳', '陽', '[["ㄧ","ㄤ","ˊ"]]'::jsonb, 'yáng', NULL::jsonb, ARRAY['sun','solar','positive'], 300)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('黑', '黑', '[["ㄏ","ㄟ","ˉ"]]'::jsonb, 'hēi', NULL::jsonb, ARRAY['black','dark'], 400)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('前', '前', '[["ㄑ","ㄧㄢ","ˊ"]]'::jsonb, 'qián', NULL::jsonb, ARRAY['front','before','forward'], 80)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('后', '後', '[["ㄏ","ㄡ","ˋ"]]'::jsonb, 'hòu', NULL::jsonb, ARRAY['back','after','behind'], 120)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('着', '著', '[["ㄓ","ㄠ","ˊ"]]'::jsonb, NULL, '[{"zhuyin":[["ㄓ","ㄠ","ˊ"]],"pinyin":"zháo","context_words":["着急","睡着"],"meanings":["to touch","to feel","to be affected by"]},{"zhuyin":[["ㄓ","ㄨㄛ","ˊ"]],"pinyin":"zhuó","context_words":["着手","着力"],"meanings":["to wear","to use","to apply"]},{"zhuyin":[["","ㄓㄜ","˙"]],"pinyin":"zhe","context_words":["跟着","看着"],"meanings":["particle indicating continuous state"]}]'::jsonb, NULL, 60)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('光', '光', '[["ㄍ","ㄨㄤ","ˉ"]]'::jsonb, 'guāng', NULL::jsonb, ARRAY['light','ray','bright'], 250)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('灯', '燈', '[["ㄉ","ㄥ","ˉ"]]'::jsonb, 'dēng', NULL::jsonb, ARRAY['lamp','light','lantern'], 600)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('亮', '亮', '[["ㄌ","ㄧㄤ","ˋ"]]'::jsonb, 'liàng', NULL::jsonb, ARRAY['bright','light','shiny'], 500)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('见', '見', '[["ㄐ","ㄧㄢ","ˋ"]]'::jsonb, 'jiàn', NULL::jsonb, ARRAY['to see','to meet','to appear'], 90)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('一', '一', '[["ㄧ","","ˉ"]]'::jsonb, 'yī', NULL::jsonb, ARRAY['one','single','a'], 1)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('二', '二', '[["ㄦ","","ˋ"]]'::jsonb, 'èr', NULL::jsonb, ARRAY['two'], 2)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('三', '三', '[["ㄙ","ㄢ","ˉ"]]'::jsonb, 'sān', NULL::jsonb, ARRAY['three'], 3)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('四', '四', '[["ㄙ","","ˋ"]]'::jsonb, 'sì', NULL::jsonb, ARRAY['four'], 4)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('五', '五', '[["ㄨ","","ˇ"]]'::jsonb, 'wǔ', NULL::jsonb, ARRAY['five'], 5)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('六', '六', '[["ㄌ","ㄧㄡ","ˋ"]]'::jsonb, 'liù', NULL::jsonb, ARRAY['six'], 6)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('七', '七', '[["ㄑ","ㄧ","ˉ"]]'::jsonb, 'qī', NULL::jsonb, ARRAY['seven'], 7)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('八', '八', '[["ㄅ","ㄚ","ˉ"]]'::jsonb, 'bā', NULL::jsonb, ARRAY['eight'], 8)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('九', '九', '[["ㄐ","ㄧㄡ","ˇ"]]'::jsonb, 'jiǔ', NULL::jsonb, ARRAY['nine'], 9)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('十', '十', '[["ㄕ","","ˊ"]]'::jsonb, 'shí', NULL::jsonb, ARRAY['ten'], 10)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('人', '人', '[["ㄖ","ㄣ","ˊ"]]'::jsonb, 'rén', NULL::jsonb, ARRAY['person','people','human'], 11)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('大', '大', '[["ㄉ","ㄚ","ˋ"]]'::jsonb, 'dà', NULL::jsonb, ARRAY['big','large','great'], 12)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('小', '小', '[["ㄒ","ㄧㄠ","ˇ"]]'::jsonb, 'xiǎo', NULL::jsonb, ARRAY['small','little','young'], 13)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('上', '上', '[["ㄕ","ㄤ","ˋ"]]'::jsonb, 'shàng', NULL::jsonb, ARRAY['up','above','on'], 14)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('下', '下', '[["ㄒ","ㄧㄚ","ˋ"]]'::jsonb, 'xià', NULL::jsonb, ARRAY['down','below','under'], 15)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('左', '左', '[["ㄗ","ㄨㄛ","ˇ"]]'::jsonb, 'zuǒ', NULL::jsonb, ARRAY['left'], 16)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('右', '右', '[["ㄧ","ㄡ","ˋ"]]'::jsonb, 'yòu', NULL::jsonb, ARRAY['right'], 17)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('中', '中', '[["ㄓ","ㄨㄥ","ˉ"]]'::jsonb, 'zhōng', NULL::jsonb, ARRAY['middle','center','China'], 18)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('是', '是', '[["ㄕ","","ˋ"]]'::jsonb, 'shì', NULL::jsonb, ARRAY['to be','yes'], 19)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('不', '不', '[["ㄅ","ㄨ","ˋ"]]'::jsonb, 'bù', NULL::jsonb, ARRAY['not','no'], 20)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('我', '我', '[["ㄨ","ㄛ","ˇ"]]'::jsonb, 'wǒ', NULL::jsonb, ARRAY['I','me'], 21)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('你', '你', '[["ㄋ","ㄧ","ˇ"]]'::jsonb, 'nǐ', NULL::jsonb, ARRAY['you'], 22)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('他', '他', '[["ㄊ","ㄚ","ˉ"]]'::jsonb, 'tā', NULL::jsonb, ARRAY['he','him'], 23)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('她', '她', '[["ㄊ","ㄚ","ˉ"]]'::jsonb, 'tā', NULL::jsonb, ARRAY['she','her'], 24)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('们', '們', '[["ㄇ","ㄣ","˙"]]'::jsonb, 'men', NULL::jsonb, ARRAY['plural suffix'], 25)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('的', '的', '[["ㄉ","ㄜ","˙"]]'::jsonb, 'de', NULL::jsonb, ARRAY['possessive particle'], 26)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('了', '了', '[["ㄌ","ㄜ","˙"]]'::jsonb, NULL, '[{"zhuyin":[["ㄌ","ㄜ","˙"]],"pinyin":"le","context_words":["好了","走了"],"meanings":["completed action particle"]},{"zhuyin":[["ㄌ","ㄧㄠ","ˇ"]],"pinyin":"liǎo","context_words":["了解","明了"],"meanings":["to finish","to understand"]}]'::jsonb, NULL, 27)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('在', '在', '[["ㄗ","ㄞ","ˋ"]]'::jsonb, 'zài', NULL::jsonb, ARRAY['at','in','to be present'], 28)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('有', '有', '[["ㄧ","ㄡ","ˇ"]]'::jsonb, 'yǒu', NULL::jsonb, ARRAY['to have','to exist'], 29)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('这', '這', '[["ㄓ","ㄜ","ˋ"]]'::jsonb, 'zhè', NULL::jsonb, ARRAY['this'], 30)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('那', '那', '[["ㄋ","ㄚ","ˋ"]]'::jsonb, 'nà', NULL::jsonb, ARRAY['that'], 31)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('个', '個', '[["ㄍ","ㄜ","ˋ"]]'::jsonb, 'gè', NULL::jsonb, ARRAY['measure word','individual'], 32)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('来', '來', '[["ㄌ","ㄞ","ˊ"]]'::jsonb, 'lái', NULL::jsonb, ARRAY['to come','to arrive'], 33)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('去', '去', '[["ㄑ","ㄩ","ˋ"]]'::jsonb, 'qù', NULL::jsonb, ARRAY['to go','to leave'], 34)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('看', '看', '[["ㄎ","ㄢ","ˋ"]]'::jsonb, 'kàn', NULL::jsonb, ARRAY['to see','to look','to watch'], 35)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('说', '說', '[["ㄕ","ㄨㄛ","ˉ"]]'::jsonb, 'shuō', NULL::jsonb, ARRAY['to say','to speak'], 36)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('听', '聽', '[["ㄊ","ㄧㄥ","ˉ"]]'::jsonb, 'tīng', NULL::jsonb, ARRAY['to listen','to hear'], 37)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('读', '讀', '[["ㄉ","ㄨ","ˊ"]]'::jsonb, 'dú', NULL::jsonb, ARRAY['to read'], 38)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('写', '寫', '[["ㄒ","ㄧㄝ","ˇ"]]'::jsonb, 'xiě', NULL::jsonb, ARRAY['to write'], 39)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('做', '做', '[["ㄗ","ㄨㄛ","ˋ"]]'::jsonb, 'zuò', NULL::jsonb, ARRAY['to do','to make'], 40)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('吃', '吃', '[["ㄔ","","ˉ"]]'::jsonb, 'chī', NULL::jsonb, ARRAY['to eat'], 41)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('喝', '喝', '[["ㄏ","ㄜ","ˉ"]]'::jsonb, 'hē', NULL::jsonb, ARRAY['to drink'], 42)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('睡', '睡', '[["ㄕ","ㄨㄟ","ˋ"]]'::jsonb, 'shuì', NULL::jsonb, ARRAY['to sleep'], 43)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('走', '走', '[["ㄗ","ㄡ","ˇ"]]'::jsonb, 'zǒu', NULL::jsonb, ARRAY['to walk','to leave'], 44)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('跑', '跑', '[["ㄆ","ㄠ","ˇ"]]'::jsonb, 'pǎo', NULL::jsonb, ARRAY['to run'], 45)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('坐', '坐', '[["ㄗ","ㄨㄛ","ˋ"]]'::jsonb, 'zuò', NULL::jsonb, ARRAY['to sit'], 46)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('站', '站', '[["ㄓ","ㄢ","ˋ"]]'::jsonb, 'zhàn', NULL::jsonb, ARRAY['to stand','station'], 47)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('爸', '爸', '[["ㄅ","ㄚ","ˋ"]]'::jsonb, 'bà', NULL::jsonb, ARRAY['dad','father'], 48)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('妈', '媽', '[["ㄇ","ㄚ","ˉ"]]'::jsonb, 'mā', NULL::jsonb, ARRAY['mom','mother'], 49)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('哥', '哥', '[["ㄍ","ㄜ","ˉ"]]'::jsonb, 'gē', NULL::jsonb, ARRAY['older brother'], 50)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('姐', '姐', '[["ㄐ","ㄧㄝ","ˇ"]]'::jsonb, 'jiě', NULL::jsonb, ARRAY['older sister'], 51)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('弟', '弟', '[["ㄉ","ㄧ","ˋ"]]'::jsonb, 'dì', NULL::jsonb, ARRAY['younger brother'], 52)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('妹', '妹', '[["ㄇ","ㄟ","ˋ"]]'::jsonb, 'mèi', NULL::jsonb, ARRAY['younger sister'], 53)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('儿', '兒', '[["ㄦ","","ˊ"]]'::jsonb, 'ér', NULL::jsonb, ARRAY['child','son'], 54)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('女', '女', '[["ㄋ","ㄩ","ˇ"]]'::jsonb, 'nǚ', NULL::jsonb, ARRAY['female','daughter'], 55)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('好', '好', '[["ㄏ","ㄠ","ˇ"]]'::jsonb, 'hǎo', NULL::jsonb, ARRAY['good','well','fine'], 56)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('天', '天', '[["ㄊ","ㄧㄢ","ˉ"]]'::jsonb, 'tiān', NULL::jsonb, ARRAY['sky','day','heaven'], 57)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('今', '今', '[["ㄐ","ㄧㄣ","ˉ"]]'::jsonb, 'jīn', NULL::jsonb, ARRAY['today','present','now'], 58)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('明', '明', '[["ㄇ","ㄧㄥ","ˊ"]]'::jsonb, 'míng', NULL::jsonb, ARRAY['bright','clear','tomorrow'], 59)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('年', '年', '[["ㄋ","ㄧㄢ","ˊ"]]'::jsonb, 'nián', NULL::jsonb, ARRAY['year'], 61)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('月', '月', '[["ㄩ","ㄝ","ˋ"]]'::jsonb, 'yuè', NULL::jsonb, ARRAY['moon','month'], 62)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('日', '日', '[["ㄖ","","ˋ"]]'::jsonb, 'rì', NULL::jsonb, ARRAY['sun','day','date'], 63)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('时', '時', '[["ㄕ","","ˊ"]]'::jsonb, 'shí', NULL::jsonb, ARRAY['time','hour'], 64)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('分', '分', '[["ㄈ","ㄣ","ˉ"]]'::jsonb, 'fēn', NULL::jsonb, ARRAY['minute','to divide'], 65)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('早', '早', '[["ㄗ","ㄠ","ˇ"]]'::jsonb, 'zǎo', NULL::jsonb, ARRAY['early','morning'], 66)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('晚', '晚', '[["ㄨ","ㄢ","ˇ"]]'::jsonb, 'wǎn', NULL::jsonb, ARRAY['late','evening'], 67)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('水', '水', '[["ㄕ","ㄨㄟ","ˇ"]]'::jsonb, 'shuǐ', NULL::jsonb, ARRAY['water'], 68)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('火', '火', '[["ㄏ","ㄨㄛ","ˇ"]]'::jsonb, 'huǒ', NULL::jsonb, ARRAY['fire'], 69)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('木', '木', '[["ㄇ","ㄨ","ˋ"]]'::jsonb, 'mù', NULL::jsonb, ARRAY['wood','tree'], 70)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('金', '金', '[["ㄐ","ㄧㄣ","ˉ"]]'::jsonb, 'jīn', NULL::jsonb, ARRAY['gold','metal','money'], 71)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('土', '土', '[["ㄊ","ㄨ","ˇ"]]'::jsonb, 'tǔ', NULL::jsonb, ARRAY['earth','soil'], 72)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('山', '山', '[["ㄕ","ㄢ","ˉ"]]'::jsonb, 'shān', NULL::jsonb, ARRAY['mountain','hill'], 73)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('川', '川', '[["ㄔ","ㄨㄢ","ˉ"]]'::jsonb, 'chuān', NULL::jsonb, ARRAY['river','stream'], 74)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('白', '白', '[["ㄅ","ㄞ","ˊ"]]'::jsonb, 'bái', NULL::jsonb, ARRAY['white','clear'], 75)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('红', '紅', '[["ㄏ","ㄨㄥ","ˊ"]]'::jsonb, 'hóng', NULL::jsonb, ARRAY['red'], 76)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('黄', '黃', '[["ㄏ","ㄨㄤ","ˊ"]]'::jsonb, 'huáng', NULL::jsonb, ARRAY['yellow'], 77)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('蓝', '藍', '[["ㄌ","ㄢ","ˊ"]]'::jsonb, 'lán', NULL::jsonb, ARRAY['blue'], 78)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('绿', '綠', '[["ㄌ","ㄩ","ˋ"]]'::jsonb, 'lǜ', NULL::jsonb, ARRAY['green'], 79)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('多', '多', '[["ㄉ","ㄨㄛ","ˉ"]]'::jsonb, 'duō', NULL::jsonb, ARRAY['many','much','more'], 81)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('少', '少', '[["ㄕ","ㄠ","ˇ"]]'::jsonb, 'shǎo', NULL::jsonb, ARRAY['few','little','less'], 82)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('长', '長', '[["ㄔ","ㄤ","ˊ"]]'::jsonb, 'cháng', NULL::jsonb, ARRAY['long','length'], 83)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('短', '短', '[["ㄉ","ㄨㄢ","ˇ"]]'::jsonb, 'duǎn', NULL::jsonb, ARRAY['short'], 84)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('高', '高', '[["ㄍ","ㄠ","ˉ"]]'::jsonb, 'gāo', NULL::jsonb, ARRAY['tall','high'], 85)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('低', '低', '[["ㄉ","ㄧ","ˉ"]]'::jsonb, 'dī', NULL::jsonb, ARRAY['low'], 86)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('快', '快', '[["ㄎ","ㄨㄞ","ˋ"]]'::jsonb, 'kuài', NULL::jsonb, ARRAY['fast','quick'], 87)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('慢', '慢', '[["ㄇ","ㄢ","ˋ"]]'::jsonb, 'mànˋ', NULL::jsonb, ARRAY['slow'], 88)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('新', '新', '[["ㄒ","ㄧㄣ","ˉ"]]'::jsonb, 'xīn', NULL::jsonb, ARRAY['new'], 89)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('老', '老', '[["ㄌ","ㄠ","ˇ"]]'::jsonb, 'lǎo', NULL::jsonb, ARRAY['old'], 91)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('出', '出', '[["ㄔ","ㄨ","ˉ"]]'::jsonb, 'chū', NULL::jsonb, ARRAY['to exit','to go out'], 92)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('入', '入', '[["ㄖ","ㄨ","ˋ"]]'::jsonb, 'rù', NULL::jsonb, ARRAY['to enter'], 93)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('开', '開', '[["ㄎ","ㄞ","ˉ"]]'::jsonb, 'kāi', NULL::jsonb, ARRAY['to open','to start'], 94)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('关', '關', '[["ㄍ","ㄨㄢ","ˉ"]]'::jsonb, 'guān', NULL::jsonb, ARRAY['to close','to turn off'], 95)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('东', '東', '[["ㄉ","ㄨㄥ","ˉ"]]'::jsonb, 'dōng', NULL::jsonb, ARRAY['east'], 96)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('西', '西', '[["ㄒ","ㄧ","ˉ"]]'::jsonb, 'xī', NULL::jsonb, ARRAY['west'], 97)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('南', '南', '[["ㄋ","ㄢ","ˊ"]]'::jsonb, 'nán', NULL::jsonb, ARRAY['south'], 98)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('北', '北', '[["ㄅ","ㄟ","ˇ"]]'::jsonb, 'běi', NULL::jsonb, ARRAY['north'], 99)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('生', '生', '[["ㄕ","ㄥ","ˉ"]]'::jsonb, 'shēng', NULL::jsonb, ARRAY['to give birth','life','student'], 100)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('学', '學', '[["ㄒ","ㄩㄝ","ˊ"]]'::jsonb, 'xué', NULL::jsonb, ARRAY['to study','to learn','school'], 101)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('书', '書', '[["ㄕ","ㄨ","ˉ"]]'::jsonb, 'shū', NULL::jsonb, ARRAY['book'], 102)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('本', '本', '[["ㄅ","ㄣ","ˇ"]]'::jsonb, 'běn', NULL::jsonb, ARRAY['origin','measure word for books'], 103)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('字', '字', '[["ㄗ","","ˋ"]]'::jsonb, 'zì', NULL::jsonb, ARRAY['character','word'], 104)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('文', '文', '[["ㄨ","ㄣ","ˊ"]]'::jsonb, 'wén', NULL::jsonb, ARRAY['language','culture','writing'], 105)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('手', '手', '[["ㄕ","ㄡ","ˇ"]]'::jsonb, 'shǒu', NULL::jsonb, ARRAY['hand'], 106)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('口', '口', '[["ㄎ","ㄡ","ˇ"]]'::jsonb, 'kǒu', NULL::jsonb, ARRAY['mouth','opening'], 107)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('目', '目', '[["ㄇ","ㄨ","ˋ"]]'::jsonb, 'mù', NULL::jsonb, ARRAY['eye'], 108)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('耳', '耳', '[["ㄦ","","ˇ"]]'::jsonb, 'ěr', NULL::jsonb, ARRAY['ear'], 109)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('头', '頭', '[["ㄊ","ㄡ","ˊ"]]'::jsonb, 'tóu', NULL::jsonb, ARRAY['head'], 110)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('心', '心', '[["ㄒ","ㄧㄣ","ˉ"]]'::jsonb, 'xīn', NULL::jsonb, ARRAY['heart','mind'], 111)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('身', '身', '[["ㄕ","ㄣ","ˉ"]]'::jsonb, 'shēn', NULL::jsonb, ARRAY['body'], 112)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('足', '足', '[["ㄗ","ㄨ","ˊ"]]'::jsonb, 'zú', NULL::jsonb, ARRAY['foot','sufficient'], 113)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('门', '門', '[["ㄇ","ㄣ","ˊ"]]'::jsonb, 'mén', NULL::jsonb, ARRAY['door','gate'], 114)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('家', '家', '[["ㄐ","ㄧㄚ","ˉ"]]'::jsonb, 'jiā', NULL::jsonb, ARRAY['home','family'], 115)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('房', '房', '[["ㄈ","ㄤ","ˊ"]]'::jsonb, 'fáng', NULL::jsonb, ARRAY['house','room'], 116)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('车', '車', '[["ㄔ","ㄜ","ˉ"]]'::jsonb, 'chē', NULL::jsonb, ARRAY['vehicle','car'], 117)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('路', '路', '[["ㄌ","ㄨ","ˋ"]]'::jsonb, 'lù', NULL::jsonb, ARRAY['road','path'], 118)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('店', '店', '[["ㄉ","ㄧㄢ","ˋ"]]'::jsonb, 'diàn', NULL::jsonb, ARRAY['store','shop'], 119)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('饭', '飯', '[["ㄈ","ㄢ","ˋ"]]'::jsonb, 'fàn', NULL::jsonb, ARRAY['cooked rice','meal'], 121)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('菜', '菜', '[["ㄘ","ㄞ","ˋ"]]'::jsonb, 'cài', NULL::jsonb, ARRAY['vegetable','dish'], 122)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('茶', '茶', '[["ㄔ","ㄚ","ˊ"]]'::jsonb, 'chá', NULL::jsonb, ARRAY['tea'], 123)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('牛', '牛', '[["ㄋ","ㄧㄡ","ˊ"]]'::jsonb, 'niú', NULL::jsonb, ARRAY['cow','ox'], 124)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('羊', '羊', '[["ㄧ","ㄤ","ˊ"]]'::jsonb, 'yáng', NULL::jsonb, ARRAY['sheep','goat'], 125)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('鸟', '鳥', '[["ㄋ","ㄧㄠ","ˇ"]]'::jsonb, 'niǎo', NULL::jsonb, ARRAY['bird'], 126)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('鱼', '魚', '[["ㄩ","","ˊ"]]'::jsonb, 'yú', NULL::jsonb, ARRAY['fish'], 127)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('狗', '狗', '[["ㄍ","ㄡ","ˇ"]]'::jsonb, 'gǒu', NULL::jsonb, ARRAY['dog'], 128)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('猫', '貓', '[["ㄇ","ㄠ","ˉ"]]'::jsonb, 'māo', NULL::jsonb, ARRAY['cat'], 129)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('虫', '蟲', '[["ㄔ","ㄨㄥ","ˊ"]]'::jsonb, 'chóng', NULL::jsonb, ARRAY['insect','bug'], 130)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('花', '花', '[["ㄏ","ㄨㄚ","ˉ"]]'::jsonb, 'huā', NULL::jsonb, ARRAY['flower'], 131)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('草', '草', '[["ㄘ","ㄠ","ˇ"]]'::jsonb, 'cǎo', NULL::jsonb, ARRAY['grass'], 132)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('树', '樹', '[["ㄕ","ㄨ","ˋ"]]'::jsonb, 'shù', NULL::jsonb, ARRAY['tree'], 133)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('雨', '雨', '[["ㄩ","","ˇ"]]'::jsonb, 'yǔ', NULL::jsonb, ARRAY['rain'], 134)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('雪', '雪', '[["ㄒ","ㄩㄝ","ˇ"]]'::jsonb, 'xuě', NULL::jsonb, ARRAY['snow'], 135)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('风', '風', '[["ㄈ","ㄥ","ˉ"]]'::jsonb, 'fēng', NULL::jsonb, ARRAY['wind'], 136)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('云', '雲', '[["ㄩ","ㄣ","ˊ"]]'::jsonb, 'yún', NULL::jsonb, ARRAY['cloud'], 137)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('气', '氣', '[["ㄑ","ㄧ","ˋ"]]'::jsonb, 'qì', NULL::jsonb, ARRAY['air','gas','breath'], 138)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('电', '電', '[["ㄉ","ㄧㄢ","ˋ"]]'::jsonb, 'diàn', NULL::jsonb, ARRAY['electricity','electric'], 139)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('话', '話', '[["ㄏ","ㄨㄚ","ˋ"]]'::jsonb, 'huà', NULL::jsonb, ARRAY['speech','words','language'], 140)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('问', '問', '[["ㄨ","ㄣ","ˋ"]]'::jsonb, 'wèn', NULL::jsonb, ARRAY['to ask','to inquire'], 141)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('答', '答', '[["ㄉ","ㄚ","ˊ"]]'::jsonb, 'dá', NULL::jsonb, ARRAY['to answer','to reply'], 142)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('想', '想', '[["ㄒ","ㄧㄤ","ˇ"]]'::jsonb, 'xiǎng', NULL::jsonb, ARRAY['to think','to want'], 143)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('知', '知', '[["ㄓ","","ˉ"]]'::jsonb, 'zhī', NULL::jsonb, ARRAY['to know','knowledge'], 144)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('道', '道', '[["ㄉ","ㄠ","ˋ"]]'::jsonb, 'dào', NULL::jsonb, ARRAY['way','path','to say'], 145)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('会', '會', '[["ㄏ","ㄨㄟ","ˋ"]]'::jsonb, 'huì', NULL::jsonb, ARRAY['can','will','meeting'], 146)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('能', '能', '[["ㄋ","ㄥ","ˊ"]]'::jsonb, 'néng', NULL::jsonb, ARRAY['can','able'], 147)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('要', '要', '[["ㄧ","ㄠ","ˋ"]]'::jsonb, 'yào', NULL::jsonb, ARRAY['to want','to need','will'], 148)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;

INSERT INTO dictionary_entries (simp, trad, zhuyin, pinyin, zhuyin_variants, meanings, frequency_rank)
VALUES ('得', '得', '[["ㄉ","ㄜ","˙"]]'::jsonb, 'de', NULL::jsonb, ARRAY['to get','to obtain','particle'], 149)
ON CONFLICT (simp) DO UPDATE SET
  trad = EXCLUDED.trad,
  zhuyin = EXCLUDED.zhuyin,
  pinyin = EXCLUDED.pinyin,
  zhuyin_variants = EXCLUDED.zhuyin_variants,
  meanings = EXCLUDED.meanings,
  frequency_rank = EXCLUDED.frequency_rank;


-- Re-enable RLS
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;

-- Verify import
SELECT COUNT(*) as total_entries FROM dictionary_entries;
