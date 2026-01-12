-- 20260111000002_remove_word_pairs_anon_insert.sql
-- Remove dangerous anonymous insert policy
-- Seeding should use service role key instead

DROP POLICY IF EXISTS "Allow inserts for seeding" ON word_pairs;
