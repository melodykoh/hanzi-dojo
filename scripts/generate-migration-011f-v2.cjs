#!/usr/bin/env node
/**
 * Generate Migration 011f v2: Comprehensive Multi-Pronunciation Coverage
 *
 * This script properly:
 * 1. Reads existing zhuyin from dictionary entries
 * 2. Uses polyphone context reference for context words
 * 3. Generates proper Pattern A structure
 * 4. Outputs ready-to-apply SQL (not drafts)
 *
 * Key insight: Our dictionary already has zhuyin for default pronunciation.
 * We need to ADD variant pronunciations with their context words.
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
  'polyphone_gap_analysis.json',
  'polyphone_context_reference.json',
  'polyphone_reference.json',
  'context_words_research.json'
];

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Required file not found: ${filePath}`);
    process.exit(1);
  }
});

// Load data
const gapAnalysis = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_gap_analysis.json'), 'utf-8'));
const polyphoneContext = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_context_reference.json'), 'utf-8'));
const polyphoneBasicArray = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_reference.json'), 'utf-8'));
const contextResearch = JSON.parse(fs.readFileSync(path.join(dataDir, 'context_words_research.json'), 'utf-8'));

// Load dictionaries using shared utility
const { v1: dictionaryV1, v2: dictionaryV2 } = loadDictionaries();

// Build lookup maps
const polyphoneBasic = {};
polyphoneBasicArray.forEach(entry => {
  polyphoneBasic[entry.char] = entry.pinyin;
});

const dictLookup = buildCharacterLookup(dictionaryV1, dictionaryV2);

// Generate SQL for a single character
function generateCharacterSQL(charData) {
  const { char, hasContextAvailable, contextData } = charData;
  const dictEntry = dictLookup[char];

  if (!dictEntry) {
    console.error(`Character ${char} not found in dictionary!`);
    return null;
  }

  const pinyinList = polyphoneBasic[char] || [];
  const variants = [];

  // Check if we have researched context data for this character
  const researchedData = contextResearch.characters[char];

  if (hasContextAvailable && contextData) {
    // Use context data from reference
    for (const [pinyin, contexts] of Object.entries(contextData)) {
      const contextWords = [
        ...(contexts[0] || []),
        ...(contexts[1] || []),
        ...(contexts[2] || [])
      ].slice(0, 5);

      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: contextWords,
        meanings: dictEntry.meanings || []
      });
    }
  } else if (researchedData) {
    // Use manually researched data
    for (const [pinyin, data] of Object.entries(researchedData.pronunciations)) {
      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: data.context_words || [],
        meanings: dictEntry.meanings || []
      });
    }
  } else {
    // No context data - use basic pinyin list with empty context
    for (const pinyin of pinyinList) {
      variants.push({
        pinyin,
        zhuyin: pinyinToZhuyinArray(pinyin),
        context_words: [], // Will need manual filling
        meanings: dictEntry.meanings || []
      });
    }
  }

  if (variants.length === 0) {
    console.warn(`  Warning: No variants generated for ${char}`);
    return null;
  }

  // Validate JSONB structure before serialization
  try {
    validateVariants(variants, char);
  } catch (error) {
    console.error(`Validation failed for ${char}:`, error.message);
    throw error;
  }

  // Format as SQL
  const variantsJson = JSON.stringify(variants);
  let contextNote;
  if (hasContextAvailable) {
    contextNote = 'Has context from reference';
  } else if (researchedData) {
    contextNote = 'Has researched context (MDBG)';
  } else {
    contextNote = 'NEEDS CONTEXT WORDS';
  }

  return `-- Character: ${char} (${dictEntry.trad}) - ${contextNote}
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${escapeSql(char)}'
  AND trad = '${escapeSql(dictEntry.trad)}';
`;
}

// Main function
function main() {
  const needsWork = gapAnalysis.needsWork;

  console.log(`\nGenerating Migration 011f v2...`);
  console.log(`Processing ${needsWork.length} characters...\n`);

  const withContext = needsWork.filter(c => c.hasContextAvailable);
  const needsLookup = needsWork.filter(c => !c.hasContextAvailable);

  console.log(`  - With context data: ${withContext.length}`);
  console.log(`  - Need manual context: ${needsLookup.length}\n`);

  // Generate header
  let sql = `-- Migration 011f: Comprehensive Multi-Pronunciation Coverage
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Problem: 94 characters in our dictionary are polyphones (multiple pronunciations)
-- but lack proper zhuyin_variants. This causes "silent miseducation" where valid
-- alternate pronunciations appear as wrong answers in Drill A.
--
-- This migration adds zhuyin_variants to all 94 missing characters:
-- - 47 characters have context words from polyphone reference
-- - 47 characters need manual context word research (marked in SQL)
--
-- Characters: ${needsWork.map(c => c.char).join(', ')}

BEGIN;

-- Safety check: Ensure all characters exist before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN ('${needsWork.map(c => c.char).join("', '")}');

  IF char_count != ${needsWork.length} THEN
    RAISE EXCEPTION 'Expected ${needsWork.length} characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All ${needsWork.length} characters exist';
END $$;

-- ============================================================================
-- SECTION 1: Characters with context words (${withContext.length} chars)
-- ============================================================================

`;

  // Generate SQL for chars with context
  for (const charData of withContext) {
    const sqlSnippet = generateCharacterSQL(charData);
    if (sqlSnippet) {
      sql += sqlSnippet + '\n';
    }
  }

  sql += `
-- ============================================================================
-- SECTION 2: Characters needing context research (${needsLookup.length} chars)
-- NOTE: These have empty context_words - needs manual research
-- ============================================================================

`;

  // Generate SQL for chars needing lookup
  for (const charData of needsLookup) {
    const sqlSnippet = generateCharacterSQL(charData);
    if (sqlSnippet) {
      sql += sqlSnippet + '\n';
    }
  }

  sql += `
-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  total_with_variants INT;
  chars_updated INT;
BEGIN
  SELECT COUNT(*) INTO total_with_variants
  FROM dictionary_entries
  WHERE length(simp) = 1 AND zhuyin_variants IS NOT NULL;

  RAISE NOTICE 'Total characters with zhuyin_variants: %', total_with_variants;
  RAISE NOTICE 'Expected: ~230 (136 existing + 94 new)';
END $$;

COMMIT;
`;

  // Write to file
  const outputPath = path.join(migrationsDir, '011f_comprehensive_multi_pronunciation.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`Migration written to: ${outputPath}`);
  console.log('\n⚠️  Review before applying - check zhuyin accuracy and context words!');
}

main();
