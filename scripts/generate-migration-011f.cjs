#!/usr/bin/env node
/**
 * Generate Migration 011f: Add zhuyin_variants to 94 missing characters
 *
 * This script:
 * 1. Uses polyphone_gap_analysis.json to identify 94 chars needing variants
 * 2. Uses polyphone_context_reference.json for 47 chars with context data
 * 3. Uses polyphone_reference.json + MDBG lookup for 47 chars without context
 * 4. Generates SQL migration file
 */

const fs = require('fs');
const path = require('path');
const { escapeSql } = require('./lib/sqlUtils.cjs');

const dataDir = path.join(__dirname, '..', 'data');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Load data
const gapAnalysis = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_gap_analysis.json'), 'utf-8'));
const polyphoneContext = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_context_reference.json'), 'utf-8'));
const polyphoneBasicArray = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_reference.json'), 'utf-8'));
const dictionaryV2 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_expansion_v2.json'), 'utf-8'));
const dictionaryV1 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_seed_v1.json'), 'utf-8'));

// Build lookup maps
const polyphoneBasic = {};
polyphoneBasicArray.forEach(entry => {
  polyphoneBasic[entry.char] = entry.pinyin;
});

const dictLookup = {};
[...dictionaryV1.entries, ...dictionaryV2.entries].forEach(e => {
  dictLookup[e.simp] = e;
});

// Pinyin to Zhuyin conversion table (basic)
const pinyinToZhuyin = {
  // Initials
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  'y': '', 'w': '',
  // Finals
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ', 'v': 'ㄩ',
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'ong': 'ㄨㄥ',
  'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ', 'iou': 'ㄧㄡ',
  'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ', 'iong': 'ㄩㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
  'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uen': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ueng': 'ㄨㄥ',
  'üe': 'ㄩㄝ', 've': 'ㄩㄝ', 'ue': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'van': 'ㄩㄢ', 'ün': 'ㄩㄣ', 'vn': 'ㄩㄣ',
  // Tone marks
  'ā': 'aˉ', 'á': 'aˊ', 'ǎ': 'aˇ', 'à': 'aˋ',
  'ē': 'eˉ', 'é': 'eˊ', 'ě': 'eˇ', 'è': 'eˋ',
  'ī': 'iˉ', 'í': 'iˊ', 'ǐ': 'iˇ', 'ì': 'iˋ',
  'ō': 'oˉ', 'ó': 'oˊ', 'ǒ': 'oˇ', 'ò': 'oˋ',
  'ū': 'uˉ', 'ú': 'uˊ', 'ǔ': 'uˇ', 'ù': 'uˋ',
  'ǖ': 'üˉ', 'ǘ': 'üˊ', 'ǚ': 'üˇ', 'ǜ': 'üˋ',
};

// Convert context words from simplified to traditional (placeholder - needs real data)
// For now, use simplified as Traditional chars require dictionary lookup
function getTraditional(simp) {
  const entry = dictLookup[simp];
  return entry ? entry.trad : simp;
}

// Extract tone from pinyin
function getTone(pinyin) {
  const toneMarks = {
    'ā': '1', 'á': '2', 'ǎ': '3', 'à': '4',
    'ē': '1', 'é': '2', 'ě': '3', 'è': '4',
    'ī': '1', 'í': '2', 'ǐ': '3', 'ì': '4',
    'ō': '1', 'ó': '2', 'ǒ': '3', 'ò': '4',
    'ū': '1', 'ú': '2', 'ǔ': '3', 'ù': '4',
    'ǖ': '1', 'ǘ': '2', 'ǚ': '3', 'ǜ': '4',
  };
  for (const [mark, tone] of Object.entries(toneMarks)) {
    if (pinyin.includes(mark)) return tone;
  }
  return '5'; // neutral tone
}

// Get tone marker for zhuyin
function getToneMarker(tone) {
  const markers = { '1': 'ˉ', '2': 'ˊ', '3': 'ˇ', '4': 'ˋ', '5': '˙' };
  return markers[tone] || 'ˉ';
}

// Simple pinyin to zhuyin conversion (for demonstration - real implementation would be more comprehensive)
function convertPinyinToZhuyin(pinyin) {
  // This is a simplified conversion - real implementation needs full pinyin parsing
  // For now, return placeholder that needs manual review
  const tone = getTone(pinyin);
  const toneMarker = getToneMarker(tone);

  // Remove tone marks from pinyin for processing
  const basePinyin = pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü');

  // For neutral tone words ending in consonants
  if (pinyin.endsWith('e') || pinyin.endsWith('a') || pinyin.endsWith('o')) {
    // Neutral tone particle
  }

  // Return placeholder - will need manual verification
  return { initial: '', final: basePinyin, tone: toneMarker };
}

// Generate SQL for a character with context data
function generateSQLForCharWithContext(char, contextData) {
  const dictEntry = dictLookup[char];
  if (!dictEntry) {
    console.error(`Character ${char} not found in dictionary`);
    return null;
  }

  const variants = [];

  // Process each pronunciation from context data
  for (const [pinyin, contexts] of Object.entries(contextData)) {
    // contexts is [[beginning], [middle], [end]]
    const contextWords = [...(contexts[0] || []), ...(contexts[1] || []), ...(contexts[2] || [])];

    // Use existing zhuyin from dictionary if available, otherwise generate placeholder
    const existingZhuyin = dictEntry.zhuyin;
    const zhuyinPlaceholder = `[["TODO","${pinyin}","TODO"]]`;

    variants.push({
      pinyin,
      zhuyin: zhuyinPlaceholder,
      context_words: contextWords.slice(0, 5), // Limit to 5 context words
      meanings: dictEntry.meanings || []
    });
  }

  // Format as SQL
  const variantsJson = JSON.stringify(variants);

  return `
-- Character: ${char} (${dictEntry.trad})
-- NEEDS REVIEW: Zhuyin placeholders need manual verification
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${escapeSql(char)}'
  AND trad = '${escapeSql(dictEntry.trad)}';
`;
}

// Generate SQL for a character needing MDBG lookup
function generateSQLForCharNeedingLookup(char) {
  const dictEntry = dictLookup[char];
  if (!dictEntry) {
    console.error(`Character ${char} not found in dictionary`);
    return null;
  }

  const pinyinList = polyphoneBasic[char] || [];

  // Create placeholder variants
  const variants = pinyinList.map(pinyin => ({
    pinyin,
    zhuyin: `[["TODO","${pinyin}","TODO"]]`,
    context_words: [], // Needs MDBG lookup
    meanings: dictEntry.meanings || []
  }));

  const variantsJson = JSON.stringify(variants);

  return `
-- Character: ${char} (${dictEntry.trad})
-- NEEDS MDBG LOOKUP: Context words and zhuyin need to be added manually
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

  console.log(`Processing ${needsWork.length} characters...`);

  const withContext = needsWork.filter(c => c.hasContextAvailable);
  const needsLookup = needsWork.filter(c => !c.hasContextAvailable);

  console.log(`  - With context data: ${withContext.length}`);
  console.log(`  - Need MDBG lookup: ${needsLookup.length}`);

  // Generate header
  let sql = `-- Migration 011f: Comprehensive Multi-Pronunciation Coverage
-- Date: 2025-12-08
-- Issue: #26 (https://github.com/melodykoh/hanzi-dojo/issues/26)
--
-- Problem: 94 characters in our dictionary are polyphones (multiple pronunciations)
-- but lack proper zhuyin_variants. This causes "silent miseducation" where valid
-- alternate pronunciations appear as wrong answers in Drill A.
--
-- This migration adds zhuyin_variants to all 94 missing characters.
--
-- NOTE: This is a DRAFT migration that needs manual review:
-- - Zhuyin values need to be corrected from placeholders
-- - Context words may need Traditional Chinese conversion
-- - Some context words from reference may be simplified Chinese
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
-- SECTION 1: Characters with context data available (${withContext.length} chars)
-- These have context words from polyphoneContext reference
-- ============================================================================

`;

  // Generate SQL for chars with context
  for (const charData of withContext) {
    const sqlSnippet = generateSQLForCharWithContext(charData.char, charData.contextData);
    if (sqlSnippet) {
      sql += sqlSnippet + '\n';
    }
  }

  sql += `
-- ============================================================================
-- SECTION 2: Characters needing MDBG lookup (${needsLookup.length} chars)
-- These need manual research for context words
-- ============================================================================

`;

  // Generate SQL for chars needing lookup
  for (const charData of needsLookup) {
    const sqlSnippet = generateSQLForCharNeedingLookup(charData.char);
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
BEGIN
  SELECT COUNT(*) INTO total_with_variants
  FROM dictionary_entries
  WHERE length(simp) = 1 AND zhuyin_variants IS NOT NULL;

  RAISE NOTICE 'Total characters with zhuyin_variants after migration: %', total_with_variants;
END $$;

COMMIT;
`;

  // Write to file
  const outputPath = path.join(migrationsDir, '011f_comprehensive_multi_pronunciation_draft.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`\nDraft migration written to: ${outputPath}`);
  console.log('\n⚠️  This is a DRAFT - manual review required before applying!');
}

main();
