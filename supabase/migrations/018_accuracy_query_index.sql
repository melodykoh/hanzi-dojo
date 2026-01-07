-- Migration 018: Add composite index for accuracy timeframe queries
-- Date: 2026-01-07
--
-- Performance improvement for getAccuracyForTimeframe() which filters by:
--   kid_id, drill, attempt_index, created_at
--
-- Current index: idx_practice_events_kid ON (kid_id, created_at DESC)
-- Problem: Cannot efficiently filter by drill and attempt_index
-- Impact: Query degradation at 10k+ rows (2-5 second queries)
--
-- This index supports the query pattern:
--   SELECT is_correct FROM practice_events
--   WHERE kid_id = ? AND drill = ? AND attempt_index = 1 AND created_at >= ?
--
-- Reference: todos/053-ready-p2-missing-composite-index-accuracy.md

-- Use CONCURRENTLY to avoid locking the table during index creation
-- Note: CONCURRENTLY cannot run inside a transaction block
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_practice_events_accuracy
ON practice_events(kid_id, drill, attempt_index, created_at DESC);

-- Verification: Run this after migration to confirm index exists
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'practice_events';
