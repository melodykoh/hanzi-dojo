#!/usr/bin/env node
/**
 * Generate Migration 011g: Fill context_words for remaining 011c characters
 *
 * Migration 011c added zhuyin_variants to 101 characters but with empty context_words.
 * Migration 011e fixed 43 of those characters.
 * This migration fills context_words for the remaining 68 characters.
 */

const fs = require('fs');
const path = require('path');
const { pinyinToZhuyinArray } = require('./lib/pinyinToZhuyinMapping.cjs');
const { escapeSql } = require('./lib/sqlUtils.cjs');
const { loadDictionaries, buildCharacterLookup } = require('./lib/dictionaryLoader.cjs');
const { validateVariants } = require('./lib/validation.cjs');

const dataDir = path.join(__dirname, '..', 'data');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Validate required files exist
const REQUIRED_FILES = [
  'context_words_011c_remaining.json'
];

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Required file not found: ${filePath}`);
    process.exit(1);
  }
});

// Load researched context words
const contextResearch = JSON.parse(fs.readFileSync(path.join(dataDir, 'context_words_011c_remaining.json'), 'utf-8'));

// Load dictionaries using shared utility
const { v1: dictionaryV1, v2: dictionaryV2 } = loadDictionaries();
const dictLookup = buildCharacterLookup(dictionaryV1, dictionaryV2);

// Generate SQL
let sql = `-- Migration 011g: Fill context_words for remaining 011c characters
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Migration 011c added zhuyin_variants to 101 characters but with empty context_words.
-- Migration 011e fixed 43 of those (the malformed ones).
-- This migration fills context_words for the remaining 68 characters.
--
-- Source: data/context_words_011c_remaining.json

BEGIN;

`;

const chars = Object.keys(contextResearch.characters);
console.log(`Processing ${chars.length} characters...`);

for (const char of chars) {
  const data = contextResearch.characters[char];
  const dictEntry = dictLookup[char];

  if (!dictEntry) {
    console.error(`Character ${char} not found in dictionary!`);
    continue;
  }

  const variants = [];
  for (const [pinyin, pronData] of Object.entries(data.pronunciations)) {
    variants.push({
      pinyin,
      zhuyin: pinyinToZhuyinArray(pinyin),
      context_words: pronData.context_words || [],
      meanings: dictEntry.meanings || []
    });
  }

  // Validate JSONB structure before serialization
  try {
    validateVariants(variants, char);
  } catch (error) {
    console.error(`Validation failed for ${char}:`, error.message);
    throw error;
  }

  const variantsJson = JSON.stringify(variants);

  sql += `-- Character: ${char} (${dictEntry.trad})
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${escapeSql(char)}'
  AND trad = '${escapeSql(dictEntry.trad)}';

`;
}

sql += `
-- Verification
DO $$
DECLARE
  empty_context_count INT;
BEGIN
  -- Count remaining entries with empty context_words
  SELECT COUNT(*) INTO empty_context_count
  FROM dictionary_entries
  WHERE zhuyin_variants IS NOT NULL
    AND length(simp) = 1
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(zhuyin_variants) v
      WHERE v->'context_words' IS NULL
         OR jsonb_array_length(v->'context_words') = 0
    );

  RAISE NOTICE 'Remaining entries with empty context_words: %', empty_context_count;
END $$;

COMMIT;
`;

// Write to file
const outputPath = path.join(migrationsDir, '011g_fill_context_words.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Migration written to: ${outputPath}`);
