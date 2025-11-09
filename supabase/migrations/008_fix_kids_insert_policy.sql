-- Fix kids table RLS policy to allow INSERT operations
-- Issue: Original policy only had USING clause, which doesn't apply to INSERTs
-- Solution: Add WITH CHECK clause to validate owner_id on INSERT

-- Drop existing policy
DROP POLICY IF EXISTS kids_owner_policy ON kids;

-- Recreate with both USING (for SELECT/UPDATE/DELETE) and WITH CHECK (for INSERT/UPDATE)
CREATE POLICY kids_owner_policy ON kids
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- This allows authenticated users to:
-- - INSERT new kid records where owner_id = their auth.uid()
-- - SELECT/UPDATE/DELETE only their own kid records
