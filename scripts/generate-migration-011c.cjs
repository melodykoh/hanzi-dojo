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

const characters = dataset.characters || []

if (characters.length === 0) {
  throw new Error('Dataset has no characters. Run build-epic8-multi-pronunciations.cjs first.')
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
-- Characters: ${characters.length}

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
console.log('✅ Migration 011c written to', outputPath)
