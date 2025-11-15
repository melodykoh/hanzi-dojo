-- Check which of the 37 characters is missing from dictionary
-- Run this in Supabase Dashboard SQL Editor

WITH target_chars AS (
  SELECT unnest(ARRAY[
    '行', '重', '还', '为', '给', '都', '没', '教', '正', '更',
    '传', '供', '便', '假', '几', '切', '划', '地', '场', '将',
    '干', '应', '弹', '扫', '把', '担', '相', '省', '种', '系',
    '结', '觉', '角', '调', '量', '什'
  ]) AS char
)
SELECT
  char,
  CASE
    WHEN EXISTS (SELECT 1 FROM dictionary_entries WHERE simp = char) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM target_chars
ORDER BY char;
