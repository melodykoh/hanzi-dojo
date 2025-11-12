-- Reset Practice Data - Simplified Version
-- Run in Supabase Dashboard SQL Editor
--
-- ⚠️  WARNING: This PERMANENTLY deletes practice history!

-- =============================================================================
-- STEP 1: FIND YOUR KID ID
-- =============================================================================

-- Option A: List all kids (if you're the only user)
SELECT 
  id,
  name,
  belt_rank,
  owner_id,
  created_at
FROM kids
ORDER BY created_at DESC;

-- Copy the 'id' value from your kid row

-- =============================================================================
-- STEP 2: CHECK WHAT WILL BE DELETED
-- =============================================================================

-- Replace 'YOUR-KID-ID-HERE' with the id from Step 1

SELECT 
  (SELECT COUNT(*) FROM practice_events WHERE kid_id = 'YOUR-KID-ID-HERE') as events_to_delete,
  (SELECT COUNT(*) FROM practice_state WHERE kid_id = 'YOUR-KID-ID-HERE') as states_to_delete,
  (SELECT COUNT(*) FROM entries WHERE kid_id = 'YOUR-KID-ID-HERE') as entries_kept;

-- =============================================================================
-- STEP 3: DELETE PRACTICE DATA (PERMANENT!)
-- =============================================================================

-- Replace 'YOUR-KID-ID-HERE' with your actual kid_id from Step 1

-- Delete practice events
DELETE FROM practice_events
WHERE kid_id = 'YOUR-KID-ID-HERE';

-- Delete practice state  
DELETE FROM practice_state
WHERE kid_id = 'YOUR-KID-ID-HERE';

-- =============================================================================
-- STEP 4: VERIFY DELETION
-- =============================================================================

-- Should both return 0
SELECT COUNT(*) as remaining_events FROM practice_events WHERE kid_id = 'YOUR-KID-ID-HERE';
SELECT COUNT(*) as remaining_states FROM practice_state WHERE kid_id = 'YOUR-KID-ID-HERE';

-- Your entries should still be there
SELECT COUNT(*) as entries_still_here FROM entries WHERE kid_id = 'YOUR-KID-ID-HERE';
