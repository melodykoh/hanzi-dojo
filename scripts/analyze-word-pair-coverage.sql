-- =============================================================================
-- Word Pair Coverage Analysis for Drill C
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================================================

-- 1. Total word pairs available
SELECT 'Total word pairs' AS metric, COUNT(*) AS value FROM word_pairs;

-- 2. Your kids and their entries
SELECT
  k.id AS kid_id,
  k.name AS kid_name,
  COUNT(e.id) AS saved_characters
FROM kids k
LEFT JOIN entries e ON e.kid_id = k.id
GROUP BY k.id, k.name;

-- 3. MAIN ANALYSIS: For each kid, count eligible word pairs
WITH kid_chars AS (
  SELECT
    k.id AS kid_id,
    k.name AS kid_name,
    e.trad
  FROM kids k
  JOIN entries e ON e.kid_id = k.id
),
pair_coverage AS (
  SELECT
    kc.kid_id,
    kc.kid_name,
    wp.id AS pair_id,
    wp.word,
    wp.char1,
    wp.char2,
    EXISTS (SELECT 1 FROM kid_chars kc2 WHERE kc2.kid_id = kc.kid_id AND kc2.trad = wp.char1) AS char1_known,
    EXISTS (SELECT 1 FROM kid_chars kc2 WHERE kc2.kid_id = kc.kid_id AND kc2.trad = wp.char2) AS char2_known
  FROM (SELECT DISTINCT kid_id, kid_name FROM kid_chars) kc
  CROSS JOIN word_pairs wp
)
SELECT
  kid_id,
  kid_name,
  COUNT(*) FILTER (WHERE char1_known OR char2_known) AS eligible_pairs,
  COUNT(*) FILTER (WHERE char1_known AND char2_known) AS both_chars_known,
  COUNT(*) FILTER (WHERE char1_known AND NOT char2_known) AS only_char1_known,
  COUNT(*) FILTER (WHERE NOT char1_known AND char2_known) AS only_char2_known
FROM pair_coverage
GROUP BY kid_id, kid_name;

-- 4. Character-level coverage: Which of your saved chars have word pairs?
WITH kid_chars AS (
  SELECT e.trad, k.name AS kid_name
  FROM entries e
  JOIN kids k ON k.id = e.kid_id
)
SELECT
  kc.kid_name,
  kc.trad AS character,
  COUNT(DISTINCT wp.id) AS word_pair_count,
  STRING_AGG(DISTINCT wp.word, ', ' ORDER BY wp.word) AS sample_words
FROM kid_chars kc
LEFT JOIN word_pairs wp ON wp.char1 = kc.trad OR wp.char2 = kc.trad
GROUP BY kc.kid_name, kc.trad
ORDER BY word_pair_count DESC;

-- 5. Characters WITHOUT any word pairs (gaps to potentially fill)
WITH kid_chars AS (
  SELECT e.trad, k.name AS kid_name
  FROM entries e
  JOIN kids k ON k.id = e.kid_id
)
SELECT
  kc.kid_name,
  kc.trad AS character_without_pairs
FROM kid_chars kc
WHERE NOT EXISTS (
  SELECT 1 FROM word_pairs wp
  WHERE wp.char1 = kc.trad OR wp.char2 = kc.trad
)
ORDER BY kc.kid_name, kc.trad;

-- 6. Sample of eligible word pairs for your kid
WITH kid_chars AS (
  SELECT e.trad FROM entries e JOIN kids k ON k.id = e.kid_id LIMIT 1
)
SELECT
  wp.word,
  wp.char1,
  CASE WHEN EXISTS (SELECT 1 FROM kid_chars WHERE trad = wp.char1) THEN '✓' ELSE '✗' END AS char1_known,
  wp.char2,
  CASE WHEN EXISTS (SELECT 1 FROM kid_chars WHERE trad = wp.char2) THEN '✓' ELSE '✗' END AS char2_known,
  wp.category
FROM word_pairs wp
WHERE EXISTS (SELECT 1 FROM kid_chars WHERE trad = wp.char1)
   OR EXISTS (SELECT 1 FROM kid_chars WHERE trad = wp.char2)
LIMIT 20;
