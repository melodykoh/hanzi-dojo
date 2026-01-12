-- 20260111000004_add_word_pairs_unique.sql
-- Add unique constraint on word_pairs.word to enable ON CONFLICT handling

-- First, remove duplicates (keep the earliest created_at)
DELETE FROM word_pairs a USING word_pairs b
WHERE a.created_at > b.created_at AND a.word = b.word;

-- Now add the unique constraint
ALTER TABLE word_pairs ADD CONSTRAINT word_pairs_word_unique UNIQUE (word);
