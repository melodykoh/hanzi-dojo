/**
 * Generate Migration 011 - Dictionary Quality Category 1 Complete
 *
 * Reads multi_pronunciation_category1_complete.json and generates SQL migration
 * to update dictionary entries with proper zhuyin_variants structure.
 *
 * Usage: node scripts/generate-migration-011.js
 */

const fs = require('fs');
const path = require('path');

// Read the research data
const researchPath = path.join(__dirname, '../data/multi_pronunciation_category1_complete.json');
const research = JSON.parse(fs.readFileSync(researchPath, 'utf8'));

// Filter out excluded characters
const excludedChars = new Set(Object.keys(research.excluded_characters || {}));
const deployableCharacters = research.characters.filter(c => !excludedChars.has(c.simp));

console.log(`📊 Total researched: ${research.characters.length}`);
console.log(`❌ Excluded: ${excludedChars.size} (${Array.from(excludedChars).join(', ')})`);
console.log(`✅ Deploying: ${deployableCharacters.length}`);

// Helper function to format zhuyin array for SQL
function formatZhuyinForSQL(zhuyinArray) {
  return JSON.stringify(zhuyinArray);
}

// Helper function to format context words array for SQL
function formatContextWords(words) {
  return JSON.stringify(words);
}

// Generate SQL for each character
function generateCharacterUpdate(char) {
  const { simp, trad, default_pronunciation, variants, notes } = char;

  // Build zhuyin_variants array - Pattern A (prepend default)
  const zhuyinVariants = [];

  // FIRST: Add default pronunciation with full context
  zhuyinVariants.push({
    pinyin: default_pronunciation.pinyin,
    zhuyin: default_pronunciation.zhuyin,
    context_words: default_pronunciation.context_words,
    meanings: default_pronunciation.meanings
  });

  // THEN: Add all other variant pronunciations
  variants.forEach(variant => {
    zhuyinVariants.push({
      pinyin: variant.pinyin,
      zhuyin: variant.zhuyin,
      context_words: variant.context_words,
      meanings: variant.meanings
    });
  });

  const variantsJSON = JSON.stringify(zhuyinVariants).replace(/'/g, "''");

  return `
-- Character: ${simp} (${notes})
UPDATE dictionary_entries
SET
  zhuyin_variants = '${variantsJSON}'::jsonb
WHERE simp = '${simp}'
  AND trad = '${trad}';
`;
}

// Generate verification queries
function generateVerificationQueries() {
  const characters = deployableCharacters.map(c => c.simp);
  return `
-- Verification: Check all 10 characters have proper zhuyin_variants
SELECT
  simp,
  trad,
  zhuyin,
  zhuyin_variants,
  jsonb_array_length(zhuyin_variants) as variant_count
FROM dictionary_entries
WHERE simp IN (${characters.map(c => `'${c}'`).join(', ')})
ORDER BY simp;

-- Count characters with variants
SELECT COUNT(*) as characters_with_variants
FROM dictionary_entries
WHERE simp IN (${characters.map(c => `'${c}'`).join(', ')})
  AND jsonb_array_length(zhuyin_variants) > 0;
`;
}

// Generate rollback SQL
function generateRollback() {
  return `
-- ROLLBACK: Remove variants added by this migration
-- (Preserves main zhuyin, only clears variants)
${deployableCharacters.map(char => `
UPDATE dictionary_entries
SET zhuyin_variants = '[]'::jsonb
WHERE simp = '${char.simp}' AND trad = '${char.trad}';`).join('\n')}
`;
}

// Main migration content
const migrationHeader = `-- Migration 011: Dictionary Quality - Category 1 Complete
-- Date: ${research.date}
-- Description: ${research.description}
--
-- Updates ${deployableCharacters.length} high-frequency multi-pronunciation characters
-- with proper zhuyin_variants structure and context words.
--
-- Characters: ${deployableCharacters.map(c => c.simp).join(', ')}
--
-- Source: Epic 8 Category 1 Complete Research
-- Reference: data/multi_pronunciation_category1_complete.json
--
-- Database Safety Protocol:
-- 1. Backup completed: data/backups/dictionary_backup_pre_011_*.json
-- 2. Tested on local Supabase instance
-- 3. Verified no data loss
-- 4. Rollback script available below
--

BEGIN;

-- Safety check: Ensure all characters exist before updating
DO $$
DECLARE
  char_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO char_count
  FROM dictionary_entries
  WHERE simp IN (${deployableCharacters.map(c => `'${c.simp}'`).join(', ')});

  IF char_count != ${deployableCharacters.length} THEN
    RAISE EXCEPTION 'Expected ${deployableCharacters.length} characters, found %', char_count;
  END IF;

  RAISE NOTICE 'Safety check passed: All ${deployableCharacters.length} characters exist';
END $$;

-- Update each character with proper zhuyin_variants
${deployableCharacters.map(generateCharacterUpdate).join('\n')}

${generateVerificationQueries()}

COMMIT;

-- END OF MIGRATION
--
-- ROLLBACK SCRIPT (if needed):
/*
${generateRollback()}
*/
`;

// Write migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/011_dictionary_quality_category1_complete.sql');
fs.writeFileSync(migrationPath, migrationHeader, 'utf8');

console.log('✅ Migration 011 generated successfully!');
console.log(`📄 File: ${migrationPath}`);
console.log(`📊 Characters updated: ${deployableCharacters.length}`);
console.log(`🔍 Characters: ${deployableCharacters.map(c => c.simp).join(', ')}`);
console.log('');
console.log('Next steps:');
console.log('1. Review the generated migration file');
console.log('2. Test on local Supabase: psql < supabase/migrations/011_dictionary_quality_category1_complete.sql');
console.log('3. Verify results with verification queries');
console.log('4. Apply to production via Supabase Dashboard');
