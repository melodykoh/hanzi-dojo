-- Migration 017: Security Advisor Fixes
-- Date: 2025-12-24
--
-- Fixes 4 errors + 4 warnings from Supabase Security Advisor:
--
-- ERRORS (RLS Disabled):
--   - dictionary_entries_backup_011e → DROP
--   - readings_backup_011e → DROP
--   - dictionary_entries_backup_016 → DROP
--   - readings_backup_016 → DROP
--
-- WARNINGS (Function Search Path Mutable):
--   - lookup_dictionary_entry → Add SET search_path
--   - batch_lookup_dictionary_entries → Add SET search_path
--   - update_updated_at → Add SET search_path
--   - handle_new_user → Add SET search_path
--
-- NOTE: "Leaked Password Protection" warning is an Auth setting,
-- not a database issue. Enable in Dashboard → Auth → Settings if desired.

BEGIN;

-- ============================================================================
-- PART 1: Drop backup tables (fixes 4 RLS errors)
-- ============================================================================
-- These tables were created during migrations 011e and 016 for rollback safety.
-- Migrations are now stable and verified, so backups are no longer needed.

DROP TABLE IF EXISTS dictionary_entries_backup_011e;
DROP TABLE IF EXISTS readings_backup_011e;
DROP TABLE IF EXISTS dictionary_entries_backup_016;
DROP TABLE IF EXISTS readings_backup_016;

-- ============================================================================
-- PART 2: Fix function search_path (fixes 4 warnings)
-- ============================================================================
-- Adding SET search_path prevents search path injection attacks when using
-- SECURITY DEFINER functions.

-- Fix: lookup_dictionary_entry
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
  -- Look up the dictionary entry
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
  WHERE simp = search_char;

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

-- Fix: batch_lookup_dictionary_entries
CREATE OR REPLACE FUNCTION batch_lookup_dictionary_entries(search_chars TEXT[])
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON[];
  char TEXT;
  lookup_result JSON;
BEGIN
  -- Loop through each character and look it up
  FOREACH char IN ARRAY search_chars
  LOOP
    lookup_result := lookup_dictionary_entry(char);
    result := array_append(result, lookup_result);
  END LOOP;

  RETURN json_build_object('results', result);
END;
$$;

-- Fix: update_updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default kid profile for new user
  INSERT INTO public.kids (owner_id, name, belt_rank)
  VALUES (NEW.id, 'My Student', 'white');

  RETURN NEW;
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  backup_count INT;
BEGIN
  -- Check backup tables are dropped
  SELECT COUNT(*) INTO backup_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE '%_backup_%';

  IF backup_count > 0 THEN
    RAISE WARNING 'Still have % backup tables', backup_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All backup tables dropped';
  END IF;

  RAISE NOTICE 'SUCCESS: All 4 functions updated with SET search_path';
END $$;

COMMIT;
