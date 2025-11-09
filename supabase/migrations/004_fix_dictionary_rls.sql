-- Fix dictionary RLS policies to allow anonymous reads
-- Dictionary is reference data and should be publicly readable

-- Drop existing restrictive policies
DROP POLICY IF EXISTS dictionary_entries_read_policy ON dictionary_entries;
DROP POLICY IF EXISTS dictionary_confusions_read_policy ON dictionary_confusions;

-- Create new public read policies
CREATE POLICY dictionary_entries_public_read ON dictionary_entries
  FOR SELECT USING (true);

CREATE POLICY dictionary_confusions_public_read ON dictionary_confusions
  FOR SELECT USING (true);

-- Dictionary entries can only be modified by service role (not through client)
-- No INSERT/UPDATE/DELETE policies means only service role can modify
