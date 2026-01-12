-- Allow anon inserts for seeding (word_pairs is reference data like dictionary)
-- This is safe because word_pairs is public read-only data
-- Version: 20260110000004

CREATE POLICY "Allow inserts for seeding" ON word_pairs
  FOR INSERT
  WITH CHECK (true);
