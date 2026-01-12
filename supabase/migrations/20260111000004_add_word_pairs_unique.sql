-- 20260111000004_add_word_pairs_unique.sql
-- Add unique constraint on word_pairs.word to enable ON CONFLICT handling

ALTER TABLE word_pairs ADD CONSTRAINT word_pairs_word_unique UNIQUE (word);
