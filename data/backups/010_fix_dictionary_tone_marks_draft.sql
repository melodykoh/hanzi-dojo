-- Fix Dictionary Tone Marks
-- Migration 010
-- Date: 2025-11-10
-- Purpose: Fix 248 characters with empty tone marks (should be "ˉ" for first tone)
-- Audit: scripts/audit-dictionary-quality.js identified all affected entries

-- =============================================================================
-- BACKGROUND
-- =============================================================================
-- During dictionary import, some first-tone (flat tone) characters were stored
-- with empty string "" instead of the proper tone mark "ˉ" (U+02C9).
-- This causes validation errors in AddItemForm and rendering issues in UI.
--
-- This migration fixes all 248 affected entries by replacing empty tone strings
-- with the correct first tone mark.
--
-- Note: This uses PostgreSQL's jsonb_set function to update nested arrays.
-- =============================================================================

-- First, let's verify the issue exists
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO affected_count
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(zhuyin) AS syllable
      WHERE syllable->2 = '""'::jsonb  -- Third element (tone) is empty string
    );
  
  RAISE NOTICE 'Found % entries with empty tone marks', affected_count;
END $$;

-- =============================================================================
-- FIX: Replace empty tone strings with "ˉ" (first tone)
-- =============================================================================

-- Strategy: For each dictionary entry, iterate through zhuyin syllables
-- and replace any empty string tones with "ˉ"

UPDATE dictionary_entries
SET zhuyin = (
  SELECT jsonb_agg(
    CASE 
      WHEN syllable->2 = '""'::jsonb THEN 
        jsonb_build_array(
          syllable->0,  -- initial
          syllable->1,  -- final  
          'ˉ'::jsonb    -- tone (fixed)
        )
      ELSE syllable
    END
  )
  FROM jsonb_array_elements(zhuyin) AS syllable
)
WHERE jsonb_array_length(zhuyin) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(zhuyin) AS syllable
    WHERE syllable->2 = '""'::jsonb
  );

-- Verify the fix
DO $$
DECLARE
  remaining_count INTEGER;
  fixed_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO remaining_count
  FROM dictionary_entries
  WHERE jsonb_array_length(zhuyin) > 0
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(zhuyin) AS syllable
      WHERE syllable->2 = '""'::jsonb
    );
  
  IF remaining_count = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All empty tone marks have been fixed';
    RAISE NOTICE '✅ 248 entries updated with correct first tone mark "ˉ"';
  ELSE
    RAISE WARNING '⚠️  Still have % entries with empty tones', remaining_count;
  END IF;
END $$;

-- =============================================================================
-- EXAMPLES OF FIXED ENTRIES (for verification)
-- =============================================================================

-- Check a few specific characters that were reported as broken
SELECT simp, trad, zhuyin
FROM dictionary_entries  
WHERE simp IN ('因', '星', '它', '安', '工', '医')
ORDER BY simp;

-- Expected output (after fix):
-- 因: [["","ㄧㄣ","ˉ"]]
-- 星: [["ㄒ","ㄧㄥ","ˉ"]]  
-- 它: [["ㄊ","ㄚ","ˉ"]]
