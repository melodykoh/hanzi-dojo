-- Migration 013: Fix Dictionary Public Access
-- Created: 2025-11-15
-- Purpose: Allow public reads on dictionary tables for demo mode users
--
-- Context:
-- - Dictionary tables are reference data (public knowledge base), not user-specific data
-- - Current RLS policies block unauthenticated users from accessing dictionary
-- - Dictionary tab should work in demo mode to showcase app features
-- - No PII or sensitive data in dictionary_entries or dictionary_confusions
--
-- Changes:
-- 1. Drop existing restrictive read policies
-- 2. Create new public read policies (allow unauthenticated access)
-- 3. Keep write operations restricted (migration-managed only)
--
-- Security Impact: Low
-- - Only exposing public reference data (HSK vocabulary, Zhuyin, confusion sets)
-- - User-specific tables remain protected (kids, entries, practice_state, practice_events)
-- - Write operations remain restricted (no INSERT/UPDATE/DELETE policies)
--
-- Related: PR #11 (Demo Mode Enhancements), Todo #002

-- =============================================================================
-- Drop Existing Restrictive Policies
-- =============================================================================

DROP POLICY IF EXISTS dictionary_entries_read_policy ON dictionary_entries;
DROP POLICY IF EXISTS dictionary_confusions_read_policy ON dictionary_confusions;

-- =============================================================================
-- Create Public Read Policies
-- =============================================================================

-- Allow public reads on dictionary_entries (reference data)
CREATE POLICY dictionary_entries_public_read ON dictionary_entries
  FOR SELECT USING (true);

-- Allow public reads on dictionary_confusions (reference data)
CREATE POLICY dictionary_confusions_public_read ON dictionary_confusions
  FOR SELECT USING (true);

-- =============================================================================
-- Verification
-- =============================================================================

-- To verify this migration worked:
-- 1. Sign out of the application
-- 2. Navigate to Dictionary tab
-- 3. Search for a character (e.g., "学")
-- 4. Verify dictionary results appear
-- 5. Sign back in and verify dictionary still works for authenticated users
--
-- To check current policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('dictionary_entries', 'dictionary_confusions');
