-- Allow authenticated users to insert word pairs (for seeding)
-- Version: 20260110000003

CREATE POLICY "Authenticated users can insert" ON word_pairs
  FOR INSERT TO authenticated
  WITH CHECK (true);
