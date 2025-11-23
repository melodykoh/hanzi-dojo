#!/usr/bin/env node

/**
 * Generate Migration 011c - Auto multi-pronunciation Pattern A updates
 *
 * Consumes data/multi_pronunciation_epic8_auto.json and emits SQL that
 * normalizes zhuyin_variants for every pending Epic 8 character.
 */

const fs = require('fs')
const path = require('path')

const datasetPath = path.join(__dirname, '../data/multi_pronunciation_epic8_auto.json')
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'))

// CRITICAL: Exclude 35 characters already deployed in Migration 011b (Session 11)
// These have curated Pattern A structure with context words that must be preserved
const EXCLUDE_CHARS = [
  '为', '什', '传', '供', '便', '假', '几', '切', '划', '地',
  '场', '将', '应', '弹', '扫', '把', '担', '教', '更', '正',
  '没', '相', '省', '种', '系', '结', '给', '行', '觉', '角',
  '调', '还', '都', '重', '量'
]; // 35 characters from Migration 011b - DO NOT OVERWRITE

const allCharacters = dataset.characters || []
const characters = allCharacters.filter(char => !EXCLUDE_CHARS.includes(char.simp))

console.log(`📊 Total in dataset: ${allCharacters.length}`)
console.log(`🚫 Excluded (Migration 011b): ${EXCLUDE_CHARS.length}`)
console.log(`✅ Characters to deploy: ${characters.length}`)

if (characters.length === 0) {
  throw new Error('No characters to deploy after exclusions. Check EXCLUDE_CHARS list.')
}

if (allCharacters.length - characters.length !== EXCLUDE_CHARS.length) {
  console.warn(`⚠️  Warning: Expected to exclude ${EXCLUDE_CHARS.length} characters, but filtered ${allCharacters.length - characters.length}`)
  console.warn('   Some exclusion characters may not exist in the dataset.')
}

function formatVariants(char) {
  const variants = [char.default_pronunciation, ...(char.variants || [])]
  const payload = variants.map(variant => ({
    pinyin: variant.pinyin || '',
    zhuyin: variant.zhuyin || [],
    context_words: variant.context_words || [],
    meanings: variant.meanings || []
  }))
  return JSON.stringify(payload).replace(/'/g, "''")
}

const safetyList = characters.map(char => `'${char.simp}'`).join(', ')

const updates = characters.map(char => {
  const variantsJSON = formatVariants(char)
  return `-- Character: ${char.simp} (${char.notes || 'auto-generated'})
UPDATE dictionary_entries
SET
  zhuyin_variants = '${variantsJSON}'::jsonb
WHERE simp = '${char.simp}'
  AND trad = '${char.trad}';
`
}).join('\n')

const migration = `-- Migration 011c: Dictionary Quality - Auto multi-pronunciation completion
-- Date: ${dataset.date}
-- Description: ${dataset.description}
-- Source: data/multi_pronunciation_epic8_auto.json
-- Total in dataset: ${allCharacters.length}
-- Excluded (Migration 011b): ${EXCLUDE_CHARS.length} (curated Pattern A entries preserved)
-- Characters to deploy: ${characters.length}
--
-- CRITICAL: This migration excludes 35 characters already deployed in Migration 011b
-- to prevent overwriting curated context words (175-350 words total).
--
-- Excluded characters: ${EXCLUDE_CHARS.join(', ')}

BEGIN;

DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN (${safetyList});

  IF char_count != ${characters.length} THEN
    RAISE EXCEPTION 'Expected ${characters.length} characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All ${characters.length} characters present.';
END $$;

${updates}

COMMIT;

-- Rollback helper
/*
${characters.map(char => `UPDATE dictionary_entries SET zhuyin_variants = '[]'::jsonb WHERE simp = '${char.simp}' AND trad = '${char.trad}';`).join('\n')}
*/
`

const outputPath = path.join(__dirname, '../supabase/migrations/011c_dictionary_multi_pronunciations.sql')
fs.writeFileSync(outputPath, migration)

console.log('')
console.log('✅ Migration 011c generated successfully!')
console.log(`📄 Output: ${outputPath}`)
console.log('')
console.log('📊 Summary:')
console.log(`   Total characters in dataset: ${allCharacters.length}`)
console.log(`   Excluded (Migration 011b):   ${EXCLUDE_CHARS.length}`)
console.log(`   Characters to deploy:        ${characters.length}`)
console.log('')
console.log('🛡️  Data Protection:')
console.log(`   Preserving ${EXCLUDE_CHARS.length} curated entries with ~${EXCLUDE_CHARS.length * 5}-${EXCLUDE_CHARS.length * 10} context words`)
console.log(`   Zero data loss from Migration 011b`)
console.log('')
console.log('Next steps:')
console.log('1. Review the generated migration file')
console.log('2. Verify character count matches expected value (101 characters)')
console.log('3. Test migration on staging database')
console.log('4. Apply to production via Supabase Dashboard')
