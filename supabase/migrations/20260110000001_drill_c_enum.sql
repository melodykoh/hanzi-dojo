-- Drill C: Word Match - Part 1: Extend enum
-- Version: 019a
-- Must be in separate migration from usage due to PostgreSQL enum transaction rules

ALTER TYPE practice_drill ADD VALUE 'word_match';
