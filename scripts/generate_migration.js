// Generate SQL migration from dictionary JSON
import fs from 'fs';

const dictData = JSON.parse(fs.readFileSync('./data/dictionary_expansion_v2.json', 'utf-8'));

console.log(`Generating SQL migration for ${dictData.entries.length} characters...`);

let sql = `-- Dictionary Expansion Migration
-- Adds ${dictData.entries.length} HSK 1-4 characters to production dictionary
-- Generated: ${new Date().toISOString()}
-- Source: HSK 1-4 official word lists (processed via pinyin library)

INSERT INTO dictionary_entries (simp, trad, zhuyin, frequency_rank) VALUES\n`;

const values = dictData.entries.map((entry, index) => {
  const zhuyinJson = JSON.stringify(entry.zhuyin);
  const isLast = index === dictData.entries.length - 1;
  return `  ('${entry.simp}', '${entry.trad}', '${zhuyinJson}'::jsonb, ${entry.frequency_rank})${isLast ? ';' : ','}`;
});

sql += values.join('\n');

sql += '\n\n-- Migration complete\n';
sql += `-- Total characters added: ${dictData.entries.length}\n`;
sql += `-- Dictionary size after migration: ~1075 characters\n`;

fs.writeFileSync('./supabase/migrations/009_expand_dictionary_hsk1-4.sql', sql);

console.log(`✅ Migration saved to supabase/migrations/009_expand_dictionary_hsk1-4.sql`);
console.log(`   Characters: ${dictData.entries.length}`);
console.log(`   File size: ${(sql.length / 1024).toFixed(1)} KB`);
