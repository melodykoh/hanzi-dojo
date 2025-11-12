-- Reset Practice Data for Your Kid Profile
-- Run this in Supabase Dashboard SQL Editor
-- 
-- ⚠️  WARNING: This PERMANENTLY deletes all practice history!
-- Your character entries (Entry Catalog) will NOT be affected.
--
-- What gets deleted:
--   - practice_events (all attempt history)
--   - practice_state (all familiarity counters, known status)
--
-- How to use:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Click "New query"
-- 3. Copy this entire file
-- 4. Click "Run"
-- 5. Check output - should show deleted record counts

-- =============================================================================
-- STEP 1: VERIFY YOUR KID ID
-- =============================================================================

-- Run this first to confirm your kid_id:
SELECT 
  k.id as kid_id,
  k.name,
  k.belt_rank,
  au.email,
  (SELECT COUNT(*) FROM practice_events WHERE kid_id = k.id) as event_count,
  (SELECT COUNT(*) FROM practice_state WHERE kid_id = k.id) as state_count,
  (SELECT COUNT(*) FROM entries WHERE kid_id = k.id) as entry_count
FROM kids k
JOIN auth.users au ON k.owner_id = au.id
WHERE au.id = auth.uid();  -- Only shows YOUR kid

-- Expected output:
-- kid_id: <UUID>
-- name: My Student (or your custom name)
-- belt_rank: white
-- email: <your-email>
-- event_count: <number> (will be deleted)
-- state_count: <number> (will be deleted)  
-- entry_count: <number> (will NOT be deleted - your characters stay!)

-- =============================================================================
-- STEP 2: DELETE PRACTICE DATA (PERMANENT!)
-- =============================================================================

-- If you're sure, uncomment and run the DELETE statements below:

/*

-- Delete practice events (attempt history)
DELETE FROM practice_events
WHERE kid_id IN (
  SELECT id FROM kids WHERE owner_id = auth.uid()
);

-- Delete practice state (familiarity counters)
DELETE FROM practice_state
WHERE kid_id IN (
  SELECT id FROM kids WHERE owner_id = auth.uid()
);

-- Verification: Check counts are now 0
SELECT 
  (SELECT COUNT(*) FROM practice_events WHERE kid_id IN (SELECT id FROM kids WHERE owner_id = auth.uid())) as remaining_events,
  (SELECT COUNT(*) FROM practice_state WHERE kid_id IN (SELECT id FROM kids WHERE owner_id = auth.uid())) as remaining_states;

-- Expected: remaining_events = 0, remaining_states = 0

*/

-- =============================================================================
-- AFTER RESET
-- =============================================================================

-- Your entries remain intact - verify:
SELECT COUNT(*) as entry_count FROM entries 
WHERE kid_id IN (SELECT id FROM kids WHERE owner_id = auth.uid());

-- Dashboard should show:
-- - All-Time Points: 0
-- - Last Practiced: Never
-- - Accuracy Streak: 0
-- - Characters Mastered: 0 of <entry_count>

-- You can now use "Launch Training" to start fresh practice!
