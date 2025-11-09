-- Hanzi Dojo Initial Schema Migration
-- Version: 001
-- Created: 2025-11-03
-- Description: Core tables for Hanzi Dojo including dictionary, practice state, and user data

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE entry_type AS ENUM ('char', 'word');
CREATE TYPE practice_drill AS ENUM ('zhuyin', 'trad');

-- =============================================================================
-- KIDS TABLE
-- =============================================================================

CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  belt_rank TEXT DEFAULT 'white',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- V1: One kid per parent (auto-created on first login)
-- V2+: Multiple kids per parent supported

CREATE INDEX idx_kids_owner ON kids(owner_id);

-- =============================================================================
-- ENTRIES TABLE (User's Learning Items)
-- =============================================================================

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  
  -- Character data
  simp TEXT NOT NULL,
  trad TEXT NOT NULL,
  type entry_type DEFAULT 'char',
  
  -- Pronunciation (references readings table)
  locked_reading_id UUID, -- Set when user selects specific reading for multi-pronunciation chars
  
  -- Drill applicability (computed on insert based on simp != trad, etc.)
  applicable_drills practice_drill[] NOT NULL DEFAULT '{}',
  
  -- Optional metadata
  grade_label TEXT,
  school_week TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT entries_unique_per_kid UNIQUE(kid_id, simp, trad)
);

CREATE INDEX idx_entries_owner ON entries(owner_id, created_at DESC);
CREATE INDEX idx_entries_kid ON entries(kid_id, created_at DESC);
CREATE INDEX idx_entries_simp ON entries(simp);
CREATE INDEX idx_entries_trad ON entries(trad);

-- =============================================================================
-- READINGS TABLE (Pronunciation Data per Entry)
-- =============================================================================

CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  
  -- Pronunciation data
  zhuyin JSONB NOT NULL, -- Array of syllables: [[initial, final, tone], ...]
  pinyin TEXT,
  
  -- Context for multi-reading characters
  sense TEXT, -- e.g., "worried" vs "asleep" for 着
  context_words TEXT[], -- e.g., ["着急", "睡着"]
  
  -- Audio (future)
  audio_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_readings_entry ON readings(entry_id);

-- =============================================================================
-- PRACTICE STATE TABLE (Per Kid + Entry + Drill Counters)
-- =============================================================================

CREATE TABLE practice_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  drill practice_drill NOT NULL,
  
  -- Scoring counters
  first_try_success_count INT DEFAULT 0,
  second_try_success_count INT DEFAULT 0,
  consecutive_miss_count INT DEFAULT 0,
  
  -- Timestamps
  last_attempt_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT practice_state_unique_per_drill UNIQUE(kid_id, entry_id, drill)
);

CREATE INDEX idx_practice_state_kid_drill ON practice_state(kid_id, drill, last_attempt_at);
CREATE INDEX idx_practice_state_entry ON practice_state(entry_id);

-- =============================================================================
-- PRACTICE EVENTS TABLE (Immutable Log of Every Attempt)
-- =============================================================================

CREATE TABLE practice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  drill practice_drill NOT NULL,
  
  -- Attempt details
  attempt_index INT NOT NULL CHECK (attempt_index IN (1, 2)),
  is_correct BOOLEAN NOT NULL,
  points_awarded NUMERIC(3,1) NOT NULL CHECK (points_awarded IN (0.0, 0.5, 1.0)),
  
  -- Context
  chosen_option JSONB, -- The option the child selected
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practice_events_kid ON practice_events(kid_id, created_at DESC);
CREATE INDEX idx_practice_events_entry ON practice_events(entry_id, created_at DESC);

-- =============================================================================
-- DICTIONARY ENTRIES TABLE (Canonical Character Mappings)
-- =============================================================================

CREATE TABLE dictionary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Character forms
  simp TEXT NOT NULL,
  trad TEXT NOT NULL,
  
  -- Primary pronunciation (most common reading)
  zhuyin JSONB NOT NULL, -- [[initial, final, tone], ...]
  pinyin TEXT,
  
  -- Additional readings for multi-pronunciation characters
  zhuyin_variants JSONB, -- Array of {zhuyin, pinyin, context_words, meanings}
  
  -- Metadata
  meanings TEXT[], -- English translations
  frequency_rank INT, -- Lower = more common
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on simplified form (one entry per simplified character/word)
  CONSTRAINT dictionary_entries_simp_unique UNIQUE(simp)
);

CREATE INDEX idx_dict_entries_simp ON dictionary_entries(simp);
CREATE INDEX idx_dict_entries_trad ON dictionary_entries(trad);
CREATE INDEX idx_dict_entries_freq ON dictionary_entries(frequency_rank);

-- =============================================================================
-- DICTIONARY CONFUSIONS TABLE (Drill Distractor Mappings)
-- =============================================================================

CREATE TABLE dictionary_confusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  drill practice_drill NOT NULL,
  
  -- Confusion data (JSON arrays of similar characters/pronunciations)
  confusions JSONB NOT NULL, -- Structure depends on drill type
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT dictionary_confusions_unique_per_drill UNIQUE(entry_id, drill)
);

CREATE INDEX idx_dict_confusions_entry ON dictionary_confusions(entry_id, drill);

-- =============================================================================
-- DICTIONARY MISSING TABLE (Log of Lookup Failures)
-- =============================================================================

CREATE TABLE dictionary_missing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What the parent tried to add
  simp TEXT NOT NULL,
  trad TEXT,
  zhuyin JSONB,
  pinyin TEXT,
  
  -- Who reported it
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dict_missing_simp ON dictionary_missing(simp, created_at DESC);
CREATE INDEX idx_dict_missing_reporter ON dictionary_missing(reported_by);

-- =============================================================================
-- TEST WEEKS TABLE (Optional: School Test Prep)
-- =============================================================================

CREATE TABLE test_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- e.g., "Week 5 Test"
  test_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_weeks_owner ON test_weeks(owner_id, test_date DESC);

-- =============================================================================
-- TEST WEEK ITEMS TABLE (Characters/Words in a Test)
-- =============================================================================

CREATE TABLE test_week_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_week_id UUID NOT NULL REFERENCES test_weeks(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT test_week_items_unique UNIQUE(test_week_id, entry_id)
);

CREATE INDEX idx_test_week_items_test ON test_week_items(test_week_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_week_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_missing ENABLE ROW LEVEL SECURITY;

-- Dictionary tables are public (read-only for authenticated users)
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary_confusions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Kids: users can only access their own kids
CREATE POLICY kids_owner_policy ON kids
  FOR ALL USING (owner_id = auth.uid());

-- Entries: users can only access their own entries
CREATE POLICY entries_owner_policy ON entries
  FOR ALL USING (owner_id = auth.uid());

-- Readings: users can only access readings for their entries
CREATE POLICY readings_owner_policy ON readings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM entries WHERE entries.id = readings.entry_id AND entries.owner_id = auth.uid()
    )
  );

-- Practice state: users can only access practice state for their kids
CREATE POLICY practice_state_owner_policy ON practice_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM kids WHERE kids.id = practice_state.kid_id AND kids.owner_id = auth.uid()
    )
  );

-- Practice events: users can only access events for their kids
CREATE POLICY practice_events_owner_policy ON practice_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM kids WHERE kids.id = practice_events.kid_id AND kids.owner_id = auth.uid()
    )
  );

-- Test weeks: users can only access their own test weeks
CREATE POLICY test_weeks_owner_policy ON test_weeks
  FOR ALL USING (owner_id = auth.uid());

-- Test week items: users can only access items in their test weeks
CREATE POLICY test_week_items_owner_policy ON test_week_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM test_weeks WHERE test_weeks.id = test_week_items.test_week_id AND test_weeks.owner_id = auth.uid()
    )
  );

-- Dictionary missing: users can only access their own reports
CREATE POLICY dictionary_missing_owner_policy ON dictionary_missing
  FOR ALL USING (reported_by = auth.uid());

-- Dictionary entries: read-only for authenticated users
CREATE POLICY dictionary_entries_read_policy ON dictionary_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Dictionary confusions: read-only for authenticated users
CREATE POLICY dictionary_confusions_read_policy ON dictionary_confusions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- TRIGGERS (Auto-update timestamps)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER practice_state_updated_at BEFORE UPDATE ON practice_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER kids_updated_at BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER dictionary_entries_updated_at BEFORE UPDATE ON dictionary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE kids IS 'Child profiles - V1 supports one per parent, schema ready for multi-child';
COMMENT ON TABLE entries IS 'Characters/words the child is learning - character-first with word support';
COMMENT ON TABLE readings IS 'Pronunciation data for entries - supports multi-reading characters';
COMMENT ON TABLE practice_state IS 'Per (kid, entry, drill) familiarity counters - drives queue and known status';
COMMENT ON TABLE practice_events IS 'Immutable log of every drill attempt - analytics and debugging';
COMMENT ON TABLE dictionary_entries IS 'Canonical character mappings - source of truth for auto-fill';
COMMENT ON TABLE dictionary_confusions IS 'Curated confusion sets for drill distractor generation';
COMMENT ON TABLE dictionary_missing IS 'Log of dictionary lookup failures - guides seed expansion';
COMMENT ON TABLE test_weeks IS 'Optional test preparation sets';
COMMENT ON TABLE test_week_items IS 'Characters/words in a test week';
