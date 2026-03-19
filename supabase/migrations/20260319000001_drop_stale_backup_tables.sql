-- Migration: Drop stale backup tables (Security Advisor fix)
-- Date: 2026-03-19
--
-- Fixes 3 RLS_DISABLED_IN_PUBLIC errors from Supabase Security Advisor:
--   - _backup_simplified_context_words_20260216
--   - _backup_readings_context_words_20260216
--   - _backup_readings_pipeline
--
-- These backup tables were created manually during migrations 20260215/20260216
-- for rollback safety. The migrations are stable and verified, so the backups
-- are no longer needed. Same pattern as migration 017 which dropped earlier backups.

BEGIN;

DROP TABLE IF EXISTS _backup_simplified_context_words_20260216;
DROP TABLE IF EXISTS _backup_readings_context_words_20260216;
DROP TABLE IF EXISTS _backup_readings_pipeline;

-- Verification: ensure no backup tables remain
DO $$
DECLARE
  backup_count INT;
BEGIN
  SELECT COUNT(*) INTO backup_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE '%_backup_%';

  IF backup_count > 0 THEN
    RAISE WARNING 'Still have % backup table(s) in public schema', backup_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All backup tables dropped — no more RLS warnings';
  END IF;
END $$;

COMMIT;
