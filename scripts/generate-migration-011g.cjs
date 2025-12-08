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

const dataDir = path.join(__dirname, '..', 'data');
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Load researched context words
const contextResearch = JSON.parse(fs.readFileSync(path.join(dataDir, 'context_words_011c_remaining.json'), 'utf-8'));

// Load dictionary for trad mappings
const dictionaryV2 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_expansion_v2.json'), 'utf-8'));
const dictionaryV1 = JSON.parse(fs.readFileSync(path.join(dataDir, 'dictionary_seed_v1.json'), 'utf-8'));

const dictLookup = {};
[...dictionaryV1.entries, ...dictionaryV2.entries].forEach(e => {
  dictLookup[e.simp] = e;
});

// Pinyin to Zhuyin mapping (comprehensive)
const PINYIN_TO_ZHUYIN = {
  'me': { parts: ['ㄇ', 'ㄜ', '˙'] },
  'mó': { parts: ['ㄇ', 'ㄛ', 'ˊ'] },
  'huà': { parts: ['ㄏ', 'ㄨㄚ', 'ˋ'] },
  'huā': { parts: ['ㄏ', 'ㄨㄚ', 'ˉ'] },
  'chí': { parts: ['ㄔ', '', 'ˊ'] },
  'shi': { parts: ['ㄕ', '', '˙'] },
  'qū': { parts: ['ㄑ', 'ㄩ', 'ˉ'] },
  'ōu': { parts: ['', 'ㄡ', 'ˉ'] },
  'zhàn': { parts: ['ㄓ', 'ㄢ', 'ˋ'] },
  'zhān': { parts: ['ㄓ', 'ㄢ', 'ˉ'] },
  'kǎ': { parts: ['ㄎ', 'ㄚ', 'ˇ'] },
  'qiǎ': { parts: ['ㄑ', 'ㄧㄚ', 'ˇ'] },
  'yā': { parts: ['', 'ㄧㄚ', 'ˉ'] },
  'yà': { parts: ['', 'ㄧㄚ', 'ˋ'] },
  'jù': { parts: ['ㄐ', 'ㄩ', 'ˋ'] },
  'gōu': { parts: ['ㄍ', 'ㄡ', 'ˉ'] },
  'kě': { parts: ['ㄎ', 'ㄜ', 'ˇ'] },
  'kè': { parts: ['ㄎ', 'ㄜ', 'ˋ'] },
  'tái': { parts: ['ㄊ', 'ㄞ', 'ˊ'] },
  'tāi': { parts: ['ㄊ', 'ㄞ', 'ˉ'] },
  'gè': { parts: ['ㄍ', 'ㄜ', 'ˋ'] },
  'gě': { parts: ['ㄍ', 'ㄜ', 'ˇ'] },
  'hé': { parts: ['ㄏ', 'ㄜ', 'ˊ'] },
  'fǒu': { parts: ['ㄈ', 'ㄡ', 'ˇ'] },
  'pǐ': { parts: ['ㄆ', '', 'ˇ'] },
  'ba': { parts: ['ㄅ', 'ㄚ', '˙'] },
  'bā': { parts: ['ㄅ', 'ㄚ', 'ˉ'] },
  'ya': { parts: ['', 'ㄧㄚ', '˙'] },
  'kā': { parts: ['ㄎ', 'ㄚ', 'ˉ'] },
  'gā': { parts: ['ㄍ', 'ㄚ', 'ˉ'] },
  'ké': { parts: ['ㄎ', 'ㄜ', 'ˊ'] },
  'hāi': { parts: ['ㄏ', 'ㄞ', 'ˉ'] },
  'tián': { parts: ['ㄊ', 'ㄧㄢ', 'ˊ'] },
  'zhèn': { parts: ['ㄓ', 'ㄣ', 'ˋ'] },
  'fū': { parts: ['ㄈ', 'ㄨ', 'ˉ'] },
  'fú': { parts: ['ㄈ', 'ㄨ', 'ˊ'] },
  'qí': { parts: ['ㄑ', 'ㄧ', 'ˊ'] },
  'jī': { parts: ['ㄐ', 'ㄧ', 'ˉ'] },
  'qī': { parts: ['ㄑ', 'ㄧ', 'ˉ'] },
  'qì': { parts: ['ㄑ', 'ㄧ', 'ˋ'] },
  'sūn': { parts: ['ㄙ', 'ㄨㄣ', 'ˉ'] },
  'xùn': { parts: ['ㄒ', 'ㄩㄣ', 'ˋ'] },
  'dǐ': { parts: ['ㄉ', 'ㄧ', 'ˇ'] },
  'de': { parts: ['ㄉ', 'ㄜ', '˙'] },
  'dù': { parts: ['ㄉ', 'ㄨ', 'ˋ'] },
  'duó': { parts: ['ㄉ', 'ㄨㄛ', 'ˊ'] },
  'nòng': { parts: ['ㄋ', 'ㄨㄥ', 'ˋ'] },
  'lòng': { parts: ['ㄌ', 'ㄨㄥ', 'ˋ'] },
  'sī': { parts: ['ㄙ', '', 'ˉ'] },
  'sāi': { parts: ['ㄙ', 'ㄞ', 'ˉ'] },
  'yú': { parts: ['', 'ㄩ', 'ˊ'] },
  'tōu': { parts: ['ㄊ', 'ㄡ', 'ˉ'] },
  'xì': { parts: ['ㄒ', 'ㄧ', 'ˋ'] },
  'hū': { parts: ['ㄏ', 'ㄨ', 'ˉ'] },
  'dǎ': { parts: ['ㄉ', 'ㄚ', 'ˇ'] },
  'dá': { parts: ['ㄉ', 'ㄚ', 'ˊ'] },
  'zé': { parts: ['ㄗ', 'ㄜ', 'ˊ'] },
  'zhái': { parts: ['ㄓ', 'ㄞ', 'ˊ'] },
  'shí': { parts: ['ㄕ', '', 'ˊ'] },
  'shè': { parts: ['ㄕ', 'ㄜ', 'ˋ'] },
  'pái': { parts: ['ㄆ', 'ㄞ', 'ˊ'] },
  'pǎi': { parts: ['ㄆ', 'ㄞ', 'ˇ'] },
  'sàn': { parts: ['ㄙ', 'ㄢ', 'ˋ'] },
  'sǎn': { parts: ['ㄙ', 'ㄢ', 'ˇ'] },
  'jǐng': { parts: ['ㄐ', 'ㄧㄥ', 'ˇ'] },
  'yǐng': { parts: ['', 'ㄧㄥ', 'ˇ'] },
  'fù': { parts: ['ㄈ', 'ㄨ', 'ˋ'] },
  'tiáo': { parts: ['ㄊ', 'ㄧㄠ', 'ˊ'] },
  'tiāo': { parts: ['ㄊ', 'ㄧㄠ', 'ˉ'] },
  'chá': { parts: ['ㄔ', 'ㄚ', 'ˊ'] },
  'zhā': { parts: ['ㄓ', 'ㄚ', 'ˉ'] },
  'xiào': { parts: ['ㄒ', 'ㄧㄠ', 'ˋ'] },
  'jiào': { parts: ['ㄐ', 'ㄧㄠ', 'ˋ'] },
  'yǐ': { parts: ['', 'ㄧ', 'ˇ'] },
  'hàn': { parts: ['ㄏ', 'ㄢ', 'ˋ'] },
  'hán': { parts: ['ㄏ', 'ㄢ', 'ˊ'] },
  'tāng': { parts: ['ㄊ', 'ㄤ', 'ˉ'] },
  'shāng': { parts: ['ㄕ', 'ㄤ', 'ˉ'] },
  'shā': { parts: ['ㄕ', 'ㄚ', 'ˉ'] },
  'shà': { parts: ['ㄕ', 'ㄚ', 'ˋ'] },
  'jì': { parts: ['ㄐ', 'ㄧ', 'ˋ'] },
  'jǐ': { parts: ['ㄐ', 'ㄧ', 'ˇ'] },
  'fǔ': { parts: ['ㄈ', 'ㄨ', 'ˇ'] },
  'piàn': { parts: ['ㄆ', 'ㄧㄢ', 'ˋ'] },
  'piān': { parts: ['ㄆ', 'ㄧㄢ', 'ˉ'] },
  'shèn': { parts: ['ㄕ', 'ㄣ', 'ˋ'] },
  'shén': { parts: ['ㄕ', 'ㄣ', 'ˊ'] },
  'yí': { parts: ['', 'ㄧ', 'ˊ'] },
  'nǐ': { parts: ['ㄋ', 'ㄧ', 'ˇ'] },
  'yán': { parts: ['', 'ㄧㄢ', 'ˊ'] },
  'yàn': { parts: ['', 'ㄧㄢ', 'ˋ'] },
  'shuò': { parts: ['ㄕ', 'ㄨㄛ', 'ˋ'] },
  'piào': { parts: ['ㄆ', 'ㄧㄠ', 'ˋ'] },
  'piāo': { parts: ['ㄆ', 'ㄧㄠ', 'ˉ'] },
  'jìn': { parts: ['ㄐ', 'ㄧㄣ', 'ˋ'] },
  'jīn': { parts: ['ㄐ', 'ㄧㄣ', 'ˉ'] },
  'shāo': { parts: ['ㄕ', 'ㄠ', 'ˉ'] },
  'shào': { parts: ['ㄕ', 'ㄠ', 'ˋ'] },
  'yuē': { parts: ['', 'ㄩㄝ', 'ˉ'] },
  'yāo': { parts: ['', 'ㄧㄠ', 'ˉ'] },
  'dǔ': { parts: ['ㄉ', 'ㄨ', 'ˇ'] },
  'gē': { parts: ['ㄍ', 'ㄜ', 'ˉ'] },
  'gāo': { parts: ['ㄍ', 'ㄠ', 'ˉ'] },
  'gào': { parts: ['ㄍ', 'ㄠ', 'ˋ'] },
  'píng': { parts: ['ㄆ', 'ㄧㄥ', 'ˊ'] },
  'pēng': { parts: ['ㄆ', 'ㄥ', 'ˉ'] },
  'bèi': { parts: ['ㄅ', 'ㄟ', 'ˋ'] },
  'pī': { parts: ['ㄆ', '', 'ˉ'] },
  'guān': { parts: ['ㄍ', 'ㄨㄢ', 'ˉ'] },
  'guàn': { parts: ['ㄍ', 'ㄨㄢ', 'ˋ'] },
  'lùn': { parts: ['ㄌ', 'ㄨㄣ', 'ˋ'] },
  'lún': { parts: ['ㄌ', 'ㄨㄣ', 'ˊ'] },
  'yǔ': { parts: ['', 'ㄩ', 'ˇ'] },
  'yù': { parts: ['', 'ㄩ', 'ˋ'] },
  'shuí': { parts: ['ㄕ', 'ㄨㄟ', 'ˊ'] },
  'shéi': { parts: ['ㄕ', 'ㄟ', 'ˊ'] },
  'zhài': { parts: ['ㄓ', 'ㄞ', 'ˋ'] },
  'zhuàn': { parts: ['ㄓ', 'ㄨㄢ', 'ˋ'] },
  'zuàn': { parts: ['ㄗ', 'ㄨㄢ', 'ˋ'] },
  'tàng': { parts: ['ㄊ', 'ㄤ', 'ˋ'] },
  'qù': { parts: ['ㄑ', 'ㄩ', 'ˋ'] },
  'cù': { parts: ['ㄘ', 'ㄨ', 'ˋ'] },
  'tiào': { parts: ['ㄊ', 'ㄧㄠ', 'ˋ'] },
  'táo': { parts: ['ㄊ', 'ㄠ', 'ˊ'] },
  'gāng': { parts: ['ㄍ', 'ㄤ', 'ˉ'] },
  'gàng': { parts: ['ㄍ', 'ㄤ', 'ˋ'] },
};

function pinyinToZhuyinArray(pinyin) {
  const mapping = PINYIN_TO_ZHUYIN[pinyin];
  if (mapping) {
    return [mapping.parts];
  }
  console.warn(`  Warning: No zhuyin mapping for pinyin: ${pinyin}`);
  return [['TODO', pinyin, 'TODO']];
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

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

  const variantsJson = JSON.stringify(variants);

  sql += `-- Character: ${char} (${dictEntry.trad})
UPDATE dictionary_entries
SET
  zhuyin_variants = '${escapeSql(variantsJson)}'::jsonb
WHERE simp = '${char}'
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
