#!/usr/bin/env node
/**
 * Seed word_pairs table from CCCC vocabulary data
 * Run: node --env-file=.env.local scripts/seed-word-pairs.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seedWordPairs() {
  // Check for required environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    console.error('Run: node --env-file=.env.local scripts/seed-word-pairs.cjs');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Load pre-analyzed word pairs
  const dataPath = path.join(__dirname, '..', 'data', 'word_pairs_cccc_usable.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  const words = data.words;

  console.log(`Loaded ${words.length} word pairs from CCCC analysis`);
  console.log(`Source: ${data.source}`);
  console.log();

  // Get dictionary characters for validation
  console.log('Fetching dictionary entries for validation...');
  const { data: dictChars, error: dictError } = await supabase
    .from('dictionary_entries')
    .select('trad');

  if (dictError) {
    console.error('Failed to fetch dictionary:', dictError);
    process.exit(1);
  }

  const dictSet = new Set(dictChars?.map(d => d.trad) ?? []);
  console.log(`Dictionary contains ${dictSet.size} traditional characters`);
  console.log();

  // Validate word pairs
  const valid = [];
  const invalid = [];

  for (const w of words) {
    if (w.word_trad.length !== 2) {
      invalid.push({ word: w.word_trad, reason: 'Not 2 characters' });
    } else if (!dictSet.has(w.char1_trad)) {
      invalid.push({ word: w.word_trad, reason: `char1 "${w.char1_trad}" not in dictionary` });
    } else if (!dictSet.has(w.char2_trad)) {
      invalid.push({ word: w.word_trad, reason: `char2 "${w.char2_trad}" not in dictionary` });
    } else {
      valid.push(w);
    }
  }

  console.log('=== VALIDATION RESULTS ===');
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}`);

  if (invalid.length > 0) {
    console.log('\nInvalid pairs (first 20):');
    invalid.slice(0, 20).forEach(i => console.log(`  - ${i.word}: ${i.reason}`));
    if (invalid.length > 20) console.log(`  ... and ${invalid.length - 20} more`);
  }
  console.log();

  // Check for existing word pairs
  const { count: existingCount } = await supabase
    .from('word_pairs')
    .select('*', { count: 'exact', head: true });

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  Warning: word_pairs table already has ${existingCount} entries`);
    console.log('   Skipping insert to avoid duplicates.');
    console.log('   To re-seed, first run: DELETE FROM word_pairs;');
    process.exit(0);
  }

  // Insert valid pairs in batches
  const toInsert = valid.map(w => ({
    word: w.word_trad,
    char1: w.char1_trad,
    char2: w.char2_trad,
    category: w.category || null
  }));

  console.log(`Inserting ${toInsert.length} word pairs...`);

  // Batch insert (100 at a time to avoid payload limits)
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('word_pairs').insert(batch);

    if (error) {
      console.error(`Insert failed at batch ${i / batchSize + 1}:`, error);
      process.exit(1);
    }

    inserted += batch.length;
    process.stdout.write(`\r  Inserted: ${inserted}/${toInsert.length}`);
  }

  console.log('\n');
  console.log(`✅ Successfully inserted ${inserted} word pairs`);
  console.log();

  // Verify insertion
  const { count: finalCount } = await supabase
    .from('word_pairs')
    .select('*', { count: 'exact', head: true });

  console.log(`Final word_pairs count: ${finalCount}`);

  // Show sample entries
  const { data: samples } = await supabase
    .from('word_pairs')
    .select('*')
    .limit(5);

  console.log('\nSample entries:');
  samples?.forEach(s => {
    console.log(`  ${s.word} (${s.char1} + ${s.char2}) - ${s.category || 'no category'}`);
  });
}

seedWordPairs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
