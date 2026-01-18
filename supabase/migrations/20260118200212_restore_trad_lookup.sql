-- Migration: Restore Traditional Character Lookup
-- Date: 2026-01-18
-- Issue: #42 - Characters show "not found" when searched by traditional form
--
-- Root Cause:
--   Migration 007 correctly added `OR trad = search_char` to the lookup.
--   Migration 017 (Security Advisor Fixes) accidentally reverted this when
--   adding SET search_path, leaving only `WHERE simp = search_char`.
--
-- Fix: Restore the OR trad = search_char clause.
--
-- Affected characters:
--   - 處 (trad) → should find entry where simp='处', trad='處'
--   - 為 (trad) → should find entry where simp='为', trad='為'

BEGIN;

-- ============================================================================
-- Fix: lookup_dictionary_entry to search BOTH simp AND trad columns
-- ============================================================================
-- IMPORTANT: Keep SET search_path from migration 017 (security fix)
-- IMPORTANT: Add OR trad = search_char (from migration 007, accidentally lost)

CREATE OR REPLACE FUNCTION lookup_dictionary_entry(search_char TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  entry_record RECORD;
  confusions_zhuyin JSON;
  confusions_trad JSON;
BEGIN
  -- Look up the dictionary entry by EITHER simplified OR traditional form
  -- FIX: Include OR trad = search_char (was lost in migration 017)
  SELECT
    id,
    simp,
    trad,
    zhuyin,
    pinyin,
    zhuyin_variants,
    meanings,
    frequency_rank
  INTO entry_record
  FROM dictionary_entries
  WHERE simp = search_char OR trad = search_char;

  -- If not found, return null
  IF NOT FOUND THEN
    RETURN json_build_object(
      'found', false,
      'entry', NULL,
      'confusions', NULL
    );
  END IF;

  -- Look up confusion mappings for Zhuyin drill
  SELECT confusions INTO confusions_zhuyin
  FROM dictionary_confusions
  WHERE entry_id = entry_record.id AND drill = 'zhuyin';

  -- Look up confusion mappings for Traditional drill
  SELECT confusions INTO confusions_trad
  FROM dictionary_confusions
  WHERE entry_id = entry_record.id AND drill = 'trad';

  -- Build the result JSON
  result := json_build_object(
    'found', true,
    'entry', json_build_object(
      'id', entry_record.id,
      'simp', entry_record.simp,
      'trad', entry_record.trad,
      'zhuyin', entry_record.zhuyin,
      'pinyin', entry_record.pinyin,
      'zhuyin_variants', entry_record.zhuyin_variants,
      'meanings', entry_record.meanings,
      'frequency_rank', entry_record.frequency_rank
    ),
    'confusions', json_build_object(
      'zhuyin', confusions_zhuyin,
      'trad', confusions_trad
    )
  );

  RETURN result;
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  chu_result JSON;
  wei_result JSON;
BEGIN
  -- Test with traditional character 處
  SELECT lookup_dictionary_entry('處') INTO chu_result;
  IF (chu_result->>'found')::boolean THEN
    RAISE NOTICE 'SUCCESS: 處 (traditional) found → simp=%', chu_result->'entry'->>'simp';
  ELSE
    RAISE EXCEPTION 'FAILED: 處 (traditional) not found';
  END IF;

  -- Test with traditional character 為
  SELECT lookup_dictionary_entry('為') INTO wei_result;
  IF (wei_result->>'found')::boolean THEN
    RAISE NOTICE 'SUCCESS: 為 (traditional) found → simp=%', wei_result->'entry'->>'simp';
  ELSE
    RAISE EXCEPTION 'FAILED: 為 (traditional) not found';
  END IF;

  RAISE NOTICE 'All traditional character lookups working correctly';
END $$;

COMMIT;
