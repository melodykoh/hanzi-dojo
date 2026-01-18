-- Migration: Fix 并州 → 並州 in dictionary_entries
-- Issue: #36 (https://github.com/melodykoh/hanzi-dojo/issues/36)
-- Date: 2026-01-18
--
-- Discovery: Exhaustive audit found this was missed by regex-based discovery.
-- The character 并/並 has context_word "并州" for the "bīng" pronunciation.
--
-- Exhaustive Query Used:
-- WITH simplified_chars AS (
--   SELECT simp, trad FROM dictionary_entries WHERE simp != trad
-- ),
-- all_dict_context_words AS (
--   SELECT cw as word FROM dictionary_entries de,
--     jsonb_array_elements(de.zhuyin_variants) as v,
--     jsonb_array_elements_text(v->'context_words') as cw
--   WHERE zhuyin_variants IS NOT NULL
-- )
-- SELECT word, array_agg(DISTINCT sc.simp || '→' || sc.trad)
-- FROM all_dict_context_words
-- CROSS JOIN simplified_chars sc
-- WHERE word LIKE '%' || sc.simp || '%'
-- GROUP BY word;

UPDATE dictionary_entries
SET zhuyin_variants = REPLACE(zhuyin_variants::TEXT, '并州', '並州')::JSONB
WHERE simp = '并'
  AND zhuyin_variants::TEXT LIKE '%并州%';

-- ============================================
-- EXHAUSTIVE VERIFICATION (run after migration)
-- Should return 0 rows for BOTH tables
-- ============================================
--
-- WITH simplified_chars AS (
--   SELECT simp, trad FROM dictionary_entries WHERE simp != trad
-- ),
-- readings_check AS (
--   SELECT 'readings' as tbl, word
--   FROM readings r, unnest(r.context_words) as word
--   WHERE EXISTS (SELECT 1 FROM simplified_chars sc WHERE word LIKE '%' || sc.simp || '%')
-- ),
-- dict_check AS (
--   SELECT 'dictionary_entries' as tbl, cw as word
--   FROM dictionary_entries de,
--        jsonb_array_elements(de.zhuyin_variants) as v,
--        jsonb_array_elements_text(v->'context_words') as cw
--   WHERE EXISTS (SELECT 1 FROM simplified_chars sc WHERE cw LIKE '%' || sc.simp || '%')
-- )
-- SELECT * FROM readings_check UNION ALL SELECT * FROM dict_check;
