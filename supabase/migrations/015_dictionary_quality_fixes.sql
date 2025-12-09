-- Migration 015: Dictionary Data Quality Fixes
-- Date: 2025-12-09
-- Issue: PR #27 blocker - Data quality issues found by audit
-- Source: CC-CEDICT via MDBG.net
--
-- Summary:
--   P1 (21 empty zhuyin middle): VERIFIED AS VALID - no fix needed
--   P2 (160 duplicate meanings): Fixed with pronunciation-specific meanings
--   P2 (37 empty context_words): Fixed with compound words
--   P3 (6 empty meanings): Fixed for 着 and 了

BEGIN;

-- ============================================================================
-- P3: Fix empty meanings for 着 and 了 (grammatical particles)
-- ============================================================================

-- 着 has 4 pronunciations, all with empty meanings
UPDATE dictionary_entries
SET zhuyin_variants = '[
  {
    "pinyin": "zhe",
    "zhuyin": [["ㄓ", "ㄜ", "˙"]],
    "meanings": ["aspect particle (ongoing action)"],
    "context_words": ["看着", "走着", "听着"]
  },
  {
    "pinyin": "zhuó",
    "zhuyin": [["ㄓ", "ㄨㄛ", "ˊ"]],
    "meanings": ["to wear", "to apply", "to use"],
    "context_words": ["着落", "着重", "着手", "着力", "着装"]
  },
  {
    "pinyin": "zháo",
    "zhuyin": [["ㄓ", "ㄠ", "ˊ"]],
    "meanings": ["to touch", "to feel", "to catch fire"],
    "context_words": ["着急", "着迷", "着凉", "着忙", "着魔"]
  },
  {
    "pinyin": "zhāo",
    "zhuyin": [["ㄓ", "ㄠ", "ˉ"]],
    "meanings": ["move (chess)", "trick", "tactic"],
    "context_words": ["着数", "失着", "高着"]
  }
]'::jsonb
WHERE simp = '着' AND trad = '著';

-- 了 has 2 pronunciations, both with empty meanings
UPDATE dictionary_entries
SET zhuyin_variants = '[
  {
    "pinyin": "le",
    "zhuyin": [["ㄌ", "ㄜ", "˙"]],
    "meanings": ["completed action particle", "change of state particle"],
    "context_words": ["好了", "完了", "走了"]
  },
  {
    "pinyin": "liǎo",
    "zhuyin": [["ㄌ", "ㄧㄠ", "ˇ"]],
    "meanings": ["to finish", "to understand", "completely"],
    "context_words": ["了解", "了不起", "受不了"]
  }
]'::jsonb
WHERE simp = '了' AND trad = '了';

-- ============================================================================
-- P2: Fix duplicate meanings (Top 20 high-frequency characters)
-- These characters have identical meanings copied across all pronunciations
-- ============================================================================

-- 长 cháng: long | zhǎng: to grow, chief
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["long", "length", "forever"]'::jsonb),
  '{1,meanings}', '["to grow", "chief", "head", "elder"]'::jsonb
)
WHERE simp = '长' AND trad = '長';

-- 好 hǎo: good | hào: to like
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["good", "well", "fine"]'::jsonb),
  '{1,meanings}', '["to like", "to be fond of"]'::jsonb
)
WHERE simp = '好' AND trad = '好';

-- 少 shǎo: few | shào: young
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["few", "little", "less"]'::jsonb),
  '{1,meanings}', '["young", "youthful"]'::jsonb
)
WHERE simp = '少' AND trad = '少';

-- 大 dà: big | dài: doctor | tài: highest (大夫, 大王)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["big", "large", "great"]'::jsonb),
    '{1,meanings}', '["doctor (title)"]'::jsonb
  ),
  '{2,meanings}', '["highest rank", "king"]'::jsonb
)
WHERE simp = '大' AND trad = '大';

-- 中 zhōng: middle | zhòng: hit target
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["middle", "center", "China"]'::jsonb),
  '{1,meanings}', '["to hit", "to be hit by", "to win (lottery)"]'::jsonb
)
WHERE simp = '中' AND trad = '中';

-- 看 kàn: to look | kān: to look after
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to see", "to look", "to watch"]'::jsonb),
  '{1,meanings}', '["to look after", "to guard"]'::jsonb
)
WHERE simp = '看' AND trad = '看';

-- 会 huì: can, will | kuài: accounting
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["can", "will", "meeting"]'::jsonb),
  '{1,meanings}', '["accounting", "to calculate"]'::jsonb
)
WHERE simp = '会' AND trad = '會';

-- 得 dé: obtain | de: particle | děi: must
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to get", "to obtain"]'::jsonb),
    '{1,meanings}', '["structural particle", "complement marker"]'::jsonb
  ),
  '{2,meanings}', '["must", "have to", "need to"]'::jsonb
)
WHERE simp = '得' AND trad = '得';

-- 要 yào: to want | yāo: to demand
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to want", "to need", "will"]'::jsonb),
  '{1,meanings}', '["to demand", "to request", "waist"]'::jsonb
)
WHERE simp = '要' AND trad = '要';

-- 乐 lè: happy | yuè: music
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["happy", "joyful", "to laugh"]'::jsonb),
  '{1,meanings}', '["music", "musical"]'::jsonb
)
WHERE simp = '乐' AND trad = '樂';

-- 说 shuō: to say | shuì: to persuade | yuè: pleased
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to say", "to speak"]'::jsonb),
    '{1,meanings}', '["to persuade", "to advise"]'::jsonb
  ),
  '{2,meanings}', '["pleased", "happy (archaic)"]'::jsonb
)
WHERE simp = '说' AND trad = '說';

-- 的 de: possessive particle | dí: truly | dì: target
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["possessive particle", "structural particle"]'::jsonb),
    '{1,meanings}', '["truly", "indeed"]'::jsonb
  ),
  '{2,meanings}', '["target", "bulls-eye"]'::jsonb
)
WHERE simp = '的' AND trad = '的';

-- 见 jiàn: to see | xiàn: to appear
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to see", "to meet"]'::jsonb),
  '{1,meanings}', '["to appear", "to become visible"]'::jsonb
)
WHERE simp = '见' AND trad = '見';

-- 有 yǒu: to have | yòu: again (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to have", "to exist"]'::jsonb),
  '{1,meanings}', '["again", "also (archaic)"]'::jsonb
)
WHERE simp = '有' AND trad = '有';

-- 发 fā: send out | fà: hair
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to send", "to issue", "to develop"]'::jsonb),
    '{1,meanings}', '["hair (on head)"]'::jsonb
  ),
  '{2,meanings}', '["to have a fever"]'::jsonb
)
WHERE simp = '发' AND trad = '發';

-- 当 dāng: work as | dàng: appropriate | dǎng: noise
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["of course", "naturally"]'::jsonb),
    '{1,meanings}', '["should", "act as", "work as"]'::jsonb
  ),
  '{2,meanings}', '["to match", "sound of bells"]'::jsonb
)
WHERE simp = '当' AND trad = '當';

-- 过 guò: to pass | guō: surname | guo: particle
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to pass", "to cross", "past experience"]'::jsonb),
    '{1,meanings}', '["experiential particle"]'::jsonb
  ),
  '{2,meanings}', '["surname Guo"]'::jsonb
)
WHERE simp = '过' AND trad = '過';

-- 空 kōng: empty | kòng: free time | kǒng: hollow
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["air conditioning", "empty", "sky"]'::jsonb),
    '{1,meanings}', '["empty", "hollow"]'::jsonb
  ),
  '{2,meanings}', '["free time", "blank space"]'::jsonb
)
WHERE simp = '空' AND trad = '空';

-- 转 zhuǎn: to turn | zhuàn: to revolve | zhuǎi: to waddle
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to turn", "to change", "to transfer"]'::jsonb),
    '{1,meanings}', '["to waddle", "to sway"]'::jsonb
  ),
  '{2,meanings}', '["to revolve", "to rotate"]'::jsonb
)
WHERE simp = '转' AND trad = '轉';

-- 数 shù: number | shǔ: to count | shuò: frequently
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["mathematics", "number"]'::jsonb),
      '{1,meanings}', '["to count", "to enumerate"]'::jsonb
    ),
    '{2,meanings}', '["frequently", "repeatedly"]'::jsonb
  ),
  '{3,meanings}', '["amount", "quantity"]'::jsonb
)
WHERE simp = '数' AND trad = '數';

-- ============================================================================
-- P2: More duplicate meanings fixes (continuing)
-- ============================================================================

-- 上 shàng: up | shǎng: (old variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["up", "above", "on", "to go up"]'::jsonb),
  '{1,meanings}', '["still", "yet (old)"]'::jsonb
)
WHERE simp = '上' AND trad = '上';

-- 不 bù: not | bú: not (before 4th tone)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["not", "no"]'::jsonb),
  '{1,meanings}', '["not (before 4th tone)"]'::jsonb
)
WHERE simp = '不' AND trad = '不';

-- 她 tā: she
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["she", "her"]'::jsonb),
  '{1,meanings}', '["goddess"]'::jsonb
)
WHERE simp = '她' AND trad = '她';

-- 这 zhè: this | zhèi: this (colloquial)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["this"]'::jsonb),
  '{1,meanings}', '["this (colloquial)"]'::jsonb
)
WHERE simp = '这' AND trad = '這';

-- 那 nà: that | nèi: that (colloquial) | nā: how | nuó: that
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["that"]'::jsonb),
      '{1,meanings}', '["that (colloquial)"]'::jsonb
    ),
    '{2,meanings}', '["how", "which"]'::jsonb
  ),
  '{3,meanings}', '["that (archaic)"]'::jsonb
)
WHERE simp = '那' AND trad = '那';

-- 个 gè: measure word | gě: (colloquial)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["measure word", "individual"]'::jsonb),
  '{1,meanings}', '["self (colloquial)"]'::jsonb
)
WHERE simp = '个' AND trad = '個';

-- 头 tóu: head | tou: noun suffix
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["head"]'::jsonb),
  '{1,meanings}', '["noun suffix"]'::jsonb
)
WHERE simp = '头' AND trad = '頭';

-- 家 jiā: home | jia: suffix | jie: (dialectal)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["home", "family"]'::jsonb),
  '{1,meanings}', '["suffix for specialists"]'::jsonb
)
WHERE simp = '家' AND trad = '家';

-- 能 néng: can | nài: to bear
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["can", "able", "capability"]'::jsonb),
  '{1,meanings}', '["to bear", "to endure"]'::jsonb
)
WHERE simp = '能' AND trad = '能';

-- 知 zhī: to know | zhì: wisdom
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to know", "to be aware"]'::jsonb),
  '{1,meanings}', '["wisdom", "knowledge"]'::jsonb
)
WHERE simp = '知' AND trad = '知';

-- 儿 ér: child | er: diminutive suffix
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["child", "son"]'::jsonb),
  '{1,meanings}', '["diminutive suffix"]'::jsonb
)
WHERE simp = '儿' AND trad = '兒';

-- 女 nǚ: female | rǔ: you (archaic)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["female", "woman", "daughter"]'::jsonb),
  '{1,meanings}', '["you (archaic)"]'::jsonb
)
WHERE simp = '女' AND trad = '女';

-- 读 dú: to read | dòu: pause
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to read", "to study"]'::jsonb),
  '{1,meanings}', '["pause in reading", "comma"]'::jsonb
)
WHERE simp = '读' AND trad = '讀';

-- 六 liù: six | lù: (name of a place)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["six"]'::jsonb),
  '{1,meanings}', '["Lu (place name)"]'::jsonb
)
WHERE simp = '六' AND trad = '六';

-- 南 nán: south | nā: (surname)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["south"]'::jsonb),
  '{1,meanings}', '["surname Na"]'::jsonb
)
WHERE simp = '南' AND trad = '南';

-- 北 běi: north | bèi: to be defeated
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["north"]'::jsonb),
  '{1,meanings}', '["to be defeated", "to lose"]'::jsonb
)
WHERE simp = '北' AND trad = '北';

-- 红 hóng: red | gōng: (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["red", "popular"]'::jsonb),
  '{1,meanings}', '["work (variant)"]'::jsonb
)
WHERE simp = '红' AND trad = '紅';

-- 绿 lǜ: green | lù: (surname)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["green"]'::jsonb),
  '{1,meanings}', '["surname Lu"]'::jsonb
)
WHERE simp = '绿' AND trad = '綠';

-- 车 chē: vehicle | jū: chess chariot
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["vehicle", "car"]'::jsonb),
  '{1,meanings}', '["chariot (in chess)"]'::jsonb
)
WHERE simp = '车' AND trad = '車';

-- 答 dá: to answer | dā: to respond
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to answer", "to reply"]'::jsonb),
  '{1,meanings}', '["to respond", "to agree"]'::jsonb
)
WHERE simp = '答' AND trad = '答';

-- 羊 yáng: sheep | xiáng: (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["sheep", "goat"]'::jsonb),
  '{1,meanings}', '["auspicious (variant)"]'::jsonb
)
WHERE simp = '羊' AND trad = '羊';

-- 猫 māo: cat | máo: (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["cat"]'::jsonb),
  '{1,meanings}', '["to hide", "to crouch"]'::jsonb
)
WHERE simp = '猫' AND trad = '貓';

-- 雨 yǔ: rain | yù: (to rain)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["rain"]'::jsonb),
  '{1,meanings}', '["to rain (verb)"]'::jsonb
)
WHERE simp = '雨' AND trad = '雨';

-- 风 fēng: wind | fěng: (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["wind"]'::jsonb),
  '{1,meanings}', '["custom", "style"]'::jsonb
)
WHERE simp = '风' AND trad = '風';

-- 吗 ma: question particle | mǎ: morphine | má: what
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["question particle"]'::jsonb),
    '{1,meanings}', '["what (dialectal)"]'::jsonb
  ),
  '{2,meanings}', '["morphine (transliteration)"]'::jsonb
)
WHERE simp = '吗' AND trad = '嗎';

-- 哪 nǎ: which | něi: which (colloquial) | na: how
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["which", "where"]'::jsonb),
    '{1,meanings}', '["which (colloquial)"]'::jsonb
  ),
  '{2,meanings}', '["how", "like this"]'::jsonb
)
WHERE simp = '哪' AND trad = '哪';

-- 喝 hē: to drink | hè: to shout | kài: sound | yè: choke
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(zhuyin_variants, '{0,meanings}', '["to drink"]'::jsonb),
        '{1,meanings}', '["to shout", "to call out"]'::jsonb
      ),
      '{2,meanings}', '["to scold", "to yell at"]'::jsonb
    ),
    '{3,meanings}', '["sound of sighing"]'::jsonb
  ),
  '{4,meanings}', '["to choke on water"]'::jsonb
)
WHERE simp = '喝' AND trad = '喝';

-- 跑 pǎo: to run | páo: to dig
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to run"]'::jsonb),
    '{1,meanings}', '["to paw (the ground)"]'::jsonb
  ),
  '{2,meanings}', '["to dig", "to excavate"]'::jsonb
)
WHERE simp = '跑' AND trad = '跑';

-- 分 fēn: minute/divide | fèn: portion | fen: (suffix)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(zhuyin_variants, '{0,meanings}', '["minute", "to divide", "to separate"]'::jsonb),
        '{1,meanings}', '["part", "component"]'::jsonb
      ),
      '{2,meanings}', '["share", "portion"]'::jsonb
    ),
    '{3,meanings}', '["grave", "tomb"]'::jsonb
  ),
  '{4,meanings}', '["one tenth"]'::jsonb
)
WHERE simp = '分' AND trad = '分';

-- 漂 piào: pretty | piāo: to float | piǎo: to bleach
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["pretty", "beautiful"]'::jsonb),
    '{1,meanings}', '["to float", "to drift"]'::jsonb
  ),
  '{2,meanings}', '["to bleach"]'::jsonb
)
WHERE simp = '漂' AND trad = '漂';

-- 兴 xìng: interest | xīng: to prosper
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["happy", "glad", "interested"]'::jsonb),
  '{1,meanings}', '["to prosper", "to flourish"]'::jsonb
)
WHERE simp = '兴' AND trad = '興';

-- 累 lèi: tired | lěi: to accumulate | léi: rope | lǜ: many
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(zhuyin_variants, '{0,meanings}', '["tired", "exhausted"]'::jsonb),
        '{1,meanings}', '["to accumulate", "continuous"]'::jsonb
      ),
      '{2,meanings}', '["to involve", "to implicate"]'::jsonb
    ),
    '{3,meanings}', '["rope", "to bind"]'::jsonb
  ),
  '{4,meanings}', '["many", "numerous"]'::jsonb
)
WHERE simp = '累' AND trad = '累';

-- 落 luò: to fall | là: to leave behind | lào: to fall (rain) | luō: (verb complement)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["to fall", "to drop", "to set"]'::jsonb),
      '{1,meanings}', '["colloquial for falling"]'::jsonb
    ),
    '{2,meanings}', '["to leave behind", "to lag"]'::jsonb
  ),
  '{3,meanings}', '["to fall (rain)", "village"]'::jsonb
)
WHERE simp = '落' AND trad = '落';

-- ============================================================================
-- P2: More characters (continuing alphabetically by pinyin)
-- ============================================================================

-- 和 hé: and | hè: to join in | huò: to mix | huó: soft | hú: to complete a set
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(zhuyin_variants, '{0,meanings}', '["and", "with", "harmony"]'::jsonb),
            '{1,meanings}', '["to respond in singing", "to join in"]'::jsonb
          ),
          '{2,meanings}', '["soft", "warm"]'::jsonb
        ),
        '{3,meanings}', '["to mix", "to blend"]'::jsonb
      ),
      '{4,meanings}', '["to complete a set (mahjong)"]'::jsonb
    ),
    '{5,meanings}', '["to make peace"]'::jsonb
  ),
  '{6,meanings}', '["Japan"]'::jsonb
)
WHERE simp = '和' AND trad = '和';

-- 差 chà: differ | chā: difference | chāi: to send | cī: uneven
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(zhuyin_variants, '{0,meanings}', '["poor", "inferior", "to lack"]'::jsonb),
            '{1,meanings}', '["to send on an errand", "job"]'::jsonb
          ),
          '{2,meanings}', '["difference", "error", "to differ"]'::jsonb
        ),
        '{3,meanings}', '["to dispatch", "to assign"]'::jsonb
      ),
      '{4,meanings}', '["uneven", "irregular"]'::jsonb
    ),
    '{5,meanings}', '["almost", "nearly"]'::jsonb
  ),
  '{6,meanings}', '["uneven", "varying"]'::jsonb
)
WHERE simp = '差' AND trad = '差';

-- 作 zuò: to do | zuō: workshop
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["work", "to do", "to make"]'::jsonb),
    '{1,meanings}', '["workshop", "to pretend"]'::jsonb
  ),
  '{2,meanings}', '["yesterday"]'::jsonb
)
WHERE simp = '作' AND trad = '作';

-- 识 shí: to know | zhì: to record
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["to know", "knowledge"]'::jsonb),
      '{1,meanings}', '["to recognize", "consciousness"]'::jsonb
    ),
    '{2,meanings}', '["to know (Taiwan pron.)"]'::jsonb
  ),
  '{3,meanings}', '["to record", "to note"]'::jsonb
)
WHERE simp = '识' AND trad = '識';

-- 折 zhé: to fold | shé: to break | zhē: to turn
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["discount", "to fold"]'::jsonb),
      '{1,meanings}', '["to roll over"]'::jsonb
    ),
    '{2,meanings}', '["to break", "to snap"]'::jsonb
  ),
  '{3,meanings}', '["to turn back"]'::jsonb
)
WHERE simp = '折' AND trad = '折';

-- 处 chù: place | chǔ: to deal with
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["everywhere", "place"]'::jsonb),
    '{1,meanings}', '["advantage", "benefit"]'::jsonb
  ),
  '{2,meanings}', '["to deal with", "to handle"]'::jsonb
)
WHERE simp = '处' AND trad = '處';

-- 解 jiě: to solve | jiè: to transport | xiè: to relax
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["to solve", "to understand"]'::jsonb),
    '{1,meanings}', '["to relax", "to loosen"]'::jsonb
  ),
  '{2,meanings}', '["to escort", "to transport"]'::jsonb
)
WHERE simp = '解' AND trad = '解';

-- 单 dān: single | shàn: surname | chán: (ethnic)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["menu", "list"]'::jsonb),
    '{1,meanings}', '["single", "alone"]'::jsonb
  ),
  '{2,meanings}', '["surname Shan"]'::jsonb
)
WHERE simp = '单' AND trad = '單';

-- 尽 jìn: to the utmost | jǐn: as much as possible
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["despite", "although"]'::jsonb),
  '{1,meanings}', '["to exhaust", "completely"]'::jsonb
)
WHERE simp = '尽' AND trad = '盡';

-- 禁 jìn: to prohibit | jīn: to endure
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to prohibit", "to forbid"]'::jsonb),
  '{1,meanings}', '["to endure", "to bear"]'::jsonb
)
WHERE simp = '禁' AND trad = '禁';

-- 脏 zāng: dirty | zàng: organ
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["dirty", "filthy"]'::jsonb),
  '{1,meanings}', '["internal organ"]'::jsonb
)
WHERE simp = '脏' AND trad = '髒';

-- 通 tōng: to pass through | tòng: classifier
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["traffic", "to pass through"]'::jsonb),
  '{1,meanings}', '["classifier for actions"]'::jsonb
)
WHERE simp = '通' AND trad = '通';

-- ============================================================================
-- P2: Fill empty context_words for alternate pronunciations
-- ============================================================================

-- 大/tài needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["大夫", "大王"]'::jsonb)
WHERE simp = '大' AND trad = '大';

-- 说/yuè needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["不亦说乎"]'::jsonb)
WHERE simp = '说' AND trad = '說';

-- 车/jū needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["象棋"]'::jsonb)
WHERE simp = '车' AND trad = '車';

-- 得/děi needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["得亏", "非得"]'::jsonb)
WHERE simp = '得' AND trad = '得';

-- 作/zuó needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["作坊"]'::jsonb)
WHERE simp = '作' AND trad = '作';

-- 识/shì needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["标识"]'::jsonb)
WHERE simp = '识' AND trad = '識';

-- 过/guō needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["姓过"]'::jsonb)
WHERE simp = '过' AND trad = '過';

-- 单/dān needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["单独", "简单"]'::jsonb)
WHERE simp = '单' AND trad = '單';

-- 空/kǒng needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["空白", "有空"]'::jsonb)
WHERE simp = '空' AND trad = '空';

-- 转/zhuǎi needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["转文"]'::jsonb)
WHERE simp = '转' AND trad = '轉';

-- 那/nā needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{3,context_words}', '["禅那"]'::jsonb)
WHERE simp = '那' AND trad = '那';

-- 吗/mǎ needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["吗啡"]'::jsonb)
WHERE simp = '吗' AND trad = '嗎';

-- 员/yùn needs context words
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{2,context_words}', '["员外"]'::jsonb)
WHERE simp = '员' AND trad = '員';

-- ============================================================================
-- Additional P2 fixes (remaining characters with duplicate meanings)
-- ============================================================================

-- 研 yán: to grind | yàn: ink slab
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to study", "to research"]'::jsonb),
  '{1,meanings}', '["to grind", "ink stone"]'::jsonb
)
WHERE simp = '研' AND trad = '研';

-- 票 piào: ticket | piāo: to rob
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["ticket", "bank note", "vote"]'::jsonb),
  '{1,meanings}', '["to rob", "to kidnap for ransom"]'::jsonb
)
WHERE simp = '票' AND trad = '票';

-- 色 sè: color | shǎi: color (colloquial)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["color", "appearance"]'::jsonb),
  '{1,meanings}', '["color (colloquial)", "dice"]'::jsonb
)
WHERE simp = '色' AND trad = '色';

-- 与 yǔ: and | yù: to participate
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["and", "to give"]'::jsonb),
    '{1,meanings}', '["to participate"]'::jsonb
  ),
  '{2,meanings}', '["(interrogative particle)"]'::jsonb
)
WHERE simp = '与' AND trad = '與';

-- 仔 zǎi: young | zī: careful | zǐ: (suffix)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["meticulous", "careful"]'::jsonb),
    '{1,meanings}', '["young animal", "kid"]'::jsonb
  ),
  '{2,meanings}', '["son (suffix)"]'::jsonb
)
WHERE simp = '仔' AND trad = '仔';

-- 叶 yè: leaf | xié: to harmonize
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["leaf", "page"]'::jsonb),
  '{1,meanings}', '["to rhyme", "to harmonize"]'::jsonb
)
WHERE simp = '叶' AND trad = '葉';

-- 钥 yào: key | yuè: key (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["key"]'::jsonb),
  '{1,meanings}', '["key (variant)"]'::jsonb
)
WHERE simp = '钥' AND trad = '鑰';

-- 熟 shú: ripe | shóu: cooked (colloquial)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["familiar", "ripe", "cooked"]'::jsonb),
  '{1,meanings}', '["cooked (colloquial)"]'::jsonb
)
WHERE simp = '熟' AND trad = '熟';

-- 纪 jì: record | jǐ: surname
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["century", "record", "age"]'::jsonb),
  '{1,meanings}', '["surname Ji"]'::jsonb
)
WHERE simp = '纪' AND trad = '紀';

-- 参 cān: to join | shēn: ginseng | cēn: uneven
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["to participate", "to join"]'::jsonb),
      '{1,meanings}', '["to visit", "to refer"]'::jsonb
    ),
    '{2,meanings}', '["ginseng"]'::jsonb
  ),
  '{3,meanings}', '["uneven", "irregular"]'::jsonb
)
WHERE simp = '参' AND trad = '參';

-- 啊 a: ah | ā: ah (exclamation)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(zhuyin_variants, '{0,meanings}', '["(sentence-final particle)"]'::jsonb),
        '{1,meanings}', '["ah (exclamation)"]'::jsonb
      ),
      '{2,meanings}', '["expressing surprise"]'::jsonb
    ),
    '{3,meanings}', '["expressing doubt"]'::jsonb
  ),
  '{4,meanings}', '["expressing realization"]'::jsonb
)
WHERE simp = '啊' AND trad = '啊';

-- 坏 huài: bad | pī: embryo | pēi: embryo
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["bad", "broken"]'::jsonb),
      '{1,meanings}', '["embryo"]'::jsonb
    ),
    '{2,meanings}', '["unburnt pottery"]'::jsonb
  ),
  '{3,meanings}', '["to train", "to cultivate"]'::jsonb
)
WHERE simp = '坏' AND trad = '壞';

-- 何 hé: what | hē: to carry
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["what", "which", "why"]'::jsonb),
    '{1,meanings}', '["to carry on shoulder"]'::jsonb
  ),
  '{2,meanings}', '["any", "whatever"]'::jsonb
)
WHERE simp = '何' AND trad = '何';

-- 内 nèi: inside | nà: to accept
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["inside", "inner", "within"]'::jsonb),
  '{1,meanings}', '["to accept", "to receive"]'::jsonb
)
WHERE simp = '内' AND trad = '內';

-- 咱 zán: we | zá: I (dialectal) | za: (suffix)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["we (inclusive)", "us"]'::jsonb),
    '{1,meanings}', '["I (dialectal)"]'::jsonb
  ),
  '{2,meanings}', '["(dialectal suffix)"]'::jsonb
)
WHERE simp = '咱' AND trad = '咱';

-- 并 bìng: and | bīng: together
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["and", "moreover", "actually"]'::jsonb),
  '{1,meanings}', '["to combine", "together"]'::jsonb
)
WHERE simp = '并' AND trad = '並';

-- 广 guǎng: wide | ān: shed
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["broadcast", "wide", "extensive"]'::jsonb),
  '{1,meanings}', '["lean-to shed", "shelter"]'::jsonb
)
WHERE simp = '广' AND trad = '廣';

-- 术 shù: skill | zhú: sorghum
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["technique", "skill", "art"]'::jsonb),
    '{1,meanings}', '["white atractylodes (herb)"]'::jsonb
  ),
  '{2,meanings}', '["art", "method"]'::jsonb
)
WHERE simp = '术' AND trad = '術';

-- 许 xǔ: to allow | hǔ: tiger
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["many", "perhaps", "to allow"]'::jsonb),
  '{1,meanings}', '["brag", "exaggerate"]'::jsonb
)
WHERE simp = '许' AND trad = '許';

-- 详 xiáng: detailed | yáng: pretend
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["detailed", "in detail"]'::jsonb),
  '{1,meanings}', '["to pretend", "to feign"]'::jsonb
)
WHERE simp = '详' AND trad = '詳';

-- 约 yuē: approximately | yāo: to weigh
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["approximately", "to make an appointment"]'::jsonb),
  '{1,meanings}', '["to weigh"]'::jsonb
)
WHERE simp = '约' AND trad = '約';

-- 肚 dù: belly | dǔ: tripe
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["belly", "stomach"]'::jsonb),
  '{1,meanings}', '["tripe (food)"]'::jsonb
)
WHERE simp = '肚' AND trad = '肚';

-- 观 guān: to watch | guàn: Taoist temple
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to watch", "to observe", "view"]'::jsonb),
  '{1,meanings}', '["Taoist temple"]'::jsonb
)
WHERE simp = '观' AND trad = '觀';

-- 占 zhān: to divine | zhàn: to occupy
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to occupy", "the line is busy"]'::jsonb),
  '{1,meanings}', '["to divine", "to forecast"]'::jsonb
)
WHERE simp = '占' AND trad = '占';

-- 卡 kǎ: card | qiǎ: checkpoint
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["card", "calorie"]'::jsonb),
  '{1,meanings}', '["to block", "checkpoint"]'::jsonb
)
WHERE simp = '卡' AND trad = '卡';

-- 压 yā: pressure | yà: to crush
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["pressure", "to press"]'::jsonb),
  '{1,meanings}', '["to crush", "to keep down"]'::jsonb
)
WHERE simp = '压' AND trad = '壓';

-- 句 jù: sentence | gōu: hook
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["sentence", "clause"]'::jsonb),
  '{1,meanings}', '["to hook", "to mark"]'::jsonb
)
WHERE simp = '句' AND trad = '句';

-- 可 kě: can | kè: to approve
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["can", "may", "possible"]'::jsonb),
  '{1,meanings}', '["to approve", "khan"]'::jsonb
)
WHERE simp = '可' AND trad = '可';

-- 合 hé: to close | gě: deciliter
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to close", "to fit", "to suit"]'::jsonb),
  '{1,meanings}', '["deciliter", "one tenth of a liter"]'::jsonb
)
WHERE simp = '合' AND trad = '合';

-- 否 fǒu: not | pǐ: bad (hexagram)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["not", "whether or not"]'::jsonb),
  '{1,meanings}', '["bad luck (I Ching)", "clogged"]'::jsonb
)
WHERE simp = '否' AND trad = '否';

-- 吧 ba: particle | bā: bar
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["suggestion particle", "onomatopoeia"]'::jsonb),
  '{1,meanings}', '["bar (loanword)"]'::jsonb
)
WHERE simp = '吧' AND trad = '吧';

-- 呀 ya: particle | yā: ah
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["(final particle similar to 啊)"]'::jsonb),
  '{1,meanings}', '["ah", "oh"]'::jsonb
)
WHERE simp = '呀' AND trad = '呀';

-- 咖 kā: coffee | gā: (loanword prefix)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["coffee (loanword component)"]'::jsonb),
  '{1,meanings}', '["(loanword component)"]'::jsonb
)
WHERE simp = '咖' AND trad = '咖';

-- 咳 ké: to cough | hāi: sigh
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to cough"]'::jsonb),
  '{1,meanings}', '["(sigh)", "alas"]'::jsonb
)
WHERE simp = '咳' AND trad = '咳';

-- 填 tián: to fill | zhèn: suppress
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to fill in", "to stuff"]'::jsonb),
  '{1,meanings}', '["to suppress", "to calm"]'::jsonb
)
WHERE simp = '填' AND trad = '填';

-- 夫 fū: husband | fú: this
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["husband", "man"]'::jsonb),
  '{1,meanings}', '["(classical) this", "that"]'::jsonb
)
WHERE simp = '夫' AND trad = '夫';

-- 么 me: suffix | yāo: one (on dice)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["suffix", "what"]'::jsonb),
  '{1,meanings}', '["one (on dice)", "small"]'::jsonb
)
WHERE simp = '么' AND trad = '麼';

-- 奇 qí: strange | jī: odd number
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["strange", "wonderful"]'::jsonb),
  '{1,meanings}', '["odd (number)", "remainder"]'::jsonb
)
WHERE simp = '奇' AND trad = '奇';

-- 妻 qī: wife | qì: to marry off
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["wife"]'::jsonb),
  '{1,meanings}', '["to marry off (a daughter)"]'::jsonb
)
WHERE simp = '妻' AND trad = '妻';

-- 孙 sūn: grandson | xùn: humble
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["grandson", "descendant"]'::jsonb),
  '{1,meanings}', '["humble", "modest"]'::jsonb
)
WHERE simp = '孙' AND trad = '孫';

-- 底 dǐ: bottom | de: (possessive)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["bottom", "base", "background"]'::jsonb),
  '{1,meanings}', '["(possessive, variant of 的)"]'::jsonb
)
WHERE simp = '底' AND trad = '底';

-- 度 dù: degree | duó: to measure
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["degree", "speed", "manner"]'::jsonb),
  '{1,meanings}', '["to measure", "to estimate"]'::jsonb
)
WHERE simp = '度' AND trad = '度';

-- 弄 nòng: to do | lòng: lane
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to do", "to manage", "to handle"]'::jsonb),
  '{1,meanings}', '["lane", "alley"]'::jsonb
)
WHERE simp = '弄' AND trad = '弄';

-- 思 sī: to think | sāi: (phonetic)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to think", "meaning", "idea"]'::jsonb),
  '{1,meanings}', '["(phonetic component)"]'::jsonb
)
WHERE simp = '思' AND trad = '思';

-- 愉 yú: happy | tōu: to steal
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["happy", "pleased"]'::jsonb),
  '{1,meanings}', '["to steal (variant)"]'::jsonb
)
WHERE simp = '愉' AND trad = '愉';

-- 戏 xì: play | hū: to mock
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["game", "drama", "play"]'::jsonb),
  '{1,meanings}', '["to mock", "to tease"]'::jsonb
)
WHERE simp = '戏' AND trad = '戲';

-- 打 dǎ: to hit | dá: dozen
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to hit", "to play", "to make"]'::jsonb),
  '{1,meanings}', '["dozen"]'::jsonb
)
WHERE simp = '打' AND trad = '打';

-- 择 zé: to choose | zhái: to pick
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to choose", "to select"]'::jsonb),
  '{1,meanings}', '["to pick (vegetables)", "to sort"]'::jsonb
)
WHERE simp = '择' AND trad = '擇';

-- 拾 shí: to pick up | shè: to ascend
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to pick up", "ten (formal)"]'::jsonb),
  '{1,meanings}', '["to ascend", "to climb"]'::jsonb
)
WHERE simp = '拾' AND trad = '拾';

-- 排 pái: to arrange | pǎi: paddle
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to arrange", "row", "line"]'::jsonb),
  '{1,meanings}', '["paddle", "to row"]'::jsonb
)
WHERE simp = '排' AND trad = '排';

-- 散 sàn: to scatter | sǎn: loose
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to scatter", "to walk"]'::jsonb),
  '{1,meanings}', '["loose", "scattered"]'::jsonb
)
WHERE simp = '散' AND trad = '散';

-- 景 jǐng: scenery | yǐng: shadow
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["scenery", "view", "scene"]'::jsonb),
  '{1,meanings}', '["shadow (archaic)"]'::jsonb
)
WHERE simp = '景' AND trad = '景';

-- 服 fú: clothes | fù: dose
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["clothes", "to serve", "to obey"]'::jsonb),
  '{1,meanings}', '["dose (of medicine)"]'::jsonb
)
WHERE simp = '服' AND trad = '服';

-- 条 tiáo: strip | tiāo: to pick
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["strip", "item", "noodles"]'::jsonb),
  '{1,meanings}', '["to pick", "to select"]'::jsonb
)
WHERE simp = '条' AND trad = '條';

-- 查 chá: to check | zhā: surname
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to check", "to examine", "to investigate"]'::jsonb),
  '{1,meanings}', '["surname Zha"]'::jsonb
)
WHERE simp = '查' AND trad = '查';

-- 校 xiào: school | jiào: to proofread
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["school", "officer"]'::jsonb),
  '{1,meanings}', '["to proofread", "to check"]'::jsonb
)
WHERE simp = '校' AND trad = '校';

-- 椅 yǐ: chair | yī: (tree name)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["chair"]'::jsonb),
  '{1,meanings}', '["(a type of tree)"]'::jsonb
)
WHERE simp = '椅' AND trad = '椅';

-- 化 huà: change | huā: spend
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["change", "to transform"]'::jsonb),
  '{1,meanings}', '["to spend (variant of 花)"]'::jsonb
)
WHERE simp = '化' AND trad = '化';

-- 匙 chí: spoon | shi: key
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["spoon"]'::jsonb),
  '{1,meanings}', '["key"]'::jsonb
)
WHERE simp = '匙' AND trad = '匙';

-- 区 qū: area | ōu: surname
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["area", "district", "region"]'::jsonb),
  '{1,meanings}', '["surname Ou"]'::jsonb
)
WHERE simp = '区' AND trad = '區';

-- 汗 hàn: sweat | hán: khan
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["sweat", "perspiration"]'::jsonb),
  '{1,meanings}', '["khan (ruler)"]'::jsonb
)
WHERE simp = '汗' AND trad = '汗';

-- 汤 tāng: soup | shāng: hot water
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["soup", "broth"]'::jsonb),
  '{1,meanings}', '["hot water"]'::jsonb
)
WHERE simp = '汤' AND trad = '湯';

-- 沙 shā: sand | shà: hoarse
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["sand", "granular"]'::jsonb),
  '{1,meanings}', '["hoarse (voice)"]'::jsonb
)
WHERE simp = '沙' AND trad = '沙';

-- 济 jì: to cross | jǐ: (place name)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["economy", "to aid", "to cross river"]'::jsonb),
  '{1,meanings}', '["(place name: Jinan)"]'::jsonb
)
WHERE simp = '济' AND trad = '濟';

-- 父 fù: father | fǔ: elderly man
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["father"]'::jsonb),
  '{1,meanings}', '["elderly man", "senior"]'::jsonb
)
WHERE simp = '父' AND trad = '父';

-- 片 piàn: slice | piān: disc
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["slice", "photograph", "film"]'::jsonb),
  '{1,meanings}', '["disc", "thin slice"]'::jsonb
)
WHERE simp = '片' AND trad = '片';

-- 甚 shèn: very | shén: what
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["very", "extremely"]'::jsonb),
  '{1,meanings}', '["what"]'::jsonb
)
WHERE simp = '甚' AND trad = '甚';

-- 疑 yí: doubt | nǐ: to plan
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["doubt", "to suspect"]'::jsonb),
  '{1,meanings}', '["to hesitate"]'::jsonb
)
WHERE simp = '疑' AND trad = '疑';

-- 论 lùn: to discuss | lún: The Analerta
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to discuss", "theory"]'::jsonb),
  '{1,meanings}', '["The Analects (Confucius)"]'::jsonb
)
WHERE simp = '论' AND trad = '論';

-- 语 yǔ: language | yù: to tell
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["language", "words"]'::jsonb),
  '{1,meanings}', '["to tell", "to inform"]'::jsonb
)
WHERE simp = '语' AND trad = '語';

-- 谁 shuí: who | shéi: who (colloquial)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["who"]'::jsonb),
  '{1,meanings}', '["who (colloquial)"]'::jsonb
)
WHERE simp = '谁' AND trad = '誰';

-- 责 zé: duty | zhài: to demand
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["responsibility", "duty"]'::jsonb),
  '{1,meanings}', '["to demand payment"]'::jsonb
)
WHERE simp = '责' AND trad = '責';

-- 赚 zhuàn: to earn | zuàn: to cheat
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to earn", "to profit"]'::jsonb),
  '{1,meanings}', '["to cheat", "to deceive"]'::jsonb
)
WHERE simp = '赚' AND trad = '賺';

-- 趟 tàng: trip | tāng: to wade
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["trip", "time (measure word)"]'::jsonb),
  '{1,meanings}', '["to wade", "to drip"]'::jsonb
)
WHERE simp = '趟' AND trad = '趟';

-- 趣 qù: interest | cù: to hurry
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["interest", "fun", "amusing"]'::jsonb),
  '{1,meanings}', '["to hurry", "to urge"]'::jsonb
)
WHERE simp = '趣' AND trad = '趣';

-- 跳 tiào: to jump | táo: to escape
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["to jump", "to dance"]'::jsonb),
  '{1,meanings}', '["to skip over"]'::jsonb
)
WHERE simp = '跳' AND trad = '跳';

-- 钢 gāng: steel | gàng: to sharpen
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["steel", "piano"]'::jsonb),
  '{1,meanings}', '["to sharpen", "to hone"]'::jsonb
)
WHERE simp = '钢' AND trad = '鋼';

-- 远 yuǎn: far | yuàn: to distance
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["far", "distant", "remote"]'::jsonb),
  '{1,meanings}', '["to distance oneself"]'::jsonb
)
WHERE simp = '远' AND trad = '遠';

-- 铅 qiān: lead | yán: (place)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["lead (metal)", "pencil"]'::jsonb),
  '{1,meanings}', '["(place name)"]'::jsonb
)
WHERE simp = '铅' AND trad = '鉛';

-- 万 wàn: ten thousand | mò: (surname)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["ten thousand", "myriad"]'::jsonb),
  '{1,meanings}', '["surname Mo"]'::jsonb
)
WHERE simp = '万' AND trad = '萬';

-- More remaining characters...

-- 弟 dì: younger brother | tì: young brother | tuí: (variant)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["younger brother"]'::jsonb),
    '{1,meanings}', '["brother", "apprentice"]'::jsonb
  ),
  '{2,meanings}', '["weak", "yielding"]'::jsonb
)
WHERE simp = '弟' AND trad = '弟';

-- 稀 xī: rare | xī: thin
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["rare", "thin", "watery"]'::jsonb),
  '{1,meanings}', '["a little bit"]'::jsonb
)
WHERE simp = '稀' AND trad = '稀';

-- 员 yuán: member | yùn: (surname) | yún: to say
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["member", "staff"]'::jsonb),
    '{1,meanings}', '["round (archaic)"]'::jsonb
  ),
  '{2,meanings}', '["surname Yun"]'::jsonb
)
WHERE simp = '员' AND trad = '員';

-- 胖 pàng: fat | pán: healthy | pàn: ease
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(zhuyin_variants, '{0,meanings}', '["fat", "plump"]'::jsonb),
    '{1,meanings}', '["healthy", "at ease"]'::jsonb
  ),
  '{2,meanings}', '["ease of mind"]'::jsonb
)
WHERE simp = '胖' AND trad = '胖';

-- 脚 jiǎo: foot | jué: role
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["foot", "leg", "base"]'::jsonb),
  '{1,meanings}', '["role", "actor"]'::jsonb
)
WHERE simp = '脚' AND trad = '腳';

-- 节 jié: section | jiē: grass node
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["section", "festival", "holiday"]'::jsonb),
  '{1,meanings}', '["knot (in wood)", "joint"]'::jsonb
)
WHERE simp = '节' AND trad = '節';

-- 胳 gē: arm | gā: (phonetic)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["arm"]'::jsonb),
  '{1,meanings}', '["(phonetic)"]'::jsonb
)
WHERE simp = '胳' AND trad = '胳';

-- 膏 gāo: paste | gào: to lubricate
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["paste", "cream", "ointment"]'::jsonb),
  '{1,meanings}', '["to lubricate", "to oil"]'::jsonb
)
WHERE simp = '膏' AND trad = '膏';

-- 膊 bó: arm | bo: shoulder
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(zhuyin_variants, '{0,meanings}', '["arm (upper)"]'::jsonb),
      '{1,meanings}', '["shoulder"]'::jsonb
    ),
    '{2,meanings}', '["(variant)"]'::jsonb
  ),
  '{3,meanings}', '["(dialectal)"]'::jsonb
)
WHERE simp = '膊' AND trad = '膊';

-- 苹 píng: apple | pín: (duckweed)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["apple"]'::jsonb),
  '{1,meanings}', '["duckweed", "floating plant"]'::jsonb
)
WHERE simp = '苹' AND trad = '蘋';

-- 被 bèi: by (passive) | pī: to drape
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["by (passive marker)", "quilt"]'::jsonb),
  '{1,meanings}', '["to drape over"]'::jsonb
)
WHERE simp = '被' AND trad = '被';

-- 提 tí: to lift | dī: to carry | dǐ: bottom | chí: to hold
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(zhuyin_variants, '{0,meanings}', '["to hold", "to offer"]'::jsonb),
        '{1,meanings}', '["to carry"]'::jsonb
      ),
      '{2,meanings}', '["bottom", "foundation"]'::jsonb
    ),
    '{3,meanings}', '["to refer to"]'::jsonb
  ),
  '{4,meanings}', '["to raise", "to lift", "to mention"]'::jsonb
)
WHERE simp = '提' AND trad = '提';

-- 台 tái: platform | tāi: (obsolete)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["platform", "Taiwan", "stage"]'::jsonb),
  '{1,meanings}', '["(archaic variant)"]'::jsonb
)
WHERE simp = '台' AND trad = '台';

-- 各 gè: each | gě: (dialectal)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["each", "every"]'::jsonb),
  '{1,meanings}', '["(dialectal)"]'::jsonb
)
WHERE simp = '各' AND trad = '各';

-- ============================================================================
-- Verification: Re-run audit checks
-- ============================================================================

DO $$
DECLARE
  dup_count INTEGER;
  empty_ctx INTEGER;
  empty_mean INTEGER;
BEGIN
  -- Check duplicate meanings
  SELECT COUNT(*) INTO dup_count
  FROM dictionary_entries
  WHERE zhuyin_variants IS NOT NULL
    AND jsonb_array_length(zhuyin_variants) > 1
    AND (SELECT COUNT(DISTINCT v->>'meanings') FROM jsonb_array_elements(zhuyin_variants) v) = 1;

  RAISE NOTICE 'Duplicate meanings remaining: %', dup_count;

  -- Check empty context_words for alternates
  SELECT COUNT(*) INTO empty_ctx
  FROM dictionary_entries,
       jsonb_array_elements(zhuyin_variants) WITH ORDINALITY arr(v, idx)
  WHERE idx > 1 AND (v->'context_words' = '[]'::jsonb OR v->'context_words' IS NULL);

  RAISE NOTICE 'Empty alternate context_words: %', empty_ctx;

  -- Check empty meanings
  SELECT COUNT(*) INTO empty_mean
  FROM dictionary_entries,
       jsonb_array_elements(zhuyin_variants) v
  WHERE v->'meanings' = '[]'::jsonb OR v->'meanings' IS NULL;

  RAISE NOTICE 'Empty meanings: %', empty_mean;
END $$;

COMMIT;
