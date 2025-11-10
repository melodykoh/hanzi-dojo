// Generate SQL migration from dictionary JSON
import fs from 'fs';

const dictData = JSON.parse(fs.readFileSync('./data/dictionary_expansion_v2.json', 'utf-8'));

console.log(`Generating SQL migration for ${dictData.entries.length} characters...`);

let sql = `-- Dictionary Expansion Migration
-- Adds ${dictData.entries.length} HSK 1-4 characters to production dictionary
-- Generated: ${new Date().toISOString()}
-- Source: HSK 1-4 official word lists (processed via pinyin library)
-- Note: Uses ON CONFLICT DO UPDATE to handle duplicates and update pronunciations

INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank) VALUES\n`;

const values = dictData.entries.map((entry, index) => {
  const zhuyinJson = JSON.stringify(entry.zhuyin);
  return `  ('${entry.simp}', '${entry.trad}', '${zhuyinJson}'::jsonb, ${entry.frequency_rank})`;
});

sql += values.join(',\n');

// Add ON CONFLICT to update existing entries with new multi-pronunciation data
sql += '\nON CONFLICT (simp) DO UPDATE SET\n';
sql += '  zhuyin = EXCLUDED.zhuyin,\n';
sql += '  trad = EXCLUDED.trad,\n';
sql += '  frequency_rank = EXCLUDED.frequency_rank;\n';

sql += '\n-- Migration complete\n';
sql += `-- Total characters added/updated: ${dictData.entries.length}\n`;
sql += `-- Dictionary size after migration: ~1075 characters\n`;
sql += `-- Note: Existing entries updated with complete multi-pronunciation data\n`;

fs.writeFileSync('./supabase/migrations/009_expand_dictionary_hsk1-4.sql', sql);

console.log(`✅ Migration saved to supabase/migrations/009_expand_dictionary_hsk1-4.sql`);
console.log(`   Characters: ${dictData.entries.length}`);
console.log(`   File size: ${(sql.length / 1024).toFixed(1)} KB`);
