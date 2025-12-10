-- Migration 015b: Dictionary Quality Cleanup
-- Date: 2025-12-09
-- Fixes remaining 2 duplicate meanings after 015

BEGIN;

-- 硕: shuò is the only standard pronunciation. shí variant appears to be an error.
-- Fix: Remove shí variant (keep only shuò)
UPDATE dictionary_entries
SET zhuyin_variants = '[
  {
    "pinyin": "shuò",
    "zhuyin": [["ㄕ", "ㄨㄛ", "ˋ"]],
    "meanings": ["large", "big", "Masters degree"],
    "context_words": ["硕士", "硕大", "硕果"]
  }
]'::jsonb
WHERE simp = '硕' AND trad = '碩';

-- 稍: shāo = a little | shào = at ease (military)
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(
  jsonb_set(zhuyin_variants, '{0,meanings}', '["a little", "somewhat", "slightly"]'::jsonb),
  '{1,meanings}', '["at ease (military command)"]'::jsonb
)
WHERE simp = '稍' AND trad = '稍';

-- Add context words for 稍/shào
UPDATE dictionary_entries
SET zhuyin_variants = jsonb_set(zhuyin_variants, '{1,context_words}', '["稍息"]'::jsonb)
WHERE simp = '稍' AND trad = '稍';

COMMIT;
