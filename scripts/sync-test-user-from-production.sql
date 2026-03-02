-- ============================================================================
-- Sync Test User from Production
-- ============================================================================
-- Copies learned characters (entries + readings) from production kid to test
-- kid. Additive — only inserts characters the test kid doesn't already have.
--
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run: Yes (skips duplicates via ON CONFLICT).
--
-- ⚠️  MULTI-CHILD (V2): Picks kid with most entries per account.
--     Change to filter by name when multiple children exist.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_prod_kid_id  UUID;
  v_test_kid_id  UUID;
  v_test_user_id UUID;
  v_count        INT;
BEGIN
  -- Resolve production kid (most entries)
  SELECT k.id INTO v_prod_kid_id
  FROM kids k
  JOIN auth.users u ON u.id = k.owner_id
  LEFT JOIN entries e ON e.kid_id = k.id
  WHERE u.email = 'melodykoh0818@gmail.com'
  GROUP BY k.id ORDER BY count(e.id) DESC LIMIT 1;

  -- Resolve test kid (most entries)
  SELECT k.id, k.owner_id INTO v_test_kid_id, v_test_user_id
  FROM kids k
  JOIN auth.users u ON u.id = k.owner_id
  LEFT JOIN entries e ON e.kid_id = k.id
  WHERE u.email = 'test@hanzidojo.local'
  GROUP BY k.id, k.owner_id ORDER BY count(e.id) DESC LIMIT 1;

  IF v_prod_kid_id IS NULL THEN RAISE EXCEPTION 'Production kid not found'; END IF;
  IF v_test_kid_id IS NULL THEN RAISE EXCEPTION 'Test kid not found'; END IF;

  -- Map old entry IDs → new ones (only for entries test kid doesn't have yet)
  CREATE TEMP TABLE _map (old_id UUID, new_id UUID) ON COMMIT DROP;

  INSERT INTO _map (old_id, new_id)
  SELECT e.id, gen_random_uuid()
  FROM entries e
  WHERE e.kid_id = v_prod_kid_id
    AND NOT EXISTS (
      SELECT 1 FROM entries t
      WHERE t.kid_id = v_test_kid_id AND t.simp = e.simp AND t.trad = e.trad
    );

  -- Copy entries
  INSERT INTO entries (id, owner_id, kid_id, simp, trad, type, applicable_drills,
                       grade_label, school_week, created_at, updated_at)
  SELECT m.new_id, v_test_user_id, v_test_kid_id, e.simp, e.trad, e.type,
         e.applicable_drills, e.grade_label, e.school_week, e.created_at, e.updated_at
  FROM entries e
  JOIN _map m ON m.old_id = e.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Entries copied: %', v_count;

  -- Copy readings for those entries, tracking old→new IDs for locked_reading_id
  CREATE TEMP TABLE _rmap (old_id UUID, new_id UUID) ON COMMIT DROP;

  INSERT INTO _rmap (old_id, new_id)
  SELECT r.id, gen_random_uuid()
  FROM readings r JOIN _map m ON m.old_id = r.entry_id;

  INSERT INTO readings (id, entry_id, zhuyin, pinyin, sense, context_words, audio_url, created_at)
  SELECT rm.new_id, m.new_id, r.zhuyin, r.pinyin, r.sense,
         r.context_words, r.audio_url, r.created_at
  FROM readings r
  JOIN _map m ON m.old_id = r.entry_id
  JOIN _rmap rm ON rm.old_id = r.id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Readings copied: %', v_count;

  -- Fix locked_reading_id on entries that had one
  UPDATE entries e
  SET locked_reading_id = rm.new_id
  FROM _map m
  JOIN entries prod_e ON prod_e.id = m.old_id
  JOIN _rmap rm ON rm.old_id = prod_e.locked_reading_id
  WHERE e.id = m.new_id
    AND prod_e.locked_reading_id IS NOT NULL;
END $$;

COMMIT;
