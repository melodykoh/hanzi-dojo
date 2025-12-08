#!/usr/bin/env node
/**
 * Polyphone Gap Analysis Script
 *
 * Cross-references our dictionary with polyphone reference data to identify:
 * 1. Characters in our dictionary that ARE polyphones (need zhuyin_variants)
 * 2. Characters that already have zhuyin_variants
 * 3. Characters that need zhuyin_variants added
 * 4. Characters that have empty context_words
 */

const fs = require('fs');
const path = require('path');

// Load data files
const dataDir = path.join(__dirname, '..', 'data');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Our dictionary (from expansion file)
const dictionaryV2 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_expansion_v2.json'), 'utf-8'));
const dictionaryV1 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_seed_v1.json'), 'utf-8'));

// Polyphone references
const polyphoneBasicArray = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_reference.json'), 'utf-8'));
const polyphoneContext = JSON.parse(fs.readFileSync(path.join(dataDir, 'polyphone_context_reference.json'), 'utf-8'));

// Convert array to object keyed by char
const polyphoneBasic = {};
polyphoneBasicArray.forEach(entry => {
  polyphoneBasic[entry.char] = entry.pinyin;
});

// Combine dictionaries to get all our characters
const ourChars = new Set();
dictionaryV1.entries.forEach(e => ourChars.add(e.simp));
dictionaryV2.entries.forEach(e => ourChars.add(e.simp));

console.log('=== POLYPHONE GAP ANALYSIS ===\n');
console.log(`Total characters in our dictionary: ${ourChars.size}`);
console.log(`Total polyphone characters (basic reference): ${Object.keys(polyphoneBasic).length}`);
console.log(`Total polyphone characters (with context words): ${Object.keys(polyphoneContext).length}`);

// Find polyphones in our dictionary
const polyphonesInDict = [];
const basicPolyphoneSet = new Set(Object.keys(polyphoneBasic));
const contextPolyphoneSet = new Set(Object.keys(polyphoneContext));

ourChars.forEach(char => {
  if (basicPolyphoneSet.has(char)) {
    polyphonesInDict.push({
      char,
      hasContext: contextPolyphoneSet.has(char),
      pronunciations: Object.keys(polyphoneBasic[char])
    });
  }
});

console.log(`\nPolyphones in our dictionary: ${polyphonesInDict.length}`);
console.log(`  - With context words available: ${polyphonesInDict.filter(p => p.hasContext).length}`);
console.log(`  - Without context words: ${polyphonesInDict.filter(p => !p.hasContext).length}`);

// Parse existing migrations to find characters already handled
const handledChars = new Set();

// Migration 011b - Pattern A curated
const migration011bPath = path.join(migrationsDir, '011b_pattern_a_structure.sql');
if (fs.existsSync(migration011bPath)) {
  const content = fs.readFileSync(migration011bPath, 'utf-8');
  const matches = content.match(/WHERE simp = '(.)'/g);
  if (matches) {
    matches.forEach(m => {
      const char = m.match(/WHERE simp = '(.)'/)[1];
      handledChars.add(char);
    });
  }
}

// Migration 011c - Auto-generated
const migration011cPath = path.join(migrationsDir, '011c_dictionary_multi_pronunciations.sql');
if (fs.existsSync(migration011cPath)) {
  const content = fs.readFileSync(migration011cPath, 'utf-8');
  const matches = content.match(/WHERE simp = '(.)'/g);
  if (matches) {
    matches.forEach(m => {
      const char = m.match(/WHERE simp = '(.)'/)[1];
      handledChars.add(char);
    });
  }
}

// Migration 011e - Malformed fixes
const migration011ePath = path.join(migrationsDir, '011e_fix_malformed_zhuyin.sql');
if (fs.existsSync(migration011ePath)) {
  const content = fs.readFileSync(migration011ePath, 'utf-8');
  const matches = content.match(/WHERE simp = '(.)'/g);
  if (matches) {
    matches.forEach(m => {
      const char = m.match(/WHERE simp = '(.)'/)[1];
      handledChars.add(char);
    });
  }
}

console.log(`\nCharacters already handled in migrations (011b/011c/011e): ${handledChars.size}`);

// Find the gap
const needsVariants = [];
const alreadyHandled = [];

polyphonesInDict.forEach(p => {
  if (handledChars.has(p.char)) {
    alreadyHandled.push(p);
  } else {
    needsVariants.push(p);
  }
});

console.log(`\n=== GAP ANALYSIS ===`);
console.log(`Already have zhuyin_variants: ${alreadyHandled.length}`);
console.log(`NEED zhuyin_variants: ${needsVariants.length}`);

if (needsVariants.length > 0) {
  console.log(`\n=== CHARACTERS NEEDING WORK ===`);

  const withContext = needsVariants.filter(p => p.hasContext);
  const withoutContext = needsVariants.filter(p => !p.hasContext);

  console.log(`\nWith context words available (${withContext.length}):`);
  withContext.forEach(p => {
    console.log(`  ${p.char}: ${p.pronunciations.join(', ')}`);
  });

  console.log(`\nWithout context words - need MDBG lookup (${withoutContext.length}):`);
  withoutContext.forEach(p => {
    console.log(`  ${p.char}: ${p.pronunciations.join(', ')}`);
  });
}

// Check for empty context_words in existing migrations
console.log(`\n=== EMPTY CONTEXT_WORDS CHECK ===`);

// Parse 011c to find entries with empty context_words
if (fs.existsSync(migration011cPath)) {
  const content = fs.readFileSync(migration011cPath, 'utf-8');
  const emptyContextMatches = content.match(/"context_words":\[\]/g);
  console.log(`Migration 011c entries with empty context_words: ${emptyContextMatches ? emptyContextMatches.length : 0}`);
}

// Output summary for documentation
console.log(`\n=== SUMMARY ===`);
console.log(`Total dictionary characters: ${ourChars.size}`);
console.log(`Polyphones in our dictionary: ${polyphonesInDict.length}`);
console.log(`Already handled: ${alreadyHandled.length}`);
console.log(`Gap (need variants): ${needsVariants.length}`);

// Save results to JSON for further processing
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    totalDictionaryChars: ourChars.size,
    polyphonesInDictionary: polyphonesInDict.length,
    alreadyHandled: alreadyHandled.length,
    needVariants: needsVariants.length
  },
  needsWork: needsVariants.map(p => ({
    char: p.char,
    pronunciations: p.pronunciations,
    hasContextAvailable: p.hasContext,
    contextData: p.hasContext ? polyphoneContext[p.char] : null
  })),
  alreadyHandled: alreadyHandled.map(p => p.char)
};

fs.writeFileSync(
  path.join(dataDir, 'polyphone_gap_analysis.json'),
  JSON.stringify(results, null, 2)
);

console.log(`\nResults saved to: data/polyphone_gap_analysis.json`);
