-- Migration: Fix Simplified Context Words in readings Table
-- Issue: #36 (https://github.com/melodykoh/hanzi-dojo/issues/36)
-- Date: 2026-01-17
--
-- Problem: readings.context_words copied from dictionary_entries BEFORE
-- migration 015c converted them to traditional. dictionary_entries is now
-- fixed, but readings still has simplified values.
--
-- Scope: 5 readings rows with 11 simplified words total
-- Approach: Hardcoded word-level mapping (per reviewer recommendations)

-- ============================================
-- Convert simplified context_words to traditional
-- ============================================

WITH word_mappings(simp, trad) AS (VALUES
  -- 为/為 words
  ('因为', '因為'),
  ('为了', '為了'),
  ('为什么', '為什麼'),

  -- 什/麼 words
  ('什么', '什麼'),
  ('怎么', '怎麼'),

  -- 处/處 words
  ('处所', '處所'),
  ('办事处', '辦事處'),
  ('好处', '好處'),
  ('到处', '到處'),

  -- 着/著 words
  ('跟着', '跟著'),
  ('看着', '看著')
)
UPDATE readings r
SET context_words = (
  SELECT ARRAY(
    SELECT COALESCE(wm.trad, w)
    FROM unnest(r.context_words) AS w
    LEFT JOIN word_mappings wm ON wm.simp = w
  )
)
WHERE context_words IS NOT NULL
  AND array_length(context_words, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(r.context_words) AS w
    WHERE w IN (SELECT simp FROM word_mappings)
  );

-- ============================================
-- Verification: Should return 0 rows
-- ============================================
-- Run after migration:
-- SELECT r.id, e.trad, r.context_words
-- FROM readings r
-- JOIN entries e ON r.entry_id = e.id
-- WHERE r.context_words IS NOT NULL
--   AND array_to_string(r.context_words, ',') ~ '为|处|着|么';
