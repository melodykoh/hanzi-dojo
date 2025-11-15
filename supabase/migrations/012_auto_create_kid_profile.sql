-- Migration 012: Auto-create kid profile on user signup
-- Created: 2025-11-13
-- Purpose: Automatically create a default kid profile when new users sign up
--          Fixes bug where users clicking email confirmation link don't get profiles

-- Create trigger function to auto-create kid profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default kid profile for new user
  INSERT INTO public.kids (owner_id, name, belt_rank)
  VALUES (NEW.id, 'My Student', 'white');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Rollback instructions:
-- To remove this trigger and function:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS handle_new_user();
